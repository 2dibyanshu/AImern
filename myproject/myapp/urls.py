from django.urls import path
from .views import RegisterView, LoginView, DeleteUserView, FileUploadView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('delete/', DeleteUserView.as_view(), name='delete_user'),
    path('upload/', FileUploadView.as_view(), name='file_upload'),
]
