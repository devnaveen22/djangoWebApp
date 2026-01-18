from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator, RegexValidator
from django.contrib.auth.base_user import BaseUserManager
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import secrets
import requests
from django.core.validators import MinValueValidator
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
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
    amount = models.IntegerField(
        validators = [MinValueValidator(2000)],
        help_text='Amount must be at least 2000'
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
        base_url = getattr(settings, 'BACKEND_API_URL', 'http://localhost:3000')
        
        return f"{base_url}/slot/verify-booking/{self.verification_token}/{action}/"
    def send_email_notification(self):
        try:
            subject = f"New Booking Request - Slot #{self.slot.slot_number}"
            admin_email = getattr(settings, 'ADMIN_EMAIL', settings.DEFAULT_FROM_EMAIL)
            expires_str = timezone.localtime(self.expires_at).strftime('%d %b %Y, %I:%M %p')
            context = {
                'slot_number': self.slot.slot_number,
                'payer_name': self.payer_name,
                'upi_account_name': self.upi_account_name,
                'payment_app': self.get_payment_app_display(),
                'amount': self.amount,
                'expires_at': expires_str,
                'approve_url': self.get_verification_url('approve'),
                'reject_url': self.get_verification_url('reject'),
                'booking_id': self.id,
            }
            html_message = render_to_string('emails/booking_verification.html', context)
            plain_message = strip_tags(html_message)
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin_email],
                html_message=html_message,
                fail_silently=False,
            )
            return {
                'success': True,
                'method': 'email',
                'status': 'sent',
                'recipient': admin_email
            }
        except Exception as e:
            return {
                'success': False,
                'method': 'email',
                'status': 'error',
                'error': str(e)
            }