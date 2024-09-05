# the port for this app is 8000 
# to run this app use the command: uvicorn final:app --reload
# it will run on http://127.0.0.1:8000
# train api is http://127.0.0.1:8000/train-model-bulk/
# test api is http://127.0.0.1:8000/test-model/

import os
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Flatten
from tensorflow.keras.applications import ResNet50, MobileNetV2, InceptionV3, EfficientNetB0
from tensorflow.keras.preprocessing.image import img_to_array, load_img
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix
import matplotlib.pyplot as plt
import tensorflow as tf
from io import BytesIO
import zipfile
from PIL import Image
import json
from sklearn.metrics import accuracy_score, f1_score, recall_score, precision_score

app = FastAPI()

# Directory to store models
MODEL_DIR = './stored_models'

# Ensure the model storage directory exists
if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

# Global dictionary to map class names to numeric labels
label_map = {}

# Function to build models based on user choice
def build_model(m_choice: str, input_shape: tuple, num_classes: int):
    if m_choice == 'cnn':
        model = Sequential([
            tf.keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=input_shape),
            tf.keras.layers.MaxPooling2D((2, 2)),
            tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
            tf.keras.layers.MaxPooling2D((2, 2)),
            Flatten(),
            Dense(64, activation='relu'),
            Dense(num_classes, activation='softmax')
        ])
    elif m_choice == 'efficientnet':
        base_model = EfficientNetB0(input_shape=input_shape, include_top=False, weights='imagenet')
        base_model.trainable = False
        model = Sequential([
            base_model,
            GlobalAveragePooling2D(),
            Dense(128, activation='relu'),
            Dense(num_classes, activation='softmax')
        ])
    elif m_choice == 'resnet50':
        base_model = ResNet50(input_shape=input_shape, include_top=False, weights='imagenet')
        base_model.trainable = False
        model = Sequential([
            base_model,
            GlobalAveragePooling2D(),
            Dense(128, activation='relu'),
            Dense(num_classes, activation='softmax')
        ])
    elif m_choice == 'mobilenetv2':
        base_model = MobileNetV2(input_shape=input_shape, include_top=False, weights='imagenet')
        base_model.trainable = False
        model = Sequential([
            base_model,
            GlobalAveragePooling2D(),
            Dense(128, activation='relu'),
            Dense(num_classes, activation='softmax')
        ])
    elif m_choice == 'inceptionv3':
        base_model = InceptionV3(input_shape=input_shape, include_top=False, weights='imagenet')
        base_model.trainable = False
        model = Sequential([
            base_model,
            GlobalAveragePooling2D(),
            Dense(128, activation='relu'),
            Dense(num_classes, activation='softmax')
        ])
    else:
        raise ValueError(f"Unsupported model choice: {m_choice}")
    return model

# Function to extract images and labels from zip file and store label mapping
async def extract_images_and_labels_from_zip(zip_file: UploadFile, image_size: tuple):
    X_data = []
    y_data = []
    global label_map  # Store label mapping globally

    try:
        # Open the zip file
        with zipfile.ZipFile(BytesIO(await zip_file.read())) as z:
            # Iterate through the folders in the zip file
            for folder_name in z.namelist():
                # Check if the item is a folder
                if folder_name.endswith('/'):
                    label = folder_name.rstrip('/')  # Folder name is the label
                    if label not in label_map:
                        label_map[label] = len(label_map)  # Create a map for labels to integers

                    # Iterate through the images in each folder
                    for filename in z.namelist():
                        if filename.startswith(folder_name) and (filename.endswith('.png') or filename.endswith('.jpg') or filename.endswith('.jpeg')):
                            # Read and process the image
                            img_data = z.read(filename)
                            img = load_img(BytesIO(img_data), target_size=image_size)
                            img_array = img_to_array(img)
                            img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension

                            # Append image and corresponding label
                            X_data.append(img_array)
                            y_data.append(label_map[label])

    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid zip file")

    # Convert lists to tensors
    X_data = np.vstack(X_data)
    y_data = np.array(y_data, dtype=np.int32)  # Ensure that labels are integers

    return X_data, y_data, len(label_map)

# Function to extract images from zip file
async def extract_images_from_zip(zip_file: UploadFile, image_size: tuple):
    X_data = []
    filenames = []

    try:
        # Open the zip file
        with zipfile.ZipFile(BytesIO(await zip_file.read())) as z:
            # Iterate through the images in the zip file
            for filename in z.namelist():
                if filename.endswith('.png') or filename.endswith('.jpg') or filename.endswith('.jpeg'):
                    # Read and process the image
                    img_data = z.read(filename)
                    img = load_img(BytesIO(img_data), target_size=image_size)
                    img_array = img_to_array(img)
                    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension

                    # Append image and filename
                    X_data.append(img_array)
                    filenames.append(filename)

    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid zip file")

    # Convert list to tensor
    X_data = np.vstack(X_data)

    return X_data, filenames

# Function to save label mapping to a file
def save_label_map(user_dir, m_name):
    label_map_path = os.path.join(user_dir, f"{m_name}_label_map.json")
    with open(label_map_path, 'w') as f:
        json.dump(label_map, f)
    return label_map_path

# Function to load label map during testing
def load_label_map(user_dir, m_name):
    label_map_path = os.path.join(user_dir, f"{m_name}_label_map.json")
    with open(label_map_path, 'r') as f:
        return json.load(f)

