from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator, RegexValidator

# Create your models here.

class customUsers(AbstractUser):
    email = models.EmailField(unique=True,max_length=256)
    phone_number = models.CharField(unique=True,max_length=10,validators=[
        MinLengthValidator(10),
        RegexValidator(r'^\d{10}$',message="Phone must be exactly 10 digits.")
    ])
    first_name = models.CharField(null=True)
    last_name = models.CharField(null=True)
    is_superuser = models.BooleanField(null=True,default=False)
    is_staff = models.BooleanField(null=True,default=False)
    is_active = models.BooleanField(null=True)