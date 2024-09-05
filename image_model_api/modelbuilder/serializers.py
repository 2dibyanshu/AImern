from rest_framework import serializers

class ModelSelectionSerializer(serializers.Serializer):
    model_name = serializers.ChoiceField(choices=['ResNet50', 'MobileNetV2', 'InceptionV3'])
    epochs = serializers.IntegerField(min_value=1, max_value=100)
    batch_size = serializers.IntegerField(min_value=1, max_value=128)
    activation_function = serializers.ChoiceField(choices=['relu', 'sigmoid', 'softmax', 'tanh', 'linear'])
