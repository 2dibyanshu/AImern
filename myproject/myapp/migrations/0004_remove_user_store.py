# Generated by Django 5.1 on 2024-09-03 14:40

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0003_user_store'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='store',
        ),
    ]
