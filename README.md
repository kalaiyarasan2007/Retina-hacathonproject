# RETINA EYE PROJECT

## 📌 Project Description

This project detects Diabetic Retinopathy using Deep Learning.
It takes retinal images as input and predicts the condition of the eye.

---

## 📥 Download Required Files

Download the required files from Google Drive:

### 🔹 Model

https://drive.google.com/file/d/1qQ7PNXJ5_7aAzphrdj4lJFxoI8S6ljrT/view?usp=drive_link

### 🔹 Dataset (FULL FOLDER)

https://drive.google.com/drive/folders/1hMJz5whx_XiS96nyLFlRhX24wtHMBYE7?usp=drive_link

---

## ⚙️ Setup Instructions

### 1. Clone the repository

git clone https://github.com/kalaiyarasan2007/Retina-hacathonproject.git

---

### 2. Download files

Download:

* Model file
* Dataset folder (FULL)

---

### 3. Place files correctly

After downloading:

1. Place model file:
   model/dr_model.h5

2. Place dataset folder like this:

dataset/trainLabels.csv
dataset/resized_train/

Make sure:

* `trainLabels.csv` is inside dataset
* `resized_train` contains all images

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

* Model and dataset are NOT included in GitHub
* Download both before running
* Dataset must be downloaded as a folder
* Wrong structure will cause errors

---

## 🚀 Output

The model predicts the stage of Diabetic Retinopathy from retinal images.

---

## 👨‍💻 Author

Kalaiyarasan
