from rest_framework  import serializers
from .models import *
from django.contrib.auth import get_user_model
User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("password","username","email","phone_number","id")
        extra_kwargs = {'password':{'write_only':True},'id':{"read_only": True}}

    def create(self,validated_data):
        user = User.objects.create_user(**validated_data)
        return user