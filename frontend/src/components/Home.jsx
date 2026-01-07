import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import AxiosInstance from './AxiosInstance';
import qr from '../assets/Qr.png'

import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  Fade,
  Skeleton,
  useTheme,
  useMediaQuery
} from '@mui/material';

import Slide from '@mui/material/Slide';
import RefreshIcon from '@mui/icons-material/Refresh';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import BlockIcon from '@mui/icons-material/Block';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { AlertComp } from './Alert';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';

/* ---------------- Dialog Transition ---------------- */
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/* ---------------- Slot Button ---------------- */
const SlotButton = React.memo(({ slot, onClick }) => {
  const getColor = () => {
    if (slot.status === 'booked') return { main: '#ef5350', light: '#ffebee', dark: '#c62828' };
    if (slot.status === 'pending') return { main: '#ff9800', light: '#fff3e0', dark: '#e65100' };
    return { main: '#4caf50', light: '#e8f5e9', dark: '#2e7d32' };
  };

  const getIcon = () => {
    if (slot.status === 'booked') return <BlockIcon sx={{ fontSize: 18 }} />;
    if (slot.status === 'pending') return <HourglassEmptyIcon sx={{ fontSize: 18 }} />;
    return <EventSeatIcon sx={{ fontSize: 18 }} />;
  };

  const isDisabled = slot.status !== 'available';
  const colors = getColor();

  return (
    <Tooltip
      title={
        slot.status === 'booked' ? '🚫 Already Booked' :
          slot.status === 'pending' ? '⏳ Pending Approval' :
            '✨ Click to Book'
      }
      arrow
      placement="top"
    >
      <span style={{ height: '100%', display: 'block' }}>
        <Button
          fullWidth
          disabled={isDisabled}
          onClick={() => onClick(slot)}
          sx={{
            height: '100%',
            minHeight: { xs: 70, sm: 80 },
            p: { xs: 1, sm: 1.5 },
            borderRadius: { xs: 2, sm: 2.5 },
            fontSize: { xs: 13, sm: 14 },
            fontWeight: 700,
            bgcolor: isDisabled ? colors.light : colors.main,
            color: isDisabled ? colors.dark : '#fff',
            border: `2px solid ${isDisabled ? colors.main : 'transparent'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: isDisabled ? 'none' : 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
              pointerEvents: 'none',
            },
            '&:hover': {
              bgcolor: isDisabled ? colors.light : colors.dark,
              transform: isDisabled ? 'none' : 'translateY(-4px) scale(1.02)',
              boxShadow: isDisabled ? 'none' : `0 12px 24px ${colors.main}40`,
              borderColor: isDisabled ? colors.main : colors.dark,
            },
            '&:active': {
              transform: isDisabled ? 'none' : 'translateY(-2px) scale(1.01)',
            },
            '&:disabled': {
              color: colors.dark,
            }
          }}
        >
          {getIcon()}
          <Typography variant="body2" fontWeight={700} sx={{ fontSize: { xs: 12, sm: 14 } }}>
            {slot.slot_number}
          </Typography>
        </Button>
      </span>
    </Tooltip>
  );
});

/* ---------------- Legend Item ---------------- */
const Legend = ({ color, label, icon, count }) => (
  <Paper
    elevation={0}
    sx={{
      px: { xs: 1.5, sm: 2.5 },
      py: { xs: 1, sm: 1.25 },
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }
    }}
  >
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          width: { xs: 32, sm: 36 },
          height: { xs: 32, sm: 36 },
          borderRadius: 1.5,
          bgcolor: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, lineHeight: 1.2 }}>
          {label}
        </Typography>
        {count !== undefined && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
            {count} slots
          </Typography>
        )}
      </Box>
    </Stack>
  </Paper>
);

/* ---------------- Loading Skeleton ---------------- */
const SlotSkeleton = () => (
  <Box sx={{ p: 1 }}>
    <Skeleton
      variant="rectangular"
      sx={{
        height: { xs: 70, sm: 80 },
        borderRadius: { xs: 2, sm: 2.5 },
        bgcolor: 'rgba(0,0,0,0.06)'
      }}
      animation="wave"
    />
  </Box>
);

/* ---------------- Main Component ---------------- */
export default function Home() {
  const { user } = useAuth()
  console.log(user)
  const isAdmin = user?.is_staff && user?.is_superuser
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);

  const [payerName, setPayerName] = useState('');
  const [upiName, setUpiName] = useState('');
  const [paymentApp, setPaymentApp] = useState('gpay');
  const [submitting, setSubmitting] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const fetchSlots = useCallback((showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);

    AxiosInstance.get('slot/')
      .then((res) => {
        setSlots(res.data || []);
        if (showRefreshing) {
          setSnackbar({ open: true, message: 'Slots refreshed successfully!', severity: 'success' });
        }
      })
      .catch(() => {
        setSnackbar({ open: true, message: 'Failed to fetch slots. Please try again.', severity: 'error' });
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleSlotClick = useCallback((slot) => {
    if (slot.status !== 'available') return;
    setActiveSlot(slot);
    setDialogOpen(true);
  }, []);

  const handleCancel = () => {
    setDialogOpen(false);
    setActiveSlot(null);
    setPayerName('');
    setUpiName('');
    setPaymentApp('gpay');
  };

  const handleProceed = async () => {
    if (!payerName.trim() || !upiName.trim()) {
      setSnackbar({ open: true, message: '⚠️ Please fill all required details', severity: 'warning' });
      return;
    }

    setSubmitting(true);

    try {
      await AxiosInstance.post('slot/manual-booking/', {
        slot_id: activeSlot.id,
        payer_name: payerName.trim(),
        upi_account_name: upiName.trim(),
        payment_app: paymentApp
      });

      setSnackbar({
        open: true,
        message: '🎉 Payment submitted successfully! Awaiting admin approval.',
        severity: 'success'
      });

      fetchSlots();
      handleCancel();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || '❌ Booking failed. Please try again.',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const stats = {
    available: slots.filter(s => s.status === 'available').length,
    pending: slots.filter(s => s.status === 'pending').length,
    booked: slots.filter(s => s.status === 'booked').length,
  };

  const getGridColumns = () => {
    if (isMobile) return 4;
    if (isTablet) return 6;
    return 8;
  };

  const columns = getGridColumns();

  return (
    isAdmin ? <AdminDashboard /> :
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 2 }
      }}>
        <Container maxWidth="xl">
          <Fade in timeout={800}>
            <Card sx={{
              borderRadius: { xs: 3, sm: 4 },
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}>
              <Box sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                p: { xs: 2, sm: 3, md: 4 }
              }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{
                      width: { xs: 40, sm: 48 },
                      height: { xs: 40, sm: 48 },
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <EventSeatIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' } }}>
                        Slot Booking
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Choose your perfect slot
                      </Typography>
                    </Box>
                  </Stack>

                  <Tooltip title="Refresh Slots" arrow>
                    <IconButton
                      onClick={() => fetchSlots(true)}
                      disabled={refreshing}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.3)',
                          transform: 'rotate(360deg)',
                        },
                        transition: 'all 0.6s ease',
                      }}
                    >
                      {refreshing ? <CircularProgress size={24} sx={{ color: 'white' }} /> : <RefreshIcon />}
                    </IconButton>
                  </Tooltip>
                </Stack>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 1.5, sm: 2 }}
                  mt={3}
                >
                  <Legend
                    color="#4caf50"
                    label="Available"
                    icon={<EventSeatIcon fontSize="small" />}
                    count={stats.available}
                  />
                  <Legend
                    color="#ff9800"
                    label="Pending"
                    icon={<HourglassEmptyIcon fontSize="small" />}
                    count={stats.pending}
                  />
                  <Legend
                    color="#ef5350"
                    label="Booked"
                    icon={<BlockIcon fontSize="small" />}
                    count={stats.booked}
                  />
                </Stack>
              </Box>

              <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                {loading ? (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${columns}, 1fr)`,
                      gap: { xs: 1, sm: 2 },
                    }}
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <SlotSkeleton key={i} />
                    ))}
                  </Box>
                ) : slots.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 10 } }}>
                    <EventSeatIcon sx={{ fontSize: { xs: 60, sm: 80 }, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      No Slots Available
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      Please check back later or contact support
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={() => fetchSlots(true)}
                      sx={{ mt: 3, borderRadius: 2 }}
                    >
                      Refresh Slots
                    </Button>
                  </Box>
                ) : (
                  <Fade in timeout={600}>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${columns}, 1fr)`,
                        gap: { xs: 1, sm: 2 },
                      }}
                    >
                      {slots.map((slot) => (
                        <SlotButton key={slot.id} slot={slot} onClick={handleSlotClick} />
                      ))}
                    </Box>
                  </Fade>
                )}
              </CardContent>
            </Card>
          </Fade>

          {/* Booking Dialog */}
          <Dialog
            open={dialogOpen}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleCancel}
            fullWidth
            maxWidth="sm"
            fullScreen={isMobile}
            PaperProps={{
              sx: {
                borderRadius: isMobile ? 0 : 3,
                maxHeight: isMobile ? '100%' : '90vh'
              }
            }}
          >
            <DialogTitle sx={{
              fontWeight: 700,
              fontSize: { xs: 20, sm: 24 },
              pb: 2,
              px: { xs: 2, sm: 3 },
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <EventSeatIcon sx={{ fontSize: 24 }} />
                </Box>
                <span>Confirm Booking</span>
              </Stack>
            </DialogTitle>

            <DialogContent sx={{ pt: 3, px: { xs: 2, sm: 3 }, pb: 2 }}>
              <Stack spacing={{ xs: 2.5, sm: 3 }} py={2}>
                <Chip
                  label={`Slot: ${activeSlot?.slot_number}`}
                  color="primary"
                  size="medium"
                  icon={<EventSeatIcon />}
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: 15, sm: 17 },
                    py: 2.5,
                    '& .MuiChip-icon': {
                      fontSize: 20
                    }
                  }}
                />

                {/* QR Code Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    textAlign: 'center',
                    borderRadius: 3,
                    border: '2px dashed',
                    borderColor: 'primary.main',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                  }}
                >
                  <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" mb={2}>
                    <QrCode2Icon color="primary" sx={{ fontSize: { xs: 24, sm: 28 } }} />
                    <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem' } }}>
                      Scan to Pay
                    </Typography>
                  </Stack>

                  <Box
                    sx={{
                      bgcolor: 'white',
                      p: { xs: 2, sm: 2.5 },
                      borderRadius: 2,
                      display: 'inline-block',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                    }}
                  >
                    <Box
                      component="img"
                      src={qr}
                      alt="UPI QR Code"
                      sx={{
                        width: { xs: 180, sm: 220 },
                        height: { xs: 180, sm: 220 },
                        borderRadius: 2,
                        border: '2px solid #e0e0e0'
                      }}
                    />
                  </Box>

                  <Paper elevation={2} sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: 'white' }}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                      <AccountBalanceWalletIcon color="primary" sx={{ fontSize: 20 }} />
                      <Typography variant="body1" fontWeight={600} sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        UPI NUMBER : <span style={{ color: '#667eea' }}>{import.meta.env.VITE_UPI_NUMBER}</span>
                      </Typography>
                    </Stack>
                  </Paper>
                </Paper>

                <Alert
                  severity="info"
                  icon={<InfoOutlinedIcon />}
                  sx={{ borderRadius: 2, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}
                >
                  Complete payment first, then fill the form below
                </Alert>

                {/* Form Fields */}
                <TextField
                  label="Your Full Name"
                  fullWidth
                  required
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  variant="outlined"
                  placeholder="e.g., John Doe"
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />

                <TextField
                  label="UPI Account Name"
                  fullWidth
                  required
                  value={upiName}
                  onChange={(e) => setUpiName(e.target.value)}
                  variant="outlined"
                  placeholder="Name shown in payment app"
                  helperText="⚠️ Must match your UPI app name exactly"
                  InputProps={{
                    startAdornment: <PaymentIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />

                <Box>
                  <Typography variant="body2" fontWeight={600} mb={1.5} sx={{ fontSize: { xs: '0.9rem', sm: '0.95rem' } }}>
                    Select Payment App:
                  </Typography>
                  <RadioGroup
                    value={paymentApp}
                    onChange={(e) => setPaymentApp(e.target.value)}
                  >
                    <Stack spacing={1}>
                      {[
                        { value: 'gpay', label: 'Google Pay', color: '#4285f4' },
                        { value: 'phonepe', label: 'PhonePe', color: '#5f259f' },
                        { value: 'paytm', label: 'Paytm', color: '#00baf2' }
                      ].map(app => (
                        <Paper
                          key={app.value}
                          elevation={paymentApp === app.value ? 3 : 0}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            border: '2px solid',
                            borderColor: paymentApp === app.value ? app.color : 'divider',
                            bgcolor: paymentApp === app.value ? `${app.color}10` : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: app.color,
                              transform: 'translateX(4px)'
                            }
                          }}
                          onClick={() => setPaymentApp(app.value)}
                        >
                          <FormControlLabel
                            value={app.value}
                            control={<Radio size="small" sx={{ color: app.color }} />}
                            label={
                              <Typography fontWeight={paymentApp === app.value ? 600 : 400} sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                {app.label}
                              </Typography>
                            }
                            sx={{ m: 0, width: '100%' }}
                          />
                        </Paper>
                      ))}
                    </Stack>
                  </RadioGroup>
                </Box>

                <Alert
                  severity="warning"
                  icon={<HourglassEmptyIcon />}
                  sx={{ borderRadius: 2, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}
                >
                  ⏱️ Slot reserved for 15 minutes pending verification
                </Alert>
              </Stack>
            </DialogContent>

            <Divider />

            <DialogActions sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 2, sm: 2.5 },
              gap: { xs: 1.5, sm: 2 },
              flexDirection: isMobile ? 'column-reverse' : 'row'
            }}>
              <Button
                onClick={handleCancel}
                variant="outlined"
                size="large"
                disabled={submitting}
                fullWidth={isMobile}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  fontWeight: 600
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleProceed}
                disabled={submitting || !payerName.trim() || !upiName.trim()}
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                fullWidth={isMobile}
                sx={{
                  px: 4,
                  fontWeight: 700,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a4292 100%)',
                    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
                  }
                }}
              >
                {submitting ? 'Processing...' : 'Confirm Booking'}
              </Button>
            </DialogActions>
          </Dialog>

          <AlertComp
            open={snackbar.open}
            type={snackbar.severity}
            message={snackbar.message}
            onClose={handleCloseSnackbar}
          />
        </Container>
      </Box>
  );
}