# Function to save confusion matrix as a PNG file with numeric values inside
def save_confusion_matrix(y_true, y_pred, m_path):
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(10, 7))
    plt.imshow(cm, cmap='Blues')
    plt.title('Confusion Matrix')
    plt.colorbar()
    plt.xlabel('Predicted Label')
    plt.ylabel('True Label')

    # Add numeric values inside each cell
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            plt.text(j, i, format(cm[i, j], 'd'), ha="center", va="center", color="black")

    plt.tight_layout()

    # Save confusion matrix as a PNG file
    cm_path = f"{os.path.splitext(m_path)[0]}_confusion_matrix.png"
    plt.savefig(cm_path)
    plt.close()
    return cm_path

# Function to calculate specificity
def calculate_specificity(cm):
    tn, fp, fn, tp = cm.ravel()
    specificity = tn / (tn + fp)
    return specificity

# Function to save performance metrics to a text file
def save_metrics_to_file(m_path, accuracy, f1, recall, precision, specificity):
    metrics_path = f"{os.path.splitext(m_path)[0]}_metrics.txt"
    with open(metrics_path, 'w') as f:
        f.write(f"Accuracy: {accuracy:.4f}\n")
        f.write(f"F1 Score: {f1:.4f}\n")
        f.write(f"Recall: {recall:.4f}\n")
        f.write(f"Precision: {precision:.4f}\n")
        f.write(f"Specificity: {specificity:.4f}\n")
    return metrics_path

# API to train model with a zip file containing images and save metrics
@app.post("/train-model-bulk/")
async def train_model(
    email: str = Form(...),
    m_choice: str = Form(...),
    m_name: str = Form(...),
    epochs: int = Form(...),
    zipfile: UploadFile = File(...)
):
    try:
        user_dir = os.path.join(MODEL_DIR, email)
        if not os.path.exists(user_dir):
            os.makedirs(user_dir)

        # Load and validate images and labels from the zip file
        image_size = (224, 224)
        X_data, y_data, num_classes = await extract_images_and_labels_from_zip(zipfile, image_size)

        # Normalize the pixel values
        X_data = X_data / 255.0

        # One-hot encode the labels for training
        y_data_one_hot = tf.keras.utils.to_categorical(y_data, num_classes=num_classes)

        # Split data into 85% training and 15% testing
        X_train, X_test, y_train, y_test = train_test_split(X_data, y_data_one_hot, test_size=0.15, random_state=42)

        # Build and compile the model
        model = build_model(m_choice, input_shape=image_size + (3,), num_classes=num_classes)
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

        # Train the model
        model.fit(X_train, y_train, epochs=epochs)

        # Save the model
        m_path = os.path.join(user_dir, f"{m_name}.h5")
        model.save(m_path)

        # Save the label map
        label_map_path = save_label_map(user_dir, m_name)

        # Evaluate on the test set
        y_pred = model.predict(X_test)

        # Convert one-hot labels back to integers for evaluation
        y_pred_classes = np.argmax(y_pred, axis=1)  # Predicted classes
        y_test_classes = np.argmax(y_test, axis=1)  # True classes

        # Calculate performance metrics
        accuracy = accuracy_score(y_test_classes, y_pred_classes)
        f1 = f1_score(y_test_classes, y_pred_classes, average='weighted')
        recall = recall_score(y_test_classes, y_pred_classes, average='weighted')
        precision = precision_score(y_test_classes, y_pred_classes, average='weighted')
        
        # Confusion matrix and specificity calculation
        cm = confusion_matrix(y_test_classes, y_pred_classes)
        specificity = calculate_specificity(cm)

        # Save the confusion matrix as a PNG file
        cm_path = save_confusion_matrix(y_test_classes, y_pred_classes, m_path)

        # Save the metrics to a text file
        metrics_path = save_metrics_to_file(m_path, accuracy, f1, recall, precision, specificity)

        return {
            "message": "Model trained and saved successfully!",
            "email": email,
            "model_path": m_path,
            "confusion_matrix_path": cm_path,
            "metrics_file_path": metrics_path,
            "label_map_path": label_map_path
        }
    except Exception as e:
        return {"error": str(e)}

# API to load and test a model with bulk images from a zip file
@app.post("/test-model/")
async def test_model(
    email: str = Form(...),
    m_name: str = Form(...),
    zipfile: UploadFile = File(...)
):
    try:
        user_dir = os.path.join(MODEL_DIR, email)

        # Load the trained model
        m_path = os.path.join(user_dir, f"{m_name}.h5")
        if not os.path.exists(m_path):
            raise FileNotFoundError(f"Model not found: {m_name}.h5")

        model = load_model(m_path)

        # Load label map
        label_map = load_label_map(user_dir, m_name)
        reverse_label_map = {v: k for k, v in label_map.items()}  # Reverse the label map

        # Image size used for model training
        image_size = (224, 224)  # Adjust this size if necessary

        # Extract images from the zip file
        images_data, filenames = await extract_images_from_zip(zipfile, image_size)

        # Normalize pixel values
        images_data = images_data / 255.0

        # Get predictions for all images
        predictions = model.predict(images_data)

        # Prepare prediction results for each image
        predictions_list = []
        for i in range(len(filenames)):
            predicted_class_index = np.argmax(predictions[i], axis=0)
            predicted_class = reverse_label_map[predicted_class_index]  # Map to class name
            predictions_list.append({
                "filename": filenames[i],
                "predicted_class": predicted_class,
                "predictions": predictions[i].tolist()
            })

        # Return the predictions for all images
        return {
            "message": "Model tested successfully",
            "predictions": predictions_list
        }

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
