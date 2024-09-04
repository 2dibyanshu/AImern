import os
from rest_framework.decorators import api_view
from rest_framework.response import Response
from keras import ResNet50, MobileNetV2, InceptionV3
from keras import layers, models
from django.conf import settings
from .serializers import ModelSelectionSerializer
from .models import BuiltModel

@api_view(['POST'])
def build_model(request):
    serializer = ModelSelectionSerializer(data=request.data)
    if serializer.is_valid():
        model_name = serializer.validated_data['model_name']
        epochs = serializer.validated_data['epochs']
        batch_size = serializer.validated_data['batch_size']
        activation_function = serializer.validated_data['activation_function']

        # Load the selected model
        if model_name == 'ResNet50':
            base_model = ResNet50(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
        elif model_name == 'MobileNetV2':
            base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
        elif model_name == 'InceptionV3':
            base_model = InceptionV3(weights='imagenet', include_top=False, input_shape=(299, 299, 3))

        # Build a new model
        model = models.Sequential()
        model.add(base_model)
        model.add(layers.GlobalAveragePooling2D())
        model.add(layers.Dense(1024, activation=activation_function))  # Use chosen activation function
        model.add(layers.Dense(10, activation='softmax'))  # Example output for 10 classes

        # Compile the model
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

        # Dummy training data (replace with actual training data)
        import numpy as np
        X_train = np.random.random((batch_size, 224, 224, 3))  # Example data
        Y_train = np.random.randint(10, size=(batch_size, 10))

        # Train the model
        model.fit(X_train, Y_train, epochs=epochs, batch_size=batch_size)

        # Save the model in .h5 format
        model_filename = f'{model_name}_{epochs}_epochs.h5'
        model_filepath = os.path.join(settings.MEDIA_ROOT, model_filename)
        model.save(model_filepath)  # Save model in .h5 format

        # Save model details in the database
        built_model = BuiltModel.objects.create(
            model_name=model_name,
            epochs=epochs,
            batch_size=batch_size,
            activation_function=activation_function
        )

        return Response({
            'status': 'Model trained and saved successfully',
            'model_id': built_model.model_id,
            'model_filepath': model_filepath
        })

    return Response(serializer.errors, status=400)

@api_view(['GET'])
def get_model_metadata(request, model_id):
    try:
        built_model = BuiltModel.objects.get(pk=model_id)
        return Response({
            'model_name': built_model.model_name,
            'epochs': built_model.epochs,
            'batch_size': built_model.batch_size,
            'activation_function': built_model.activation_function,
            'created_at': built_model.created_at
        })
    except BuiltModel.DoesNotExist:
        return Response({'error': 'Model not found'}, status=404)

from django.http import FileResponse
import os

@api_view(['GET'])
def get_model_file(request, model_id):
    try:
        built_model = BuiltModel.objects.get(pk=model_id)
        model_filename = f'{built_model.model_name}_{built_model.epochs}_epochs.h5'
        model_filepath = os.path.join(settings.MEDIA_ROOT, model_filename)

        # Check if the file exists
        if os.path.exists(model_filepath):
            return FileResponse(open(model_filepath, 'rb'), as_attachment=True, filename=model_filename)
        else:
            return Response({'error': 'Model file not found'}, status=404)

    except BuiltModel.DoesNotExist:
        return Response({'error': 'Model not found'}, status=404)
