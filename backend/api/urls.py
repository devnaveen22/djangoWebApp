from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import RegisterViewset

router = DefaultRouter()
router.register('register',RegisterViewset,basename='register')
urlpatterns = router.urls

