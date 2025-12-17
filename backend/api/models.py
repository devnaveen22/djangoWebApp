from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator, RegexValidator
from django.contrib.auth.base_user import BaseUserManager

class CustomUserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, phone_number, password=None, **extra_fields):
        if not phone_number:
            raise ValueError("The Phone number must be set")
        user = self.model(phone_number=phone_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(phone_number, password, **extra_fields)
class customUsers(AbstractUser):
    username = models.CharField(null=True)
    email = models.EmailField(unique=True,max_length=256,null=True)
    phone_number = models.CharField(unique=True,null=False,blank=False,max_length=10,validators=[
        MinLengthValidator(10),
        RegexValidator(r'^\d{10}$',message="Phone must be exactly 10 digits.")
    ])
    first_name = models.CharField(null=True)
    last_name = models.CharField(null=True)
    is_superuser = models.BooleanField(null=True,default=False)
    is_staff = models.BooleanField(null=True,default=False)
    is_active = models.BooleanField(null=True)
    USERNAME_FIELD = 'phone_number'
    objects = CustomUserManager()