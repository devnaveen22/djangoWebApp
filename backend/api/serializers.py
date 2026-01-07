from rest_framework import serializers
from .models import *
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "phone_number", "password", "id")
        extra_kwargs = {'password': {'write_only': True}, 'id': {"read_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    password = serializers.CharField()

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret.pop('password', None)
        return ret


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'phone_number', 'username','is_superuser','is_staff']


class SlotSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    class Meta:
        model = Slot
        fields = ['id', 'slot_number', 'is_booked', 'booking_date', 'user', 'price', 'status', 'hold_until']
        read_only_fields = ['is_booked', 'booking_date', 'user', 'hold_until']


class ManualBookingSerializer(serializers.ModelSerializer):
    slot_number = serializers.CharField(source='slot.slot_number', read_only=True)
    slot_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = ManualBooking
        fields = [
            'id', 'slot_id', 'slot_number', 'payer_name', 
            'upi_account_name', 'payment_app', 'status', 
            'created_at', 'expires_at','verification_token','verified_at'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'expires_at', 'verified_at', 'verification_token']
    
    def validate_slot_id(self, value):
        """Validate that slot exists and is available"""
        try:
            slot = Slot.objects.get(id=value)
        except Slot.DoesNotExist:
            raise serializers.ValidationError("Slot does not exist")
        
        slot.release_if_expired()
        slot.refresh_from_db()
        
        if slot.status != 'available':
            raise serializers.ValidationError(f"Slot is not available. Current status: {slot.status}")
        
        return value
    
    def create(self, validated_data):
        slot_id = validated_data.pop('slot_id')
        slot = Slot.objects.select_for_update().get(id=slot_id)
        
        # Check again after lock
        if slot.status != 'available':
            raise serializers.ValidationError({"message": "Slot is no longer available"})
        
        # Create manual booking
        booking = ManualBooking.objects.create(
            slot=slot,
            user=self.context['request'].user,
            **validated_data
        )
        
        # Update slot status
        slot.status = 'pending'
        slot.user = self.context['request'].user
        slot.hold_until = booking.expires_at
        slot.save()
        
        return booking


class BookingVerificationSerializer(serializers.Serializer):
    """Serializer for booking verification actions"""
    action = serializers.ChoiceField(choices=['approve', 'reject'])


