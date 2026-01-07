import { useState } from 'react';
import AxiosInstance from '../components/AxiosInstance';

export const useBooking = (onSuccess) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);
  const [payerName, setPayerName] = useState('');
  const [upiName, setUpiName] = useState('');
  const [paymentApp, setPaymentApp] = useState('gpay');
  const [submitting, setSubmitting] = useState(false);

  const openDialog = (slot) => {
    setActiveSlot(slot);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setActiveSlot(null);
    setPayerName('');
    setUpiName('');
    setPaymentApp('gpay');
  };

  const submitBooking = async () => {
    if (!payerName.trim() || !upiName.trim()) {
      return { success: false, message: '⚠️ Please fill all required details' };
    }

    setSubmitting(true);

    try {
      await AxiosInstance.post('slot/manual-booking/', {
        slot_id: activeSlot.id,
        payer_name: payerName.trim(),
        upi_account_name: upiName.trim(),
        payment_app: paymentApp
      });

      closeDialog();
      if (onSuccess) onSuccess();

      return {
        success: true,
        message: '🎉 Payment submitted successfully! Awaiting admin approval.'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '❌ Booking failed. Please try again.'
      };
    } finally {
      setSubmitting(false);
    }
  };

  return {
    dialogOpen,
    activeSlot,
    payerName,
    setPayerName,
    upiName,
    setUpiName,
    paymentApp,
    setPaymentApp,
    submitting,
    openDialog,
    closeDialog,
    submitBooking
  };
};