from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import RegisterViewset, LoginViewSet, SlotViewSet, ManualBookingViewSet,UserDetailView

router = DefaultRouter()
router.register('register', RegisterViewset, basename='register')
router.register('login', LoginViewSet, basename='login')
router.register('slot', SlotViewSet, basename='slot')
router.register('manual-booking', ManualBookingViewSet, basename='manual-bookings')
router.register('me',UserDetailView,basename='me')

urlpatterns = router.urls