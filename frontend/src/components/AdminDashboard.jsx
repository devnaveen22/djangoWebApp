import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Alert,
  Snackbar,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  useTheme,
  useMediaQuery,
  alpha,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector
} from '@mui/x-data-grid';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  EventSeat as EventSeatIcon,
  HourglassEmpty as HourglassEmptyIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  FilterList,
  ArrowDropDown,
  ArrowDropUp
} from '@mui/icons-material';
import { format, subDays, subMonths, subYears, startOfMonth, startOfYear, endOfMonth, endOfYear } from 'date-fns';
import AxiosInstance from './AxiosInstance';
import { saveAs } from 'file-saver';
import { AlertComp } from './Alert';
import ExcelJS from 'exceljs';

// Custom styled components
const StatCard = ({ title, value, icon, color, trend, percentage }) => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={0}
      sx={{
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        height: '100%',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
          borderColor: alpha(color, 0.3),
        }
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={700} mt={0.5}>
              {value}
            </Typography>
            {trend && percentage && (
              <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
                {trend === 'up' ? (
                  <ArrowDropUp sx={{ color: 'success.main', fontSize: 20 }} />
                ) : (
                  <ArrowDropDown sx={{ color: 'error.main', fontSize: 20 }} />
                )}
                <Typography 
                  variant="caption" 
                  color={trend === 'up' ? 'success.main' : 'error.main'}
                  fontWeight={500}
                >
                  {percentage}%
                </Typography>
              </Stack>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              width: 48,
              height: 48
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
};

function CustomToolbar({ onExport, showExport }) {
  return (
    <GridToolbarContainer sx={{ p: 1.5 }}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      {showExport && (
        <Button
          startIcon={<DownloadIcon />}
          onClick={onExport}
          size="small"
          variant="outlined"
          sx={{ ml: 'auto' }}
        >
          Export
        </Button>
      )}
    </GridToolbarContainer>
  );
}

export default function AdminDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [tabValue, setTabValue] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, booking: null, action: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await AxiosInstance.get('manual-booking');
      setBookings(response.data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch bookings', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getFilteredBookings = () => {
    const now = new Date();
    let filtered = [...bookings];

    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(b => {
          const date = new Date(b.created_at);
          return date.toDateString() === now.toDateString();
        });
        break;
      case 'yesterday':
        const yesterday = subDays(now, 1);
        filtered = filtered.filter(b => {
          const date = new Date(b.created_at);
          return date.toDateString() === yesterday.toDateString();
        });
        break;
      case 'this_month':
        filtered = filtered.filter(b => {
          const date = new Date(b.created_at);
          return date >= startOfMonth(now) && date <= endOfMonth(now);
        });
        break;
      case 'last_6_months':
        const sixMonthsAgo = subMonths(now, 6);
        filtered = filtered.filter(b => new Date(b.created_at) >= sixMonthsAgo);
        break;
      case 'this_year':
        filtered = filtered.filter(b => {
          const date = new Date(b.created_at);
          return date >= startOfYear(now) && date <= endOfYear(now);
        });
        break;
      case 'last_year':
        const lastYear = subYears(now, 1);
        filtered = filtered.filter(b => {
          const date = new Date(b.created_at);
          return date >= startOfYear(lastYear) && date <= endOfYear(lastYear);
        });
        break;
      default:
        break;
    }

    return filtered;
  };

  const getBookingsByTab = () => {
    const filtered = getFilteredBookings();
    
    switch (tabValue) {
      case 0:
        return filtered.filter(b => b.status === 'pending');
      case 1:
        return filtered.filter(b => b.status === 'approved');
      case 2:
        return filtered;
      default:
        return filtered;
    }
  };

  const handleAction = async (booking, action) => {
    setConfirmDialog({ open: true, booking, action });
  };

  const confirmAction = async () => {
    const { booking, action } = confirmDialog;
    setActionLoading(true);

    try {
      await AxiosInstance.get(`slot/verify-booking/${booking.verification_token}/${action}/`);
      
      setSnackbar({
        open: true,
        message: `Booking ${action === 'approve' ? 'approved' : 'rejected'} successfully!`,
        severity: 'success'
      });

      await fetchBookings();
      setConfirmDialog({ open: false, booking: null, action: '' });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Action failed. Please try again.',
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bookings');
  
    worksheet.columns = [
      { header: 'Booking ID', key: 'id', width: 12 },
      { header: 'Slot Number', key: 'slot', width: 12 },
      { header: 'Customer Name', key: 'payer_name', width: 20 },
      { header: 'UPI Name', key: 'upi_account_name', width: 20 },
      { header: 'Payment App', key: 'payment_app', width: 15 },
      { header: 'Amount', key: 'amount', width: 12 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Created Date', key: 'created_at', width: 22 },
    ];
  
    getBookingsByTab().forEach(b => {
      worksheet.addRow({
        id: b.id,
        slot: b.slot?.slot_number || b.slot_number,
        payer_name: b.payer_name,
        upi_account_name: b.upi_account_name,
        payment_app: b.payment_app.toUpperCase(),
        amount: `₹${b.slot?.price || 5000}`,
        status: b.status.toUpperCase(),
        created_at: format(new Date(b.created_at), 'dd MMM yyyy, hh:mm a'),
      });
    });
  
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `bookings_${dateFilter}.xlsx`);
  };

  const stats = {
    pending: bookings.filter(b => b.status === 'pending').length,
    approved: bookings.filter(b => b.status === 'approved').length,
    rejected: bookings.filter(b => b.status === 'rejected').length,
    total: bookings.length
  };

  const pendingColumns = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 80,
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'slot_number', 
      headerName: 'SLOT', 
      width: 100,
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'payer_name', 
      headerName: 'CUSTOMER NAME', 
      width: 180,
      headerAlign: 'left',
      align: 'left'
    },
    { 
      field: 'upi_account_name', 
      headerName: 'UPI NAME', 
      width: 180,
      headerAlign: 'left',
      align: 'left'
    },
    {
      field: 'payment_app',
      headerName: 'PAYMENT APP',
      width: 130,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params?.value?.toUpperCase() || ''}
          size="small"
          variant="outlined"
          sx={{ 
            fontWeight: 500,
            borderWidth: 1.5
          }}
        />
      )
    },
    {
      field: 'amount',
      headerName: 'AMOUNT',
      width: 110,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (params) => params?.row?.slot?.price || 5000,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} lineHeight={4}>
          ₹{params?.value}
        </Typography>
      )
    },
    {
      field: 'created_at',
      headerName: 'CREATED',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary" lineHeight={4}>
          {format(new Date(params?.value), 'dd MMM, hh:mm a')}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      width: 220,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={2} pt={1}>
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => handleAction(params?.row, 'approve')}
            sx={{ 
              fontWeight: 600,
              textTransform: 'none',
              px: 2
            }}
          >
            Approve
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => handleAction(params?.row, 'reject')}
            sx={{ 
              fontWeight: 600,
              textTransform: 'none',
              px: 2
            }}
          >
            Reject
          </Button>
        </Stack>
      )
    }
  ];

  const bookedColumns = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 80,
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'slot_number', 
      headerName: 'SLOT', 
      width: 100,
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'payer_name', 
      headerName: 'CUSTOMER NAME', 
      width: 180,
      headerAlign: 'left',
      align: 'left'
    },
    { 
      field: 'upi_account_name', 
      headerName: 'UPI NAME', 
      width: 180,
      headerAlign: 'left',
      align: 'left'
    },
    {
      field: 'payment_app',
      headerName: 'PAYMENT APP',
      width: 130,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params?.value?.toUpperCase() || ''}
          size="small"
          variant="outlined"
          sx={{ 
            fontWeight: 500,
            borderWidth: 1.5
          }}
        />
      )
    },
    {
      field: 'amount',
      headerName: 'AMOUNT',
      width: 110,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (params) => params?.row?.slot?.price || 5000,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} lineHeight={4}>
          ₹{params?.value}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'STATUS',
      width: 130,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params?.value?.toUpperCase() || ''}
          size="small"
          color={params?.value === 'approved' ? 'success' : 'error'}
          sx={{ 
            fontWeight: 600,
            minWidth: 90
          }}
        />
      )
    },
    {
      field: 'created_at',
      headerName: 'BOOKED ON',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary" lineHeight={4}>
          {format(new Date(params?.value), 'dd MMM, hh:mm a')}
        </Typography>
      )
    }
  ];

  const currentData = getBookingsByTab();

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'grey.50',
      py: { xs: 2, md: 4 }
    }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
          >
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Booking Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage and monitor all booking requests
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setDateFilter('all')}
                size={isMobile ? 'small' : 'medium'}
              >
                Clear Filters
              </Button>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={fetchBookings}
                disabled={loading}
                size={isMobile ? 'small' : 'medium'}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Stats Section */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Pending Approval"
              value={stats.pending}
              icon={<HourglassEmptyIcon />}
              color={theme.palette.warning.main}
              trend="up"
              percentage="12"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Approved"
              value={stats.approved}
              icon={<CheckCircleOutlineIcon />}
              color={theme.palette.success.main}
              trend="up"
              percentage="8"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Rejected"
              value={stats.rejected}
              icon={<CancelIcon />}
              color={theme.palette.error.main}
              trend="down"
              percentage="3"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Bookings"
              value={stats.total}
              icon={<EventSeatIcon />}
              color={theme.palette.primary.main}
            />
          </Grid>
        </Grid>

        {/* Main Content Section */}
        <Paper 
          elevation={0}
          sx={{ 
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden'
          }}
        >
          {/* Tab Header with Filter */}
          <Box sx={{ 
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper'
          }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              justifyContent="space-between" 
              alignItems={{ xs: 'stretch', sm: 'center' }}
              spacing={2}
              sx={{ p: 2.5 }}
            >
              <Tabs 
                value={tabValue} 
                onChange={(e, v) => setTabValue(v)}
                variant={isMobile ? 'scrollable' : 'standard'}
                scrollButtons="auto"
                sx={{ 
                  minHeight: 48,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    minHeight: 48,
                    px: 2
                  }
                }}
              >
                <Tab 
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>Pending</span>
                      {stats.pending > 0 && (
                        <Chip 
                          label={stats.pending} 
                          size="small" 
                          color="warning"
                          sx={{ 
                            height: 20,
                            '& .MuiChip-label': { px: 1 }
                          }}
                        />
                      )}
                    </Stack>
                  } 
                />
                <Tab 
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>Booked</span>
                      {stats.approved > 0 && (
                        <Chip 
                          label={stats.approved} 
                          size="small" 
                          color="success"
                          sx={{ 
                            height: 20,
                            '& .MuiChip-label': { px: 1 }
                          }}
                        />
                      )}
                    </Stack>
                  } 
                />
                <Tab label="All Bookings" />
              </Tabs>

              <Stack 
                direction="row" 
                spacing={2} 
                alignItems="center"
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                <FormControl 
                  size="small" 
                  sx={{ 
                    minWidth: { xs: '100%', sm: 180 },
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'background.paper'
                    }
                  }}
                >
                  <InputLabel>Date Range</InputLabel>
                  <Select
                    value={dateFilter}
                    label="Date Range"
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Time</MenuItem>
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="yesterday">Yesterday</MenuItem>
                    <MenuItem value="this_month">This Month</MenuItem>
                    <MenuItem value="last_6_months">Last 6 Months</MenuItem>
                    <MenuItem value="this_year">This Year</MenuItem>
                    <MenuItem value="last_year">Last Year</MenuItem>
                  </Select>
                </FormControl>

                {tabValue === 1 && (
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={exportToExcel}
                    disabled={currentData.length === 0}
                    size="small"
                    sx={{ 
                      display: { xs: 'none', sm: 'flex' },
                      height: 40
                    }}
                  >
                    Export
                  </Button>
                )}
              </Stack>
            </Stack>
          </Box>

          {/* Data Grid */}
          <Box sx={{ 
            height: { xs: 500, md: 600 },
            width: '100%',
            position: 'relative'
          }}>
            {loading && (
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0,
                zIndex: 1
              }}>
                <LinearProgress />
              </Box>
            )}
            <DataGrid
              rows={currentData}
              columns={tabValue === 0 ? pendingColumns : bookedColumns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50, 100]}
              disableSelectionOnClick
              loading={loading}
              components={{
                Toolbar: CustomToolbar,
              }}
              componentsProps={{
                toolbar: {
                  onExport: exportToExcel,
                  showExport: tabValue === 1
                }
              }}
              sx={{
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: 'grey.50',
                  borderBottom: `2px solid ${theme.palette.divider}`,
                  fontWeight: 600
                },
                '& .MuiDataGrid-cell': {
                  borderColor: theme.palette.divider,
                },
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none'
                },
                '& .MuiDataGrid-row:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.02)
                },
                '& .MuiDataGrid-row.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08)
                  }
                }
              }}
            />
          </Box>
        </Paper>
        {tabValue === 1 && currentData.length > 0 && (
          <Box sx={{ 
            display: { xs: 'flex', sm: 'none' },
            mt: 2,
            justifyContent: 'center'
          }}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={exportToExcel}
              fullWidth
            >
              Export Data
            </Button>
          </Box>
        )}

        {/* Confirmation Dialog */}
        <Dialog 
          open={confirmDialog.open} 
          onClose={() => !actionLoading && setConfirmDialog({ open: false, booking: null, action: '' })}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 2
          }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              {confirmDialog.action === 'approve' ? (
                <CheckCircleIcon color="success" />
              ) : (
                <CancelIcon color="error" />
              )}
              <Typography variant="h6" fontWeight={600}>
                {confirmDialog.action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to {confirmDialog.action} booking for slot{' '}
              <Box component="span" fontWeight={700}>
                {confirmDialog.booking?.slot?.slot_number}
              </Box>?
            </Typography>
            {confirmDialog.booking && (
              <Paper 
                elevation={0}
                sx={{ 
                  mt: 2.5,
                  p: 2.5,
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Customer
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {confirmDialog.booking.payer_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      UPI Name
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {confirmDialog.booking.upi_account_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Amount
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="primary">
                      ₹{confirmDialog.booking.slot?.price || 5000}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Payment Method
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {confirmDialog.booking.payment_app.toUpperCase()}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
            <Button 
              onClick={() => setConfirmDialog({ open: false, booking: null, action: '' })} 
              disabled={actionLoading}
              variant="outlined"
              sx={{ minWidth: 100 }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              variant="contained"
              color={confirmDialog.action === 'approve' ? 'success' : 'error'}
              disabled={actionLoading}
              startIcon={actionLoading ? <CircularProgress size={20} /> : null}
              sx={{ minWidth: 120 }}
            >
              {actionLoading ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar Alert */}
        <AlertComp
          open={snackbar.open}
          type={snackbar.severity}
          message={snackbar.message}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        />
      </Container>
    </Box>
  );
}