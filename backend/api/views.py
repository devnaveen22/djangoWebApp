from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from django.utils import timezone
from django.db import transaction
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer, 
    SlotSerializer, ManualBookingSerializer
)
from .models import Slot, ManualBooking
from knox.models import AuthToken
from django.http import HttpResponse
from rest_framework.views import APIView

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
            return Response(serializer.errors, status=400)


class LoginViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone_number']
            password = serializer.validated_data['password']
            user = authenticate(request, username=phone_number, password=password)
            if user:
                _, token = AuthToken.objects.create(user)
                return Response({
                    "user": UserSerializer(user).data,
                    "token": token
                })
            else:
                return Response(
                    {"error": "Invalid Credentials"},
                    status=401
                )
        else:
            return Response(serializer.errors, status=400)


class SlotViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Slot.objects.all()
    serializer_class = SlotSerializer

    def list(self, request):
        """List all slots with expired holds released"""
        expired_slots = Slot.objects.filter(
            status='pending',
            hold_until__lt=timezone.now()
        )
        for slot in expired_slots:
            slot.release_if_expired()

        serializer = self.serializer_class(Slot.objects.all().order_by('id'), many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='manual-booking')
    def manual_booking(self, request):
        serializer = ManualBookingSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            with transaction.atomic():
                booking = serializer.save()
                notification_result = booking.send_email_notification()

                response_data = {
                    'message': 'Booking request submitted successfully',
                    'booking_id': booking.id,
                    'slot_number': booking.slot.slot_number,
                    'expires_at': booking.expires_at,
                    'status': booking.status,
                    'notification': notification_result,
                    'notification_info': (
                        'Admin notified via gmail'
                        if notification_result.get('success')
                        else 'Email notification failed'
                    )
                }

                if not notification_result.get('success'):
                    response_data['notification_error'] = notification_result.get('error')

                return Response(response_data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=False,
        methods=['get'],
        url_path=r'verify-booking/(?P<token>[^/.]+)/(?P<action>[^/.]+)',
        permission_classes=[permissions.AllowAny]
    )
    def verify_booking(self, request, token=None, action=None):
        booking = get_object_or_404(ManualBooking, verification_token=token)

        if booking.is_expired():
            booking.status = 'expired'
            booking.slot.release_if_expired()
            booking.save()

            html = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Booking Expired</title>
                <style>
                    body {{ font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }}
                    .container {{ background: white; padding: 30px; border-radius: 10px; max-width: 400px; margin: auto; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>⏰ Booking Expired</h1>
                    <p>Slot: {}</p>
                </div>
            </body>
            </html>
            """.format(booking.slot.slot_number)

            return HttpResponse(html)

        if booking.status != 'pending':
            html = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Already Processed</title>
                <style>
                    body {{ font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }}
                    .container {{ background: white; padding: 30px; border-radius: 10px; max-width: 400px; margin: auto; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>ℹ️ Already {}</h1>
                    <p>Slot: {}</p>
                </div>
            </body>
            </html>
            """.format(booking.status.upper(), booking.slot.slot_number)

            return HttpResponse(html)

        if action not in ['approve', 'reject']:
            return Response(
                {'success': False, 'message': 'Invalid action'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            slot = booking.slot
            booking.verified_at = timezone.now()
            booking.verified_by = request.user if request.user.is_authenticated else None

            if action == 'approve':
                booking.status = 'approved'
                slot.status = 'booked'
                slot.is_booked = True
                slot.hold_until = None
                slot.booking_date = timezone.now()

                booking.save()
                slot.save()

                html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Booking Approved</title>
                    <style>
                        body {{ font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }}
                        .container {{ background: white; padding: 30px; border-radius: 10px; max-width: 400px; margin: auto; }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>✅ Approved</h1>
                        <p>Slot: {}</p>
                        <p>Customer: {}</p>
                        <p>Amount: ₹{}</p>
                    </div>
                </body>
                </html>
                """.format(slot.slot_number, booking.payer_name, slot.price)

                return HttpResponse(html)

            else:
                booking.status = 'rejected'
                slot.status = 'available'
                slot.user = None
                slot.hold_until = None

                booking.save()
                slot.save()

                html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Booking Rejected</title>
                    <style>
                        body {{ font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }}
                        .container {{ background: white; padding: 30px; border-radius: 10px; max-width: 400px; margin: auto; }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>❌ Rejected</h1>
                        <p>Slot {} is now available</p>
                    </div>
                </body>
                </html>
                """.format(slot.slot_number)

                return HttpResponse(html)


class ManualBookingViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for admins to view all manual bookings"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ManualBookingSerializer
    queryset = ManualBooking.objects.select_related('slot', 'user').all()
    
    def get_queryset(self):
        queryset = ManualBooking.objects.select_related('slot', 'user').all()
        
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    

class UserDetailView(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        user = request.user 
        serializer = UserSerializer(user)
        return Response(serializer.data)
