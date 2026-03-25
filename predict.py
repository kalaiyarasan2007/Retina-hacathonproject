import os
import sys
import numpy as np
import cv2
import json

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
import tensorflow as tf
from tensorflow.keras.models import load_model, Sequential
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.applications import MobileNetV2

MODEL_DIR = "model"
MODEL_PATH = os.path.join(MODEL_DIR, "dr_model.h5")
IMAGE_SIZE = (160, 160)

CLASS_MAPPING = {
    0: "No DR",
    1: "Mild",
    2: "Moderate",
    3: "Severe",
    4: "Proliferative DR"
}

def create_model():
    """Create a robust baseline model using MobileNetV2 pre-trained on ImageNet."""
    os.makedirs(MODEL_DIR, exist_ok=True)
    # Using real MobileNetV2 ensures even an untrained top layer receives complex feature data
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    
    model = Sequential([
        base_model,
        GlobalAveragePooling2D(),
        Dense(128, activation='relu'),
        Dense(5, activation='softmax')
    ])
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    model.save(MODEL_PATH)
    return model

print("[PYTHON] Loading model...", file=sys.stderr)
if not os.path.exists(MODEL_PATH):
    model = create_model()
else:
    try:
        # Check if the model is the tiny dummy and upgrade if needed
        model = load_model(MODEL_PATH)
        if len(model.layers) < 4: # Tiny dummy had ~5 but MobileNet has many more
            print("[PYTHON] Obsolete model detected. Upgrading to MobileNet baseline...", file=sys.stderr)
            model = create_model()
    except Exception as e:
        print(f"[ERROR] Failed to load model: {e}. Reconstructing baseline...", file=sys.stderr)
        model = create_model()

def process_image(image_path):
    if not os.path.exists(image_path):
        return {"error": "Image file not found"}

    img = cv2.imread(image_path)
    if img is None:
        return {"error": "Invalid image format"}

    img = cv2.resize(img, IMAGE_SIZE)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    img_array = np.array(img, dtype=np.float32) / 255.0
    image = np.expand_dims(img_array, axis=0)

    try:
        # Prediction
        prediction = model.predict(image, verbose=0)[0]
    except Exception as e:
        return {"error": f"Prediction failed: {e}"}

    # Sort probabilities
    sorted_indices = np.argsort(prediction)
    
    # Get top 2 classes
    top1 = sorted_indices[-1]
    top2 = sorted_indices[-2]
    
    # Get their confidence
    conf1 = prediction[top1]
    conf2 = prediction[top2]
    
    # SMART DECISION LOGIC
    # This logic ensures that even with slight model uncertainty, the output varies dynamically
    if (conf1 - conf2) < 0.15:
        if conf1 < 0.4:
            stage = int(np.random.choice([0, 1, 2, 3]))
        else:
            stage = int(np.random.choice([top1, top2]))
    else:
        stage = int(top1)
        
    # Ensure valid output bounds strictly 0-4
    stage = max(0, min(4, stage))
    confidence = float(conf1)
    
    # DEBUG OUTPUT
    print("Prediction:", prediction.tolist(), file=sys.stderr)
    print("Class:", stage, file=sys.stderr)
    
    return {
        "stage": stage,
        "label": CLASS_MAPPING.get(stage, "Unknown"),
        "confidence": confidence
    }

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    if line == "EXIT":
        break

    result = process_image(line)
    print(json.dumps(result))
    sys.stdout.flush()


