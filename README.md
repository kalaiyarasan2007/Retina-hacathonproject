# RETINA EYE PROJECT

## 📌 Project Description

This project detects Diabetic Retinopathy using Deep Learning.
It takes retinal images as input and predicts the condition of the eye.

---

## 📥 Download Required Files

Download the model and dataset from Google Drive:

**Model:**
https://drive.google.com/file/d/1i8JosMlwbz0f73f6GvGsKpNmWh_mYImp/view?usp=drive_link

**Dataset (FULL FOLDER):**
https://drive.google.com/file/d/1UQokg5Ao2J57fdMLxmKE5izKltLhnbkr/view?usp=drive_link

---

## ⚙️ Setup Instructions

### 1. Clone the repository

git clone https://github.com/kalaiyarasan2007/Retina-hacathonproject.git

---

### 2. Download model and dataset

Download both files from the links above.

---

### 3. Place files correctly

After downloading:

1. Place model file:
   model/dr_model.h5

2. Extract dataset folder and place like this:

dataset/trainLabels.csv
dataset/resized_train/

Make sure the dataset folder contains BOTH:

* trainLabels.csv
* resized_train (images folder)

---

### 4. Install dependencies

pip install -r requirements.txt

---

### 5. Run the project

python predict.py

---

## 📂 Project Structure

RETINA-EYE PROJECT/
├── model/
│   └── dr_model.h5
├── dataset/
│   ├── trainLabels.csv
│   └── resized_train/
│        ├── images...
├── predict.py
├── requirements.txt

---

## ⚠️ Important Notes

* Model and dataset are not included in GitHub due to size limitations
* Download and extract dataset properly before running
* Incorrect folder structure will cause errors

---

## 🚀 Output

The model predicts the stage of Diabetic Retinopathy from retinal images.

---

## 👨‍💻 Author

Kalaiyarasan
