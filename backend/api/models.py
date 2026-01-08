from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator, RegexValidator
from django.contrib.auth.base_user import BaseUserManager
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import secrets
import requests
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
    email = models.EmailField(unique=True, max_length=256, null=True)
    phone_number = models.CharField(
        unique=True,
        null=False,
        blank=False,
        max_length=10,
        validators=[
            MinLengthValidator(10),
            RegexValidator(r'^\d{10}$', message="Phone must be exactly 10 digits.")
        ]
    )
    first_name = models.CharField(null=True)
    last_name = models.CharField(null=True)
    is_superuser = models.BooleanField(null=True, default=False)
    is_staff = models.BooleanField(null=True, default=False)
    is_active = models.BooleanField(default=True, null=True)
    USERNAME_FIELD = 'phone_number'
    objects = CustomUserManager()


class Slot(models.Model):
    slot_number = models.CharField(max_length=10, unique=True)
    is_booked = models.BooleanField(default=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='slots'
    )
    booking_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=5000)
    status = models.CharField(
        max_length=20,
        choices=[
            ('available', 'Available'),
            ('pending', 'Pending Approval'),
            ('booked', 'Booked'),
        ],
        default='available'
    )
    hold_until = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = "slots"
        ordering = ['slot_number']
    
    def __str__(self):
        return f"Slot {self.slot_number}"
    
    def is_hold_expired(self):
        """Check if hold period has expired"""
        if self.hold_until and self.status == 'pending':
            return timezone.now() > self.hold_until
        return False
    
    def release_if_expired(self):
        """Release slot if hold period expired"""
        if self.is_hold_expired():
            self.status = 'available'
            self.user = None
            self.hold_until = None
            self.save()
            return True
        return False


class ManualBooking(models.Model):
    """Model to track manual payment bookings"""
    slot = models.ForeignKey(Slot, on_delete=models.CASCADE, related_name='manual_bookings')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    payer_name = models.CharField(max_length=255)
    upi_account_name = models.CharField(max_length=255)
    payment_app = models.CharField(
        max_length=20,
        choices=[
            ('gpay', 'Google Pay'),
            ('phonepe', 'PhonePe'),
            ('paytm', 'Paytm'),
        ]
    )
    verification_token = models.CharField(max_length=64, unique=True, default=secrets.token_urlsafe)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending Verification'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('expired', 'Expired'),
        ],
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_bookings'
    )
    
    class Meta:
        db_table = "manual_bookings"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Booking {self.id} - Slot {self.slot.slot_number} - {self.status}"
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=15)
        if not self.verification_token:
            self.verification_token = secrets.token_urlsafe(32)
        super().save(*args, **kwargs)
    
    def is_expired(self):
        """Check if booking verification period has expired"""
        return timezone.now() > self.expires_at and self.status == 'pending'
    
    def get_verification_url(self, action):
        """Generate verification URL for approve/reject"""
        base_url = getattr(settings, 'BACKEND_URL', 'http://localhost:3000')
        
        return f"{base_url}/api/slot/verify-booking/{self.verification_token}/{action}/"
    
    def send_whatsapp_notification(self):
        """Send WhatsApp notification using approved template with 2 buttons"""
        try:
            url = f"https://graph.facebook.com/v18.0/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
            
            headers = {
                'Authorization': f'Bearer {settings.WHATSAPP_API_TOKEN}',
                'Content-Type': 'application/json'
            }
            
            # Format phone number
            admin_phone = settings.ADMIN_WHATSAPP_NUMBER.replace('+', '').replace(' ', '')
            templete = settings.WHATSAPP_TEMPLATE_NAME
            
            # Format expiry time
            expires_str = self.expires_at.strftime('%d %b %Y, %I:%M %p')
            
            # For two-button template, both buttons use the same token
            # The action (approve/reject) is in the URL path
            payload = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": admin_phone,
                "type": "template",
                "template": {
                    "name": templete,  # Your template name
                    "language": {
                        "code": "en"
                    },
                    "components": [
                        {
                            "type": "body",
                            "parameters": [
                                {"type": "text", "text": str(self.slot.slot_number)},
                                {"type": "text", "text": str(self.payer_name)},
                                {"type": "text", "text": str(self.upi_account_name)},
                                {"type": "text", "text": str(self.get_payment_app_display())},
                                {"type": "text", "text": str(self.slot.price)},
                                {"type": "text", "text": expires_str}
                            ]
                        },
                        {
                            "type": "button",
                            "sub_type": "url",
                            "index": "0",  # First button (Approve)
                            "parameters": [
                                {"type": "text", "text": self.verification_token}
                            ]
                        },
                        {
                            "type": "button",
                            "sub_type": "url",
                            "index": "1",  # Second button (Reject)
                            "parameters": [
                                {"type": "text", "text": self.verification_token}
                            ]
                        }
                    ]
                }
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            
            return {
                'success': True,
                'method': 'whatsapp_template_two_buttons',
                'status': 'sent',
                'message_id': response.json().get('messages', [{}])[0].get('id'),
                'response': response.json()
            }
            
        except requests.exceptions.RequestException as e:
            print(f"WhatsApp API Error: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response: {e.response.text}")
            
            return {
                'success': False,
                'method': 'whatsapp_template_two_buttons',
                'status': 'error',
                'error': str(e),
                'error_details': e.response.text if hasattr(e, 'response') and e.response else None
            }
        
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return {
                'success': False,
                'method': 'whatsapp_template_two_buttons',
                'status': 'error',
                'error': str(e)
            }