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
  Grid
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
} from '@mui/icons-material';
import { format, subDays, subMonths, subYears, startOfMonth, startOfYear, endOfMonth, endOfYear } from 'date-fns';
import AxiosInstance from './AxiosInstance';
import { saveAs } from 'file-saver';
import { AlertComp } from './Alert';
import ExcelJS from 'exceljs';

function CustomToolbar({ onExport, showExport }) {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      {showExport && (
        <Button
          startIcon={<DownloadIcon />}
          onClick={onExport}
          size="small"
        >
          Export Excel
        </Button>
      )}
    </GridToolbarContainer>
  );
}

export default function AdminDashboard() {
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
    const workbook = new ExcelJs.Workbook();
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
    { field: 'id', headerName: 'ID', width: 80 },
    { 
      field: 'slot_number', 
      headerName: 'Slot', 
      width: 100,
    },
    { field: 'payer_name', headerName: 'Customer Name', width: 180 },
    { field: 'upi_account_name', headerName: 'UPI Name', width: 180 },
    {
      field: 'payment_app',
      headerName: 'Payment App',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params?.value.toUpperCase()}
          size="small"
          color={params?.value === 'gpay' ? 'primary' : params?.value === 'phonepe' ? 'secondary' : 'default'}
        />
      )
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 110,
      valueGetter: (params) => params?.row?.slot?.price || 5000,
      renderCell: (params) => `₹${params?.value}`
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 180,
      renderCell: (params) => format(new Date(params?.value), 'dd MMM yyyy, hh:mm a')
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 220,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => handleAction(params?.row, 'approve')}
          >
            Approve
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => handleAction(params?.row, 'reject')}
          >
            Reject
          </Button>
        </Stack>
      )
    }
  ];

  const bookedColumns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { 
      field: 'slot_number', 
      headerName: 'Slot', 
      width: 100
    },
    { field: 'payer_name', headerName: 'Customer Name', width: 180 },
    { field: 'upi_account_name', headerName: 'UPI Name', width: 180 },
    {
      field: 'payment_app',
      headerName: 'Payment App',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params?.value.toUpperCase()}
          size="small"
          color={params?.value === 'gpay' ? 'primary' : params?.value === 'phonepe' ? 'secondary' : 'default'}
        />
      )
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 110,
      valueGetter: (params) => params?.row?.slot?.price || 5000,
      renderCell: (params) => `₹${params?.value}`
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params?.value.toUpperCase()}
          size="small"
          color={params?.value === 'approved' ? 'success' : 'error'}
          icon={params?.value === 'approved' ? <CheckCircleOutlineIcon /> : <CancelIcon />}
        />
      )
    },
    {
      field: 'created_at',
      headerName: 'Booked On',
      width: 180,
      renderCell: (params) => format(new Date(params?.value), 'dd MMM yyyy, hh:mm a')
    }
  ];

  const currentData = getBookingsByTab();

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', py: 4 }}>
      <Container maxWidth="xl">
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" fontWeight={700}>
              🎫 Admin Dashboard
            </Typography>
            <IconButton onClick={fetchBookings} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)', color: 'white' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <HourglassEmptyIcon sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight={700}>{stats.pending}</Typography>
                      <Typography variant="body2">Pending</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)', color: 'white' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight={700}>{stats.approved}</Typography>
                      <Typography variant="body2">Approved</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)', color: 'white' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <CancelIcon sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight={700}>{stats.rejected}</Typography>
                      <Typography variant="body2">Rejected</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', color: 'white' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <EventSeatIcon sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight={700}>{stats.total}</Typography>
                      <Typography variant="body2">Total</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ borderRadius: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
              <Tab
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Pending Approval</span>
                    <Chip label={stats.pending} size="small" color="warning" />
                  </Stack>
                }
              />
              <Tab
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Booked</span>
                    <Chip label={stats.approved} size="small" color="success" />
                  </Stack>
                }
              />
              <Tab label="All Bookings" />
            </Tabs>
          </Box>

          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Date Filter</InputLabel>
                <Select
                  value={dateFilter}
                  label="Date Filter"
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
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={exportToExcel}
                  disabled={currentData.length === 0}
                >
                  Export Excel
                </Button>
              )}
            </Stack>
          </Box>

          <Box sx={{ height: 600, width: '100%' }}>
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
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none'
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            />
          </Box>
        </Paper>

        <Dialog 
          open={confirmDialog.open} 
          onClose={() => !actionLoading && setConfirmDialog({ open: false, booking: null, action: '' })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {confirmDialog.action === 'approve' ? '✅ Confirm Approval' : '❌ Confirm Rejection'}
          </DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Are you sure you want to {confirmDialog.action} booking for slot{' '}
              <strong>{confirmDialog.booking?.slot?.slot_number}</strong>?
            </Typography>
            {confirmDialog.booking && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                <Typography variant="body2"><strong>Customer:</strong> {confirmDialog.booking.payer_name}</Typography>
                <Typography variant="body2"><strong>UPI Name:</strong> {confirmDialog.booking.upi_account_name}</Typography>
                <Typography variant="body2"><strong>Amount:</strong> ₹{confirmDialog.booking.slot?.price || 5000}</Typography>
                <Typography variant="body2"><strong>Payment App:</strong> {confirmDialog.booking.payment_app.toUpperCase()}</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setConfirmDialog({ open: false, booking: null, action: '' })} 
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              variant="contained"
              color={confirmDialog.action === 'approve' ? 'success' : 'error'}
              disabled={actionLoading}
              startIcon={actionLoading ? <CircularProgress size={20} /> : null}
            >
              {actionLoading ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>

        <AlertComp
                open={snackbar.open}
                type="error"
                message={snackbar.message}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            />
      </Container>
    </Box>
  );
}