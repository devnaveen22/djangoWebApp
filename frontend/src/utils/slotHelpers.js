export const getSlotColor = (status) => {
    if (status === 'booked') return { main: '#ef5350', light: '#ffebee', dark: '#c62828' };
    if (status === 'pending') return { main: '#ff9800', light: '#fff3e0', dark: '#e65100' };
    return { main: '#4caf50', light: '#e8f5e9', dark: '#2e7d32' };
  };
  
  export const getSlotTooltip = (status) => {
    if (status === 'booked') return '🚫 Already Booked';
    if (status === 'pending') return '⏳ Pending Approval';
    return '✨ Click to Book';
  };
  
  export const PAYMENT_APPS = [
    { value: 'gpay', label: 'Google Pay', color: '#4285f4' },
    { value: 'phonepe', label: 'PhonePe', color: '#5f259f' },
    { value: 'paytm', label: 'Paytm', color: '#00baf2' }
  ];
  
  export const UPI_NUMBER = '6369145599';