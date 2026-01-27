import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import AxiosInstance from './AxiosInstance';
import qr from '../assets/Qr.png';
import CloseIcon from '@mui/icons-material/Close';

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
import { MonetizationOn } from '@mui/icons-material';

/* ---------------- Dialog Transition ---------------- */
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/* ---------------- Slot Button ---------------- */
const SlotButton = React.memo(({ slot, onClick }) => {
  const getColor = () => {
    if (slot.status === 'booked') return { main: '#ef5350', light: '#ffebee', dark: '#c62828' };
    if (slot.status === 'pending') return { main: '#ff9800', light: '#fff3e0', dark: '#e65100' };
    return { main: '#361C15', light: '#fbe9e7', dark: '#bf360c' };
  };

  const getIcon = () => {
    if (slot.status === 'booked') return <BlockIcon sx={{ fontSize: 18 }} />;
    if (slot.status === 'pending') return <HourglassEmptyIcon sx={{ fontSize: 18, color: '#ff9800' }} />;
    return <MonetizationOn
      sx={{
        color: '#f5c542',
        fontSize: 32,
        filter: 'drop-shadow(0 0 4px rgba(245,197,66,0.6))'
      }}
    />
      ;
  };

  const isDisabled = slot.status !== 'available';
  const colors = getColor();

  return (
    <Tooltip
      title={
        slot.status === 'booked' ? 'Already Booked' :
          slot.status === 'pending' ? 'Pending Approval' :
            'Click to Book'
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
            borderRadius: { xs: 1.5, sm: 2 },
            fontSize: { xs: 13, sm: 14 },
            fontWeight: 600,
            bgcolor: isDisabled ? colors.light : '#fff',
            color: isDisabled ? colors.dark : colors.main,
            border: `2px solid ${colors.main}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: isDisabled ? colors.light : colors.main,
              color: isDisabled ? colors.dark : '#fff',
              transform: isDisabled ? 'none' : 'translateY(-2px)',
              boxShadow: isDisabled ? 'none' : '0 4px 12px rgba(216, 67, 21, 0.25)',
            },
            '&:disabled': {
              color: colors.dark,
            }
          }}
        >
          {getIcon()}
          <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: 12, sm: 14 } }}>
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
      borderRadius: 1.5,
      border: '1px solid #361C15',
      bgcolor: 'white',
      backdropFilter: 'blur(10px)',
    }}
  >
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          width: { xs: 32, sm: 36 },
          height: { xs: 32, sm: 36 },
          borderRadius: 1,
          bgcolor: 'rgba(255,255,255,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#361C15'
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, lineHeight: 1.2 }}>
          {label}
        </Typography>
        {count !== undefined && (
          <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
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
        borderRadius: { xs: 1.5, sm: 2 },
        bgcolor: 'rgba(0,0,0,0.06)'
      }}
      animation="wave"
    />
  </Box>
);

/* ---------------- Main Component ---------------- */
export default function Booking() {
  const { user } = useAuth()
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
  const [amount, setAmount] = useState('');
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
    setAmount('');
    setPaymentApp('gpay');
  };

  const handleProceed = async () => {
    if (!payerName.trim() || !upiName.trim() || amount <2000 || amount ==='') {
      setSnackbar({ open: true, message: 'Please fill all required details', severity: 'warning' });
      return;
    }

    setSubmitting(true);

    try {
      await AxiosInstance.post('slot/manual-booking/', {
        slot_id: activeSlot.id,
        payer_name: payerName.trim(),
        upi_account_name: upiName.trim(),
        payment_app: paymentApp,
        amount:amount
      });

      setSnackbar({
        open: true,
        message: 'Payment submitted successfully! Awaiting admin approval.',
        severity: 'success'
      });

      fetchSlots();
      handleCancel();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Booking failed. Please try again.',
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
        py: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 2 }
      }}>
        <Fade in timeout={800}>
          <Card sx={{
            borderRadius: { xs: 2, sm: 3 },
            boxShadow: '0 15px 40px rgba(245, 166, 35, 0.3)',
            overflow: 'hidden',
          }}>
            <Box sx={{
              background: 'white',
              color: '#361C15',
              boxShadow: 'inset 0px 3px 20px 0px #DE9F00 !important',
              p: { xs: 2, sm: 3, md: 4 }
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                    borderRadius: 1.5,
                    bgcolor: '#DE9F00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid #361C15'
                  }}>
                    <EventSeatIcon sx={{ fontSize: { xs: 24, sm: 28, color: '#361C15' } }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' }, letterSpacing: '-0.5px' }}>
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
                      bgcolor: '#DE9F00',
                      color: 'white',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        bgcolor: '#361C15',
                      },
                      transition: 'all 0.3s ease',
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
                  color="#d84315"
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

            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#fafafa' }}>
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
                    sx={{
                      mt: 3,
                      borderRadius: 1.5,
                      borderColor: '#d84315',
                      color: '#d84315',
                      '&:hover': {
                        borderColor: '#bf360c',
                        bgcolor: 'rgba(216, 67, 21, 0.04)'
                      }
                    }}
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
              borderRadius: isMobile ? 0 : 2,
              maxHeight: isMobile ? '100%' : '90vh'
            }
          }}
        >
          <DialogTitle sx={{
            bgcolor: 'white',
            p: { xs: 2, sm: 2.5 },
            borderRadius: 1.5,
            display: 'inline-block',
            boxShadow: 'inset 0px 3px 20px 0px #DE9F00 !important'
          }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: '#DE9F00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #361C15'
              }}>
                <EventSeatIcon sx={{ fontSize: 24 }} />
              </Box>
              <span>Confirm Booking</span>
            </Stack>
          </DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleCancel}
            sx={(theme) => ({
              position: 'absolute',
              right: 8,
              top: 14,
              color: '#361C15 !important'
            })}
          >
            <CloseIcon />
          </IconButton>

          <DialogContent sx={{ pt: 3, px: { xs: 2, sm: 3 }, pb: 2 }}>
            <Stack spacing={{ xs: 2.5, sm: 3 }} py={2}>
              <Chip
                label={`Slot: ${activeSlot?.slot_number}`}
                size="medium"
                icon={<EventSeatIcon />}
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: 15, sm: 17 },
                  py: 2.5,
                  boxShadow: 'rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px',
                  color: '#361C15',
                  '& .MuiChip-icon': {
                    fontSize: 20,
                    color: '#361C15'
                  }
                }}
              />

              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  textAlign: 'center',
                  borderRadius: 2,
                  border: '2px solid #361C15',
                  bgcolor: '#fafafa'
                }}
              >
                <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" mb={2}>
                  <QrCode2Icon sx={{ fontSize: { xs: 24, sm: 28 }, color: '#361C15' }} />
                  <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem' }, color: '#361C15' }}>
                    Scan to Pay
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    bgcolor: 'white',
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 1.5,
                    display: 'inline-block',
                    boxShadow: 'rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px',
                    border: '1px solid #361C15'
                  }}
                >
                  <Box
                    component="img"
                    src={qr}
                    alt="UPI QR Code"
                    sx={{
                      width: { xs: 180, sm: 220 },
                      borderRadius: 1
                    }}
                  />
                </Box>

                <Paper elevation={0} sx={{ mt: 2, p: 1.5, borderRadius: 1.5, bgcolor: 'white', border: '1px solid #361C15' }}>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                    <AccountBalanceWalletIcon sx={{ fontSize: 20, color: '#361C15' }} />
                    <Typography variant="body1" fontWeight={600} sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                      UPI NUMBER: <span style={{ color: '#361C15' }}>{import.meta.env.VITE_UPI_NUMBER}</span>
                    </Typography>
                  </Stack>
                </Paper>
              </Paper>

              <Alert
                severity="info"
                icon={<InfoOutlinedIcon />}
                sx={{ borderRadius: 1.5, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}
              >
                Complete payment first, then fill the form below
              </Alert>

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
                    borderRadius: 1.5,
                    '&.Mui-focused fieldset': {
                      borderColor: '#d84315'
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#d84315'
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
                helperText="Must match your UPI app name exactly"
                InputProps={{
                  startAdornment: <PaymentIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    '&.Mui-focused fieldset': {
                      borderColor: '#d84315'
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#d84315'
                  }
                }}
              />

              <TextField
                label="Amount"
                type='number'
                fullWidth
                required
                value={amount}
                onChange={(e) => {
                  const amtValue = e.target.value;
                  setAmount(amtValue === ''? '':Number(amtValue))
                }}
                variant="outlined"
                placeholder="Enter payment amount"
                helperText="The minimum payable amount is 2,000"
                InputProps={{
                  startAdornment: <PaymentIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    '&.Mui-focused fieldset': {
                      borderColor: '#d84315'
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#d84315'
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
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          border: '2px solid',
                          borderColor: paymentApp === app.value ? app.color : '#e0e0e0',
                          bgcolor: paymentApp === app.value ? `${app.color}08` : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: app.color,
                            bgcolor: `${app.color}08`
                          }
                        }}
                        onClick={() => setPaymentApp(app.value)}
                      >
                        <FormControlLabel
                          value={app.value}
                          control={<Radio size="small" sx={{ color: app.color, '&.Mui-checked': { color: app.color } }} />}
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
                sx={{ borderRadius: 1.5, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}
              >
                Slot reserved for 15 minutes pending verification
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
                borderRadius: 1.5,
                px: 4,
                fontWeight: 600,
                borderColor: '#361C15',
                color: '#DE9F00',
                '&:hover': {
                  borderColor: '#DE9F00',
                  bgcolor: '#DE9F00',
                  color: '#361C15 !important'
                }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleProceed}
              disabled={submitting || !payerName.trim() || !upiName.trim() || amount < 2000 || amount ===''}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
              fullWidth={isMobile}
              sx={{
                borderRadius: 1.5,
                px: 4,
                fontWeight: 600,
                bgcolor: 'white',
                borderColor: '#361C15 !important',
                color: '#DE9F00',
                '&:hover': {
                  borderColor: '#DE9F00',
                  bgcolor: '#DE9F00',
                  color: '#361C15 !important'
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
      </Box>
  );
}