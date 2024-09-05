# the port for this app is 8000 
# to run this app use the command: uvicorn final:app --reload
# it will run on http://127.0.0.1:8000
# train api is http://127.0.0.1:8000/train-model-bulk/
# test api is http://127.0.0.1:8000/test-model/
import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Flatten
from tensorflow.keras.applications import ResNet50, MobileNetV2, InceptionV3, EfficientNetB0
from tensorflow.keras.preprocessing.image import img_to_array, load_img
import tensorflow as tf
import numpy as np
from io import BytesIO
import zipfile
from PIL import Image

app = FastAPI()

# Directory to store models
MODEL_DIR = './stored_models'

# Ensure the model storage directory exists
if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

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

# Function to extract and validate images from a zip file
def extract_images_from_zip(zip_file: UploadFile, image_size: tuple):
    image_files = []
    try:
        with zipfile.ZipFile(BytesIO(zip_file.file.read())) as z:
            for filename in z.namelist():
                if filename.endswith(('.png', '.jpg', '.jpeg')):
                    try:
                        img_data = z.read(filename)
                        img = Image.open(BytesIO(img_data))
                        img.verify()  # Validate if it's a proper image

                        # Reload the image for resizing and processing
                        img = load_img(BytesIO(img_data), target_size=image_size)
                        img_array = img_to_array(img)
                        img_array = tf.expand_dims(img_array, 0)  # Add batch dimension
                        image_files.append(img_array)
                    except Exception as e:
                        raise HTTPException(status_code=400, detail=f"Invalid image file in zip: {filename}")
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid zip file")
    
    return tf.concat(image_files, axis=0)

# API to train model with a zip file containing images
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

        # Load and validate images from the zip file
        image_size = (224, 224)
        X_train = extract_images_from_zip(zipfile, image_size)

        # Placeholder labels for training (replace with actual labels if available)
        num_classes = 10
        y_train = tf.random.uniform((len(X_train), num_classes))

        # Build and compile the model
        model = build_model(m_choice, input_shape=image_size + (3,), num_classes=num_classes)
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

        # Train the model
        model.fit(X_train, y_train, epochs=epochs)

        # Save the model
        m_path = os.path.join(user_dir, f"{m_name}.h5")
        model.save(m_path)

        return {
            "message": "Model trained and saved successfully!",
            "m_path": m_path
        }
    except Exception as e:
        return {"error": str(e)}

# API to load and test a model with an image
@app.post("/test-model/")
async def test_model(
    email: str = Form(...),
    m_name: str = Form(...),
    image: UploadFile = File(...)
):
    try:
        # Load the trained model
        m_path = os.path.join(MODEL_DIR, email, f"{m_name}.h5")
        if not os.path.exists(m_path):
            raise FileNotFoundError(f"Model not found: {m_name}.h5")

        model = load_model(m_path)

        # Preprocess the uploaded image
        image_size = (224, 224)  # Assuming models use this size, adjust if needed
        contents = await image.read()
        img = load_img(BytesIO(contents), target_size=image_size)
        img_array = img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
        img_array = img_array / 255.0  # Normalize pixel values

        # Get predictions
        predictions = model.predict(img_array)
        predicted_class = np.argmax(predictions, axis=1)[0]

        # Return the prediction
        return {
            "message": "Model tested successfully",
            "predicted_class": int(predicted_class),
            "predictions": predictions.tolist()
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
