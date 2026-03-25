import os
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras import layers, models, optimizers, callbacks
from sklearn.model_selection import train_test_split

# Set seeds for consistent results
np.random.seed(42)
tf.random.set_seed(42)

# CPU-Optimized Configuration
DATASET_DIR = "dataset"
LABELS_CSV = os.path.join(DATASET_DIR, "trainLabels.csv")
# Double nested directory based on project structure
IMAGES_DIR = os.path.join(DATASET_DIR, "resized_train", "resized_train")

# Check if inner folder exists, else use base folder
if not os.path.isdir(IMAGES_DIR):
    IMAGES_DIR = os.path.join(DATASET_DIR, "resized_train")

MODEL_PATH = "model/dr_model.h5"
TARGET_SIZE = (160, 160)  # Faster for CPU than 224x224
BATCH_SIZE = 32

def train_model():
    # 1. Load labels
    print(f"Reading labels from {LABELS_CSV}...")
    df = pd.read_csv(LABELS_CSV)
    
    # 2. Match image filenames (append extension)
    df['image_file'] = df['image'].apply(lambda x: f"{x}.jpeg")
    
    # Filter only available images
    print("Verifying image files...")
    existing_images = set(os.listdir(IMAGES_DIR))
    df = df[df['image_file'].isin(existing_images)].copy()
    
    # 3. Create Balanced Subset
    print("Calculating balanced sampling...")
    # Ensure all 5 levels exist
    available_levels = df['level'].unique()
    print(f"Available levels: {available_levels}")
    
    class_counts = df['level'].value_counts()
    min_count = class_counts.min()
    print(f"Class distribution:\n{class_counts}")
    print(f"Sampling {min_count} images from each of the {len(available_levels)} available levels...")
    
    # Simple sampling loop to avoid pandas version specific groupby issues
    balanced_chunks = []
    for level in available_levels:
        level_df = df[df['level'] == level].sample(n=min_count, random_state=42)
        balanced_chunks.append(level_df)
    
    balanced_df = pd.concat(balanced_chunks).reset_index(drop=True)
    balanced_df['level'] = balanced_df['level'].astype(str)
    print(f"Total training/validation samples: {len(balanced_df)}")

    # 4. Stratified Split (80% Train / 20% Val)
    train_df, val_df = train_test_split(balanced_df, test_size=0.2, stratify=balanced_df['level'], random_state=42)

    # 5. Fast Data Generators
    train_datagen = ImageDataGenerator(
        preprocessing_function=tf.keras.applications.mobilenet_v2.preprocess_input,
        rotation_range=15,
        width_shift_range=0.1,
        height_shift_range=0.1,
        horizontal_flip=True,
        zoom_range=0.1
    )
    val_datagen = ImageDataGenerator(
        preprocessing_function=tf.keras.applications.mobilenet_v2.preprocess_input
    )

    train_generator = train_datagen.flow_from_dataframe(
        train_df,
        directory=IMAGES_DIR,
        x_col="image_file",
        y_col="level",
        target_size=TARGET_SIZE,
        color_mode="rgb",
        class_mode="categorical",
        batch_size=BATCH_SIZE,
        shuffle=True
    )

    val_generator = val_datagen.flow_from_dataframe(
        val_df,
        directory=IMAGES_DIR,
        x_col="image_file",
        y_col="level",
        target_size=TARGET_SIZE,
        color_mode="rgb",
        class_mode="categorical",
        batch_size=BATCH_SIZE,
        shuffle=False
    )

    # 6. Build Light Model (MobileNetV2 Backbone)
    print("Building CPU-friendly MobileNetV2 model...")
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(160, 160, 3))
    base_model.trainable = False 

    model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.3),
        layers.Dense(5, activation='softmax') 
    ])

    model.compile(
        optimizer=optimizers.Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    # 7. Training Callbacks
    os.makedirs('model', exist_ok=True)
    checkpoint = callbacks.ModelCheckpoint(MODEL_PATH, monitor='val_accuracy', save_best_only=True, mode='max', verbose=1)
    early_stop = callbacks.EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)

    # 8. Optimized Training Execution
    print("Starting Stage 1 training...")
    model.fit(
        train_generator,
        epochs=15,
        validation_data=val_generator,
        callbacks=[checkpoint, early_stop],
        verbose=1
    )

    # 9. Fine Tuning
    print("Stage 2: Fine-tuning top layers...")
    base_model.trainable = True
    for layer in base_model.layers[:-20]:
        layer.trainable = False
        
    model.compile(
        optimizer=optimizers.Adam(learning_rate=1e-5),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    model.fit(
        train_generator,
        epochs=5,
        validation_data=val_generator,
        callbacks=[checkpoint, early_stop],
        verbose=1
    )

    print(f"Training successfully completed. Best model saved to: {MODEL_PATH}")

if __name__ == "__main__":
    train_model()
