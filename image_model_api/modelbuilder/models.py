from django.db import models

class BuiltModel(models.Model):
    model_id = models.AutoField(primary_key=True)  # Unique ID
    model_name = models.CharField(max_length=100)
    epochs = models.IntegerField()
    batch_size = models.IntegerField()
    activation_function = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.model_name} (ID: {self.model_id})'
