from django.shortcuts import render
from rest_framework import viewsets,permissions
from django.contrib.auth import get_user_model,authenticate
from .serializers import RegisterSerializer,LoginSerializer,UserSerializer,SlotSerializer
from rest_framework.response import Response
from knox.models import AuthToken
from .models import Slot
User = get_user_model()

class RegisterViewset(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors,status=400)


class LoginViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def create(self,request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone_number']
            password = serializer.validated_data['password']
            user = authenticate(request,username=phone_number,password=password)
            if user:
                _,token= AuthToken.objects.create(user)
                return Response({
                    "user": UserSerializer(user).data,
                    "token": token
                })
            
            else:
                return Response(
                    {
                        "error":"Invalid Crendentials"
                    },status=401
                )
        else:
            return Response(serializer.errors,status = 400)