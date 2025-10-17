import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  School,
  Person,
  CheckCircle,
  Notifications,
  TrendingUp,
  QrCodeScanner,
  Schedule,
  Analytics,
  Face
} from '@mui/icons-material';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import apiClient from '../utils/apiClient';
import { toast } from 'react-toastify';
import QRScanner from '../components/QRScanner';
import FaceVerification from '../components/FaceVerification';
import FaceCapture from '../components/FaceCapture';
import FaceRegistrationCheck from '../components/FaceRegistrationCheck';
import ModelStatus from '../components/ModelStatus';
import SimpleTimetable from '../components/SimpleTimetable';
import StudentNotifications from '../components/StudentNotifications';
import { getCurrentLocation } from '../utils/geolocation';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [showFaceVerification, setShowFaceVerification] = useState(false);
  const [showFaceRegistration, setShowFaceRegistration] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [location, setLocation] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [showTimetableDialog, setShowTimetableDialog] = useState(false);
  const [timetableForm, setTimetableForm] = useState({ year: '', division: '' });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [updateForm, setUpdateForm] = useState({
    name: '',
    email: '',
    academicYear: '',
    semester: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState('checking');
  const { user, loadUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttendance();
    fetchNotifications();
    
    // Auto-refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      setUpdateForm({
        name: user.name || '',
        email: user.email || '',
        academicYear: user.academicYear || '',
        semester: user.semester || ''
      });
    }
  }, [user]);

  useEffect(() => {
    calculateStats();
  }, [attendance]);

  const fetchAttendance = async () => {
    try {
      const response = await apiClient.get('/api/attendance/student');
      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/api/notifications/student');
      setNotifications(response.data);
      const unread = response.data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchTimetable = async () => {
    try {
      const response = await apiClient.get(`/timetable?year=${timetableForm.year}&division=${timetableForm.division}`);
      setTimetable(response.data);
      setShowTimetableDialog(false);
    } catch (error) {
      toast.error('Failed to fetch timetable');
    }
  };

  const calculateStats = () => {
    const totalClasses = attendance.length;
    const presentClasses = attendance.filter(a => a.status === 'present').length;
    const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;
    
    setStats({
      totalClasses,
      presentClasses,
      attendancePercentage: attendancePercentage.toFixed(1)
    });
  };

  const handleQRScan = async (scannedQrData) => {
    setLoading(true);
    try {
      const currentLocation = await getCurrentLocation();
      const validateResponse = await apiClient.post('/api/qr/validate', {
        qrCodeId: scannedQrData.id,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      });

      if (validateResponse.data.valid) {
        setQrData(scannedQrData);
        setLocation(currentLocation);
        
        // Check if user has face descriptor registered
        if (!user?.faceDescriptor || !Array.isArray(user.faceDescriptor) || user.faceDescriptor.length === 0) {
          // If no face registered, show face registration dialog
          setShowFaceRegistration(true);
        } else {
          // If face is registered, proceed with verification
          setShowFaceVerification(true);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to validate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleFaceVerification = async (isVerified) => {
    setShowFaceVerification(false);
    if (!isVerified) {
      toast.error('Face verification failed');
      return;
    }

    try {
      await apiClient.post('/api/attendance/mark', {
        qrCodeId: qrData.id,
        latitude: location.latitude,
        longitude: location.longitude,
        faceVerified: true
      });
      toast.success('Attendance marked successfully!');
      fetchAttendance();
      navigate('/student');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const handleFaceReRegistration = async (faceDescriptor) => {
    try {
      await apiClient.put('/api/users/profile', { faceDescriptor });
      toast.success('Face registered successfully!');
      setShowFaceRegistration(false);
      
      // If this was called during attendance marking, proceed with verification
      if (qrData && location) {
        // Update user context with new face descriptor
        user.faceDescriptor = faceDescriptor;
        setShowFaceVerification(true);
      }
    } catch (error) {
      toast.error('Failed to update face registration');
    }
  };

  const handleUpdateProfile = async () => {
    setUpdateLoading(true);
    try {
      await apiClient.put('/api/users/profile', updateForm);
      await loadUser(); // Refresh user data
      toast.success('Profile updated successfully!');
      navigate('/student/profile');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const Dashboard = () => (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar 
            sx={{ 
              width: 60, 
              height: 60, 
              bgcolor: 'primary.main',
              fontSize: '1.5rem'
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {user?.department} Department • {user?.studentId}
            </Typography>
          </Box>
        </Box>
        
        {stats.attendancePercentage < 75 && (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            ⚠️ Your attendance is {stats.attendancePercentage}% - Below required 75%
          </Alert>
        )}
      </Box>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Classes</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {stats.totalClasses || 0}
                  </Typography>
                </Box>
                <School sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Present</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {stats.presentClasses || 0}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: stats.attendancePercentage >= 75 
              ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
              : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: stats.attendancePercentage >= 75
              ? '0 8px 32px rgba(67, 233, 123, 0.3)'
              : '0 8px 32px rgba(250, 112, 154, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Attendance</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {stats.attendancePercentage || 0}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.attendancePercentage || 0} 
                    sx={{ 
                      mt: 1, 
                      bgcolor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'rgba(255,255,255,0.8)'
                      }
                    }}
                  />
                </Box>
                <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            color: '#333',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(168, 237, 234, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Notifications</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {unreadCount}
                  </Typography>
                  {unreadCount > 0 && (
                    <Chip 
                      label="Unread" 
                      size="small" 
                      color="error" 
                      sx={{ mt: 1, fontWeight: 600 }}
                    />
                  )}
                </Box>
                <Notifications sx={{ fontSize: 40, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
          }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              🚀 Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Button 
                  fullWidth
                  variant="contained" 
                  onClick={() => navigate('/student/profile')}
                  startIcon={<Person />}
                  sx={{ 
                    py: 2, 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    textTransform: 'none',
                    fontSize: '1rem'
                  }}
                >
                  My Profile
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button 
                  fullWidth
                  variant="contained" 
                  onClick={() => navigate('/student/mark-attendance')}
                  startIcon={<QrCodeScanner />}
                  sx={{ 
                    py: 2, 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    textTransform: 'none',
                    fontSize: '1rem'
                  }}
                >
                  Mark Attendance
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button 
                  fullWidth
                  variant="outlined" 
                  onClick={() => navigate('/student/attendance')}
                  startIcon={<CheckCircle />}
                  sx={{ 
                    py: 2, 
                    borderRadius: 2,
                    borderColor: '#667eea',
                    color: '#667eea',
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': {
                      borderColor: '#667eea',
                      bgcolor: 'rgba(102, 126, 234, 0.1)'
                    }
                  }}
                >
                  Attendance History
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button 
                  fullWidth
                  variant="outlined" 
                  onClick={() => navigate('/student/analysis')}
                  startIcon={<Analytics />}
                  sx={{ 
                    py: 2, 
                    borderRadius: 2,
                    borderColor: '#667eea',
                    color: '#667eea',
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': {
                      borderColor: '#667eea',
                      bgcolor: 'rgba(102, 126, 234, 0.1)'
                    }
                  }}
                >
                  Analysis
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button 
                  fullWidth
                  variant="outlined" 
                  onClick={() => navigate('/student/timetable')}
                  startIcon={<Schedule />}
                  sx={{ 
                    py: 2, 
                    borderRadius: 2,
                    borderColor: '#667eea',
                    color: '#667eea',
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': {
                      borderColor: '#667eea',
                      bgcolor: 'rgba(102, 126, 234, 0.1)'
                    }
                  }}
                >
                  Timetable
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button 
                  fullWidth
                  variant="outlined" 
                  onClick={() => navigate('/student/notifications')}
                  startIcon={<Notifications />}
                  sx={{ 
                    py: 2, 
                    borderRadius: 2,
                    borderColor: '#667eea',
                    color: '#667eea',
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': {
                      borderColor: '#667eea',
                      bgcolor: 'rgba(102, 126, 234, 0.1)'
                    }
                  }}
                >
                  Notifications
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Timetable Dialog */}
      <Dialog open={showTimetableDialog} onClose={() => setShowTimetableDialog(false)}>
        <DialogTitle>Select Class for Timetable</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={timetableForm.year}
              onChange={(e) => setTimetableForm({...timetableForm, year: e.target.value})}
            >
              <MenuItem value={1}>1st Year</MenuItem>
              <MenuItem value={2}>2nd Year</MenuItem>
              <MenuItem value={3}>3rd Year</MenuItem>
              <MenuItem value={4}>4th Year</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Division</InputLabel>
            <Select
              value={timetableForm.division}
              onChange={(e) => setTimetableForm({...timetableForm, division: e.target.value})}
            >
              <MenuItem value="A">Division A</MenuItem>
              <MenuItem value="B">Division B</MenuItem>
              <MenuItem value="C">Division C</MenuItem>
            </Select>
          </FormControl>
          <Button 
            variant="contained" 
            onClick={fetchTimetable} 
            disabled={!timetableForm.year || !timetableForm.division}
            sx={{ mt: 2 }}
            fullWidth
          >
            View Timetable
          </Button>
        </DialogContent>
      </Dialog>
    </Container>
  );

  const TimetableView = () => <SimpleTimetable />;

  // Other components remain the same...
  const Profile = () => (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 1 }}>
            👤 My Profile
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage your personal information and settings
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Profile Card */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center', boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
              <Avatar 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  fontSize: 48, 
                  bgcolor: '#60b5ff',
                  mx: 'auto',
                  mb: 2,
                  border: '4px solid #ffe588'
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#60b5ff', mb: 1 }}>
                {user?.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {user?.role?.toUpperCase()} • {user?.department}
              </Typography>
              <Box sx={{ bgcolor: '#f0f8ff', borderRadius: 2, p: 2, mb: 3 }}>
                <Typography variant="body2" color="textSecondary">Student ID</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#60b5ff' }}>
                  {user?.studentId}
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                fullWidth
                onClick={() => navigate('/student/update-profile')}
                sx={{ 
                  bgcolor: '#60b5ff', 
                  mb: 2,
                  '&:hover': { bgcolor: '#4a9eff' }
                }}
              >
                ✏️ Edit Profile
              </Button>
              {/* <Button 
                variant="outlined" 
                fullWidth
                onClick={() => setShowFaceRegistration(true)}
                sx={{ 
                  borderColor: '#ffe588', 
                  color: '#f57c00',
                  '&:hover': { bgcolor: '#fff8e1' }
                }}
              >
                🔄 Update Face ID
              </Button> */}
            </Paper>
          </Grid>

          {/* Details Cards */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {/* Personal Info */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
                  <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 3 }}>
                    📝 Personal Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ bgcolor: '#f9f9f9', borderRadius: 2, p: 2 }}>
                        <Typography variant="body2" color="textSecondary">Full Name</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{user?.name}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ bgcolor: '#f9f9f9', borderRadius: 2, p: 2 }}>
                        <Typography variant="body2" color="textSecondary">Email Address</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{user?.email}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ bgcolor: '#f9f9f9', borderRadius: 2, p: 2 }}>
                        <Typography variant="body2" color="textSecondary">Department</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{user?.department}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ bgcolor: '#f9f9f9', borderRadius: 2, p: 2 }}>
                        <Typography variant="body2" color="textSecondary">Academic Year</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{user?.academicYear || 'Not Set'}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ bgcolor: '#f9f9f9', borderRadius: 2, p: 2 }}>
                        <Typography variant="body2" color="textSecondary">Semester</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{user?.semester}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Account Status */}
              

              {/* Face Recognition */}
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
                  <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 2 }}>
                    👤 Face Recognition
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: user?.faceDescriptor ? '#4caf50' : '#f44336' 
                    }} />
                    <Typography sx={{ fontWeight: 600, color: user?.faceDescriptor ? '#4caf50' : '#f44336' }}>
                      {user?.faceDescriptor ? 'Registered' : 'Not Registered'}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {user?.faceDescriptor ? 'Face ID is active for attendance' : 'Register face for attendance'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Back Button */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            variant="outlined"
            onClick={() => navigate('/student')}
            sx={{ 
              borderColor: '#60b5ff', 
              color: '#60b5ff',
              px: 4,
              py: 1.5,
              '&:hover': { bgcolor: 'rgba(96, 181, 255, 0.1)' }
            }}
          >
            ← Back to Dashboard
          </Button>
        </Box>
      </Container>
      
      <Dialog open={showFaceRegistration} onClose={() => setShowFaceRegistration(false)}>
        <DialogTitle sx={{ textAlign: 'center', color: '#60b5ff' }}>Update Face Recognition</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
            Position your face in the camera frame to update your Face ID
          </Typography>
          <FaceCapture onCapture={handleFaceReRegistration} />
        </DialogContent>
      </Dialog>
    </Box>
  );

  const MarkAttendance = () => {
    const [cameraSupported, setCameraSupported] = useState(true);
    const [permissionStatus, setPermissionStatus] = useState('checking');

    useEffect(() => {
      // Check camera support and permissions
      const checkCameraSupport = async () => {
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setCameraSupported(false);
            setPermissionStatus('unsupported');
            return;
          }

          // Check if we can access camera
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
          setPermissionStatus('granted');
        } catch (err) {
          console.error('Camera check error:', err);
          if (err.name === 'NotAllowedError') {
            setPermissionStatus('denied');
          } else if (err.name === 'NotFoundError') {
            setPermissionStatus('no-camera');
          } else {
            setPermissionStatus('error');
          }
        }
      };

      checkCameraSupport();
    }, []);

    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 1 }}>
              📱 Mark Attendance
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Scan QR code to mark your attendance
            </Typography>
          </Box>
          
          <ModelStatus />
          
          <FaceRegistrationCheck 
            user={user} 
            onRegisterFace={() => setShowFaceRegistration(true)} 
          />

          {/* Camera Status Check */}
          {!cameraSupported && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              📷 Camera not supported on this device. Please use a device with camera support.
            </Alert>
          )}

          {permissionStatus === 'denied' && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              🚫 Camera permission denied. Please allow camera access in your browser settings and refresh the page.
            </Alert>
          )}

          {permissionStatus === 'no-camera' && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              📷 No camera found on this device. Please use a device with a camera.
            </Alert>
          )}
          
          {loading && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              ⏳ Validating QR code...
            </Alert>
          )}

          {/* QR Scanner */}
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)',
            mb: 3
          }}>
            {cameraSupported && permissionStatus !== 'no-camera' ? (
              <QRScanner 
                onScan={handleQRScan} 
                onError={(error) => {
                  console.error('QR Scanner Error:', error);
                  toast.error(error);
                }} 
              />
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                  📷 Camera Required
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  QR code scanning requires camera access. Please ensure your device has a camera and grant permission.
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Instructions */}
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3, 
            bgcolor: '#f0f8ff',
            border: '1px solid #e3f2fd'
          }}>
            <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 2 }}>
              📝 Instructions
            </Typography>
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
                Ask your teacher to generate a QR code for the class
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
                Point your back camera at the QR code displayed by teacher
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
                After QR scan, complete face verification (if enabled)
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
                Your attendance will be marked automatically
              </Typography>
            </Box>
          </Paper>
          
          {/* Face Verification Dialog */}
          <Dialog 
            open={showFaceVerification} 
            onClose={() => setShowFaceVerification(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ textAlign: 'center', color: '#60b5ff' }}>
              👤 Face Verification
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
                Please look at the front camera for face verification
              </Typography>
              <FaceVerification 
                userFaceDescriptor={user?.faceDescriptor} 
                onVerificationComplete={handleFaceVerification} 
              />
            </DialogContent>
          </Dialog>
          
          {/* Face Registration Dialog */}
          <Dialog 
            open={showFaceRegistration} 
            onClose={() => setShowFaceRegistration(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ textAlign: 'center', color: '#60b5ff' }}>
              👤 Face Registration Required
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
                You need to register your face before marking attendance.
              </Typography>
              <FaceCapture onCapture={handleFaceReRegistration} />
            </DialogContent>
          </Dialog>

          {/* Back Button */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button 
              variant="outlined"
              onClick={() => navigate('/student')}
              sx={{ 
                borderColor: '#60b5ff', 
                color: '#60b5ff',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                '&:hover': { 
                  bgcolor: 'rgba(96, 181, 255, 0.1)',
                  borderColor: '#4a9eff'
                }
              }}
            >
              ← Back to Dashboard
            </Button>
          </Box>
        </Container>
      </Box>
    );
  };

  const UpdateProfile = () => (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 1 }}>
            ✏️ Update Profile
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Keep your information up to date for better experience
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Profile Preview Card */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center', boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  fontSize: 40, 
                  bgcolor: '#60b5ff',
                  mx: 'auto',
                  mb: 2,
                  border: '3px solid #ffe588'
                }}
              >
                {updateForm.name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || '?'}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#60b5ff', mb: 1 }}>
                {updateForm.name || user?.name || 'Student Name'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {updateForm.academicYear || user?.academicYear} Year • Semester {updateForm.semester || user?.semester}
              </Typography>
              <Box sx={{ bgcolor: '#f0f8ff', borderRadius: 2, p: 2 }}>
                <Typography variant="body2" color="textSecondary">Student ID</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#60b5ff' }}>
                  {user?.studentId}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Update Form */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
              <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 3 }}>
                📝 Personal Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={updateForm.name}
                    onChange={(e) => setUpdateForm({...updateForm, name: e.target.value})}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: '#60b5ff' },
                        '&.Mui-focused fieldset': { borderColor: '#60b5ff' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#60b5ff' }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={updateForm.email}
                    onChange={(e) => setUpdateForm({...updateForm, email: e.target.value})}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: '#60b5ff' },
                        '&.Mui-focused fieldset': { borderColor: '#60b5ff' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#60b5ff' }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Enrollment Number"
                    value={user?.studentId || ''}
                    disabled
                    helperText="Enrollment number cannot be changed"
                    sx={{ bgcolor: '#f9f9f9', borderRadius: 1 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Academic Year</InputLabel>
                    <Select
                      value={updateForm.academicYear}
                      onChange={(e) => setUpdateForm({...updateForm, academicYear: e.target.value})}
                      label="Academic Year"
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                      }}
                    >
                      <MenuItem value="First">First Year (FE)</MenuItem>
                      <MenuItem value="Second">Second Year (SE)</MenuItem>
                      <MenuItem value="Third">Third Year (TE)</MenuItem>
                      <MenuItem value="Fourth">Fourth Year (BE)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Semester</InputLabel>
                    <Select
                      value={updateForm.semester}
                      onChange={(e) => setUpdateForm({...updateForm, semester: e.target.value})}
                      label="Semester"
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                      }}
                    >
                      <MenuItem value={1}>1st Semester</MenuItem>
                      <MenuItem value={2}>2nd Semester</MenuItem>
                      <MenuItem value={3}>3rd Semester</MenuItem>
                      <MenuItem value={4}>4th Semester</MenuItem>
                      <MenuItem value={5}>5th Semester</MenuItem>
                      <MenuItem value={6}>6th Semester</MenuItem>
                      <MenuItem value={7}>7th Semester</MenuItem>
                      <MenuItem value={8}>8th Semester</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Action Buttons */}
              <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  onClick={handleUpdateProfile}
                  disabled={updateLoading}
                  sx={{ 
                    bgcolor: '#60b5ff', 
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#4a9eff' },
                    '&:disabled': { bgcolor: '#ccc' }
                  }}
                  startIcon={updateLoading ? null : <Person />}
                >
                  {updateLoading ? 'Updating...' : 'Update Profile'}
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/student/profile')}
                  sx={{ 
                    borderColor: '#ffe588', 
                    color: '#f57c00',
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    '&:hover': { 
                      bgcolor: '#fff8e1',
                      borderColor: '#ffe588'
                    }
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Tips Card */}
        <Box sx={{ mt: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#f0f8ff', border: '1px solid #e3f2fd' }}>
            <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 2 }}>
              💡 Profile Tips
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
                  <Typography variant="body2">Keep your email updated for important notifications</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
                  <Typography variant="body2">Ensure academic year and semester are correct</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Container>
    </Box>
  );

  const AttendanceHistory = () => {
    const [filteredAttendance, setFilteredAttendance] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage] = useState(10);

    useEffect(() => {
      let filtered = attendance;
      
      if (searchTerm) {
        filtered = filtered.filter(record => 
          record.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (statusFilter !== 'all') {
        filtered = filtered.filter(record => record.status === statusFilter);
      }
      
      if (dateFilter) {
        filtered = filtered.filter(record => 
          new Date(record.date).toISOString().split('T')[0] === dateFilter
        );
      }
      
      setFilteredAttendance(filtered);
      setPage(0);
    }, [attendance, searchTerm, statusFilter, dateFilter]);

    const paginatedData = filteredAttendance.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 1 }}>
              📊 Attendance History
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Track your attendance records and performance
            </Typography>
          </Box>

          {/* Filters */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
            <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 2 }}>
              🔍 Filter Records
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Search Subject/Teacher"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#60b5ff' },
                      '&.Mui-focused fieldset': { borderColor: '#60b5ff' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#60b5ff' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                    sx={{
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                    }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="present">Present</MenuItem>
                    <MenuItem value="absent">Absent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Filter by Date"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#60b5ff' },
                      '&.Mui-focused fieldset': { borderColor: '#60b5ff' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#60b5ff' }
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ background: 'linear-gradient(135deg, #60b5ff 0%, #4a9eff 100%)', color: 'white', borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{filteredAttendance.length}</Typography>
                  <Typography variant="body2">Total Records</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)', color: 'white', borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {filteredAttendance.filter(r => r.status === 'present').length}
                  </Typography>
                  <Typography variant="body2">Present</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)', color: 'white', borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {filteredAttendance.filter(r => r.status === 'absent').length}
                  </Typography>
                  <Typography variant="body2">Absent</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Attendance Table */}
          {filteredAttendance.length > 0 ? (
            <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#f0f8ff' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Teacher</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Time</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Verification</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedData.map((record, index) => (
                      <TableRow 
                        key={record._id} 
                        sx={{ 
                          '&:hover': { bgcolor: '#f8fafc' },
                          bgcolor: index % 2 === 0 ? '#ffffff' : '#fafbfc'
                        }}
                      >
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{record.subject}</TableCell>
                        <TableCell>{record.teacher?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={record.status?.toUpperCase() || 'PRESENT'}
                            color={record.status === 'present' ? 'success' : 'error'}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>{new Date(record.markedAt || record.date).toLocaleTimeString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label={record.faceVerified ? 'Face + QR' : 'QR Only'}
                            color={record.faceVerified ? 'primary' : 'default'}
                            size="small"
                            icon={record.faceVerified ? <Face /> : <QrCodeScanner />}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Pagination */}
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Showing {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredAttendance.length)} of {filteredAttendance.length}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    size="small" 
                    onClick={() => setPage(Math.max(0, page - 1))} 
                    disabled={page === 0}
                    sx={{ color: '#60b5ff' }}
                  >
                    Previous
                  </Button>
                  <Button 
                    size="small" 
                    onClick={() => setPage(page + 1)} 
                    disabled={(page + 1) * rowsPerPage >= filteredAttendance.length}
                    sx={{ color: '#60b5ff' }}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            </Paper>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                📋 No Records Found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {attendance.length === 0 ? 'No attendance records available.' : 'No records match your filter criteria.'}
              </Typography>
            </Paper>
          )}
          
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button 
              variant="outlined"
              onClick={() => navigate('/student')}
              sx={{ 
                borderColor: '#60b5ff', 
                color: '#60b5ff',
                px: 4,
                py: 1.5,
                '&:hover': { bgcolor: 'rgba(96, 181, 255, 0.1)' }
              }}
            >
              ← Back to Dashboard
            </Button>
          </Box>
        </Container>
      </Box>
    );
  };

  const Analysis = () => {
    const [subjectStats, setSubjectStats] = useState([]);
    const [monthlyStats, setMonthlyStats] = useState([]);
    const [weeklyStats, setWeeklyStats] = useState([]);
    const [isDefaulter, setIsDefaulter] = useState(false);
    const [selectedView, setSelectedView] = useState('overview');
    const [selectedSubject, setSelectedSubject] = useState('');

    useEffect(() => {
      calculateAnalysis();
    }, [attendance]);

    const calculateAnalysis = () => {
      if (!attendance.length) return;

      // Subject-wise analysis
      const subjectMap = {};
      attendance.forEach(record => {
        if (!subjectMap[record.subject]) {
          subjectMap[record.subject] = { total: 0, present: 0 };
        }
        subjectMap[record.subject].total++;
        if (record.status === 'present') {
          subjectMap[record.subject].present++;
        }
      });

      const subjects = Object.keys(subjectMap).map(subject => ({
        subject,
        percentage: ((subjectMap[subject].present / subjectMap[subject].total) * 100).toFixed(1),
        present: subjectMap[subject].present,
        total: subjectMap[subject].total
      }));
      setSubjectStats(subjects);

      // Monthly analysis
      const monthMap = {};
      attendance.forEach(record => {
        const month = new Date(record.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!monthMap[month]) {
          monthMap[month] = { total: 0, present: 0 };
        }
        monthMap[month].total++;
        if (record.status === 'present') {
          monthMap[month].present++;
        }
      });

      const monthly = Object.keys(monthMap).map(month => ({
        month,
        percentage: ((monthMap[month].present / monthMap[month].total) * 100).toFixed(1)
      }));
      setMonthlyStats(monthly);

      // Weekly analysis
      const weekMap = {};
      attendance.forEach(record => {
        const week = new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' });
        if (!weekMap[week]) {
          weekMap[week] = { total: 0, present: 0 };
        }
        weekMap[week].total++;
        if (record.status === 'present') {
          weekMap[week].present++;
        }
      });

      const weekly = Object.keys(weekMap).map(day => ({
        day,
        percentage: ((weekMap[day].present / weekMap[day].total) * 100).toFixed(1),
        present: weekMap[day].present,
        total: weekMap[day].total
      }));
      setWeeklyStats(weekly);

      // Check defaulter status (below 75%)
      const overallPercentage = parseFloat(stats.attendancePercentage);
      setIsDefaulter(overallPercentage < 75);
    };

    const COLORS = ['#60b5ff', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4'];

    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 1 }}>
              📊 Attendance Analysis
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Comprehensive insights into your attendance performance
            </Typography>
          </Box>

          {/* View Selector */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Analysis View</InputLabel>
                  <Select
                    value={selectedView}
                    onChange={(e) => setSelectedView(e.target.value)}
                    label="Analysis View"
                    sx={{
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                    }}
                  >
                    <MenuItem value="overview">📈 Overview</MenuItem>
                    <MenuItem value="subjects">📚 Subject Analysis</MenuItem>
                    <MenuItem value="trends">📅 Time Trends</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {selectedView === 'subjects' && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Subject Filter</InputLabel>
                    <Select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      label="Subject Filter"
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                      }}
                    >
                      <MenuItem value="">All Subjects</MenuItem>
                      {subjectStats.map(subject => (
                        <MenuItem key={subject.subject} value={subject.subject}>{subject.subject}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </Paper>
        
          {/* Status Alert */}
          {isDefaulter ? (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
              <Typography variant="h6">⚠️ Attendance Alert</Typography>
              <Typography>Your attendance is {stats.attendancePercentage}% - Below required 75%. Immediate action needed!</Typography>
            </Alert>
          ) : (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>
              <Typography variant="h6">✅ Excellent Performance</Typography>
              <Typography>Your attendance is {stats.attendancePercentage}% - Above required 75%. Keep up the great work!</Typography>
            </Alert>
          )}

          {selectedView === 'overview' && (
            <>
              {/* Performance Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #60b5ff 0%, #4a9eff 100%)', color: 'white', borderRadius: 3, height: 140 }}>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>{stats.attendancePercentage}%</Typography>
                      <Typography variant="body2">Overall Attendance</Typography>
                      <Typography variant="caption">{stats.presentClasses}/{stats.totalClasses} classes</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: isDefaulter ? 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)' : 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)', color: 'white', borderRadius: 3, height: 140 }}>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {Math.max(0, Math.ceil((75 * stats.totalClasses / 100) - stats.presentClasses))}
                      </Typography>
                      <Typography variant="body2">Classes Needed</Typography>
                      <Typography variant="caption">to reach 75%</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', color: 'white', borderRadius: 3, height: 140 }}>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>{subjectStats.length}</Typography>
                      <Typography variant="body2">Total Subjects</Typography>
                      <Typography variant="caption">being tracked</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)', color: 'white', borderRadius: 3, height: 140 }}>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {subjectStats.filter(s => parseFloat(s.percentage) >= 75).length}
                      </Typography>
                      <Typography variant="body2">Safe Subjects</Typography>
                      <Typography variant="caption">above 75%</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Charts Row */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, borderRadius: 3, height: 400, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
                    <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 2 }}>📚 Subject Performance</Typography>
                    {subjectStats.length > 0 && (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={subjectStats}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({subject, percentage}) => `${subject}: ${percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="percentage"
                          >
                            {subjectStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, borderRadius: 3, height: 400, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
                    <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 2 }}>📅 Weekly Pattern</Typography>
                    {weeklyStats.length > 0 && (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={weeklyStats}>
                          <XAxis dataKey="day" />
                          <YAxis domain={[0, 100]} />
                          <Bar dataKey="percentage" fill="#60b5ff" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}

          {selectedView === 'subjects' && (
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
              <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 3 }}>📚 Subject-wise Analysis</Typography>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#f0f8ff' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Present</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Percentage</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Progress</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subjectStats
                      .filter(subject => !selectedSubject || subject.subject === selectedSubject)
                      .map((subject, index) => (
                      <TableRow key={subject.subject} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                        <TableCell sx={{ fontWeight: 600 }}>{subject.subject}</TableCell>
                        <TableCell>{subject.present}</TableCell>
                        <TableCell>{subject.total}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${subject.percentage}%`}
                            color={subject.percentage < 75 ? 'error' : 'success'}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={subject.percentage < 75 ? 'AT RISK' : 'SAFE'}
                            color={subject.percentage < 75 ? 'error' : 'success'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ width: 200 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min(100, subject.percentage)} 
                              sx={{ 
                                flexGrow: 1, 
                                height: 8, 
                                borderRadius: 4,
                                bgcolor: '#e0e0e0',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: subject.percentage < 75 ? '#f44336' : '#4caf50',
                                  borderRadius: 4
                                }
                              }}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {selectedView === 'trends' && (
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
              <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 3 }}>📈 Monthly Attendance Trends</Typography>
              {monthlyStats.length > 0 && (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyStats}>
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Bar dataKey="percentage" fill="#60b5ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Paper>
          )}

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button 
              variant="outlined"
              onClick={() => navigate('/student')}
              sx={{ 
                borderColor: '#60b5ff', 
                color: '#60b5ff',
                px: 4,
                py: 1.5,
                '&:hover': { bgcolor: 'rgba(96, 181, 255, 0.1)' }
              }}
            >
              ← Back to Dashboard
            </Button>
          </Box>
        </Container>
      </Box>
    );
  };

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/update-profile" element={<UpdateProfile />} />
      <Route path="/attendance" element={<AttendanceHistory />} />
      <Route path="/analysis" element={<Analysis />} />
      <Route path="/mark-attendance" element={<MarkAttendance />} />
      <Route path="/timetable" element={<TimetableView />} />
      <Route path="/notifications" element={<StudentNotifications />} />
    </Routes>
  );
};

export default StudentDashboard;