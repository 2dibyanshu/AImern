from django.urls import path
from .views import build_model, get_model_metadata, get_model_file

urlpatterns = [
    path('build_model/', build_model, name='build_model'),
    path('model_metadata/<int:model_id>/', get_model_metadata, name='get_model_metadata'),
    path('model_file/<int:model_id>/', get_model_file, name='get_model_file'),
]
