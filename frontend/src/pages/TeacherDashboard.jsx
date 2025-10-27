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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  School,
  Person,
  CheckCircle,
  QrCode2,
  Analytics,
  Groups,
  Assignment,
  Schedule,
  Notifications,
  TrendingUp,
  Face,
  QrCodeScanner
} from '@mui/icons-material';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import apiClient from '../utils/apiClient';
import { toast } from 'react-toastify';
import FaceCapture from '../components/FaceCapture';
import { getCurrentLocation } from '../utils/geolocation';
import { useAuth } from '../context/AuthContext';
import Timetable from '../components/Timetable';
import SendNotification from '../components/SendNotification';

const TeacherDashboard = () => {
  const [qrCode, setQrCode] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [openNotificationDialog, setOpenNotificationDialog] = useState(false);
  const [showFaceRegistration, setShowFaceRegistration] = useState(false);
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [qrForm, setQrForm] = useState({ subject: '', duration: 10 });
  const [notificationForm, setNotificationForm] = useState({ message: '', type: 'info' });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await apiClient.get('/api/users/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAttendance = async (subject, date) => {
    try {
      const params = new URLSearchParams();
      if (subject) params.append('subject', subject);
      if (date) params.append('date', date);
      
      const response = await apiClient.get(`/api/attendance/class?${params}`);
      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const generateQRCode = async () => {
    try {
      const location = await getCurrentLocation();
      const response = await apiClient.post('/api/qr/generate', {
        subject: qrForm.subject,
        duration: qrForm.duration,
        latitude: location.latitude,
        longitude: location.longitude
      });
      setQrCode(response.data);
      setOpenQRDialog(false);
      toast.success('QR Code generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate QR code');
    }
  };

  const handleFaceReRegistration = async (faceDescriptor) => {
    try {
      await apiClient.put('/api/users/profile', { faceDescriptor });
      toast.success('Face re-registered successfully!');
      setShowFaceRegistration(false);
    } catch (error) {
      toast.error('Failed to update face registration');
    }
  };

  const sendNotification = () => {
    toast.success('Notification sent successfully!');
    setOpenNotificationDialog(false);
    setNotificationForm({ message: '', type: 'info' });
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              Welcome back, Prof. {user?.name?.split(' ')[0]}! 👨‍🏫
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {user?.department} Department • Teacher Portal
            </Typography>
          </Box>
        </Box>
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
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Students</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {students.length}
                  </Typography>
                </Box>
                <Groups sx={{ fontSize: 40, opacity: 0.8 }} />
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
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Today's Attendance</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {attendance.length}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(250, 112, 154, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Active QR Codes</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {qrCode ? '1' : '0'}
                  </Typography>
                </Box>
                <QrCode2 sx={{ fontSize: 40, opacity: 0.8 }} />
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
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Classes Today</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    5
                  </Typography>
                </Box>
                <Schedule sx={{ fontSize: 40, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card sx={{ 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                🚀 Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    sx={{ 
                      py: 1.5, 
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                      }
                    }}
                    startIcon={<Person />}
                    onClick={() => navigate('/teacher/profile')}
                  >
                    My Profile
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    sx={{ 
                      py: 1.5, 
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #3d8bfe 0%, #00d4fe 100%)'
                      }
                    }}
                    startIcon={<QrCode2 />}
                    onClick={() => navigate('/teacher/generate-qr')}
                  >
                    Generate QR
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    sx={{ py: 1.5, borderRadius: 2 }}
                    startIcon={<School />}
                    onClick={() => navigate('/teacher/classes')}
                  >
                    Manage Classes
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    sx={{ py: 1.5, borderRadius: 2 }}
                    startIcon={<Groups />}
                    onClick={() => navigate('/teacher/students')}
                  >
                    Manage Students
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    sx={{ py: 1.5, borderRadius: 2 }}
                    startIcon={<Assignment />}
                    onClick={() => navigate('/teacher/attendance')}
                  >
                    Attendance History
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    sx={{ py: 1.5, borderRadius: 2 }}
                    startIcon={<Analytics />}
                    onClick={() => navigate('/teacher/analysis')}
                  >
                    Analytics
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    sx={{ py: 1.5, borderRadius: 2 }}
                    startIcon={<Schedule />}
                    onClick={() => navigate('/teacher/timetable')}
                  >
                    Timetable
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    sx={{ py: 1.5, borderRadius: 2 }}
                    startIcon={<Notifications />}
                    onClick={() => navigate('/teacher/send-notification')}
                  >
                    Send Notification
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {qrCode && (
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  📱 Active QR Code
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Subject: {qrCode.subject}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
                  Expires: {new Date(qrCode.expiresAt).toLocaleString()}
                </Typography>
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: 'rgba(255, 255, 255, 0.9)', 
                  borderRadius: 2,
                  display: 'inline-block'
                }}>
                  <img src={qrCode.qrCode} alt="QR Code" style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Today's Overview */}
        <Grid item xs={12}>
          <Card sx={{ 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                📊 Today's Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                      {students.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Students
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                      {attendance.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Attendance Marked
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                      {attendance.length > 0 ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100) : 0}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Attendance Rate
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* QR Generation Dialog */}
      <Dialog open={openQRDialog} onClose={() => setOpenQRDialog(false)}>
        <DialogTitle>Generate QR Code</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Subject"
            fullWidth
            variant="outlined"
            value={qrForm.subject}
            onChange={(e) => setQrForm({...qrForm, subject: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Duration (minutes)"
            type="number"
            fullWidth
            variant="outlined"
            value={qrForm.duration}
            onChange={(e) => setQrForm({...qrForm, duration: parseInt(e.target.value)})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQRDialog(false)}>Cancel</Button>
          <Button onClick={generateQRCode} variant="contained">Generate</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Dialog */}
      <Dialog open={openNotificationDialog} onClose={() => setOpenNotificationDialog(false)}>
        <DialogTitle>Send Notification</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Message"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={notificationForm.message}
            onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={notificationForm.type}
              onChange={(e) => setNotificationForm({...notificationForm, type: e.target.value})}
            >
              <MenuItem value="info">Info</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="success">Success</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNotificationDialog(false)}>Cancel</Button>
          <Button onClick={sendNotification} variant="contained">Send</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );

  const Profile = () => (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 1 }}>
            👨‍🏫 Teacher Profile
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage your teaching profile and account settings
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
                Prof. {user?.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {user?.role?.toUpperCase()} • {user?.department} Department
              </Typography>
              <Box sx={{ bgcolor: '#f0f8ff', borderRadius: 2, p: 2, mb: 3 }}>
                <Typography variant="body2" color="textSecondary">Employee ID</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#60b5ff' }}>
                  {user?.employeeId || user?._id?.slice(-6)?.toUpperCase()}
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                fullWidth
                onClick={() => navigate('/teacher/update-profile')}
                sx={{ 
                  bgcolor: '#60b5ff', 
                  mb: 2,
                  '&:hover': { bgcolor: '#4a9eff' }
                }}
              >
                ✏️ Edit Profile
              </Button>
              <Button 
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
              </Button>
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
                        <Typography variant="body2" color="textSecondary">Role</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{user?.role?.toUpperCase()}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Teaching Stats */}
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
                  <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 2 }}>
                    📚 Teaching Stats
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h4" sx={{ color: '#60b5ff', fontWeight: 'bold' }}>
                      {students.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">Total Students</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                      5
                    </Typography>
                    <Typography variant="body2" color="textSecondary">Active Classes</Typography>
                  </Box>
                </Paper>
              </Grid>

              

              {/* Face Recognition */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
                  <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 2 }}>
                    👤 Face Recognition Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: user?.faceDescriptor ? '#4caf50' : '#f44336' 
                    }} />
                    <Typography sx={{ fontWeight: 600, color: user?.faceDescriptor ? '#4caf50' : '#f44336' }}>
                      {user?.faceDescriptor ? 'Face ID Registered' : 'Face ID Not Registered'}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {user?.faceDescriptor 
                      ? 'Face recognition is active for secure access' 
                      : 'Register your face for enhanced security'
                    }
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
            onClick={() => navigate('/teacher')}
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

  const GenerateQR = () => {
    const [qrForm, setQrForm] = useState({
      department: user?.department || '',
      class: '',
      division: '',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '',
      type: 'lecture',
      subject: '',
      duration: 10
    });
    const [loading, setLoading] = useState(false);
    const [generatedQR, setGeneratedQR] = useState(null);
    const [liveAttendance, setLiveAttendance] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState(1);

    useEffect(() => {
      let interval;
      if (generatedQR) {
        interval = setInterval(async () => {
          try {
            const response = await apiClient.get(`/api/attendance/live/${generatedQR._id}`);
            setLiveAttendance(response.data || []);
          } catch (error) {
            console.error('Live tracking error:', error);
          }
        }, 3000);
      }
      return () => clearInterval(interval);
    }, [generatedQR]);

    const handleGenerateQR = async () => {
      setLoading(true);
      try {
        const location = await getCurrentLocation();
        const response = await apiClient.post('/api/qr/generate', {
          ...qrForm,
          latitude: location.latitude,
          longitude: location.longitude
        });
        setGeneratedQR(response.data);
        setLiveAttendance([]);
        setStep(2);
        toast.success('QR Code generated successfully!');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to generate QR code');
      } finally {
        setLoading(false);
      }
    };

    const submitAttendance = async () => {
      setSubmitting(true);
      try {
        await apiClient.post('/api/attendance/submit', {
          qrCodeId: generatedQR._id,
          attendanceList: liveAttendance
        });
        toast.success('Attendance submitted successfully!');
        setGeneratedQR(null);
        setLiveAttendance([]);
        setStep(1);
      } catch (error) {
        toast.error('Failed to submit attendance');
      } finally {
        setSubmitting(false);
      }
    };

    const resetForm = () => {
      setGeneratedQR(null);
      setLiveAttendance([]);
      setStep(1);
    };

    const isFormValid = qrForm.department && qrForm.class && qrForm.division && qrForm.subject && qrForm.timeSlot;

    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 1 }}>
              📱 Generate QR Code
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Create dynamic QR codes for attendance tracking
            </Typography>
          </Box>

          {/* Step Indicator */}
          <Paper sx={{ p: 2, mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  bgcolor: step >= 1 ? '#60b5ff' : '#e0e0e0',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>1</Box>
                <Typography sx={{ color: step >= 1 ? '#60b5ff' : '#999', fontWeight: step >= 1 ? 'bold' : 'normal' }}>Setup Class</Typography>
              </Box>
              <Box sx={{ width: 40, height: 2, bgcolor: step >= 2 ? '#60b5ff' : '#e0e0e0' }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  bgcolor: step >= 2 ? '#60b5ff' : '#e0e0e0',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>2</Box>
                <Typography sx={{ color: step >= 2 ? '#60b5ff' : '#999', fontWeight: step >= 2 ? 'bold' : 'normal' }}>Track Attendance</Typography>
              </Box>
            </Box>
          </Paper>
        
          {step === 1 && (
            <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
              <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 3 }}>
                ⚙️ Class Configuration
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Department</InputLabel>
                    <Select
                      value={qrForm.department}
                      onChange={(e) => setQrForm({...qrForm, department: e.target.value})}
                      label="Department"
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                      }}
                    >
                      <MenuItem value="IT">Information Technology</MenuItem>
                      <MenuItem value="Computer">Computer Engineering</MenuItem>
                      <MenuItem value="Mechanical">Mechanical Engineering</MenuItem>
                      <MenuItem value="Civil">Civil Engineering</MenuItem>
                      <MenuItem value="Electrical">Electrical Engineering</MenuItem>
                      <MenuItem value="Electronics and Telecommunication">Electronics & Telecommunication</MenuItem>
                      <MenuItem value="Artificial Intelligence & Data Science">AI & Data Science</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Academic Year</InputLabel>
                    <Select
                      value={qrForm.class}
                      onChange={(e) => setQrForm({...qrForm, class: e.target.value})}
                      label="Academic Year"
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                      }}
                    >
                      <MenuItem value="FE">First Year (FE)</MenuItem>
                      <MenuItem value="SE">Second Year (SE)</MenuItem>
                      <MenuItem value="TE">Third Year (TE)</MenuItem>
                      <MenuItem value="BE">Final Year (BE)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Division</InputLabel>
                    <Select
                      value={qrForm.division}
                      onChange={(e) => setQrForm({...qrForm, division: e.target.value})}
                      label="Division"
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                      }}
                    >
                      <MenuItem value="A">Division A</MenuItem>
                      <MenuItem value="B">Division B</MenuItem>
                      <MenuItem value="C">Division C</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={qrForm.date}
                    onChange={(e) => setQrForm({...qrForm, date: e.target.value})}
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
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Time Slot</InputLabel>
                    <Select
                      value={qrForm.timeSlot}
                      onChange={(e) => setQrForm({...qrForm, timeSlot: e.target.value})}
                      label="Time Slot"
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                      }}
                    >
                      <MenuItem value="9:00-10:00">🌅 9:00 AM - 10:00 AM</MenuItem>
                      <MenuItem value="10:00-11:00">🌅 10:00 AM - 11:00 AM</MenuItem>
                      <MenuItem value="11:00-12:00">☀️ 11:00 AM - 12:00 PM</MenuItem>
                      <MenuItem value="12:00-13:00">🌇 12:00 PM - 1:00 PM</MenuItem>
                      <MenuItem value="14:00-15:00">🌆 2:00 PM - 3:00 PM</MenuItem>
                      <MenuItem value="15:00-16:00">🌆 3:00 PM - 4:00 PM</MenuItem>
                      <MenuItem value="16:00-17:00">🌇 4:00 PM - 5:00 PM</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Session Type</InputLabel>
                    <Select
                      value={qrForm.type}
                      onChange={(e) => setQrForm({...qrForm, type: e.target.value})}
                      label="Session Type"
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                      }}
                    >
                      <MenuItem value="lecture">📚 Lecture</MenuItem>
                      <MenuItem value="practical">🔬 Practical</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject Name"
                    value={qrForm.subject}
                    onChange={(e) => setQrForm({...qrForm, subject: e.target.value})}
                    placeholder="e.g., Data Structures, Web Development"
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
                    label="QR Code Duration (minutes)"
                    type="number"
                    value={qrForm.duration}
                    onChange={(e) => setQrForm({...qrForm, duration: parseInt(e.target.value)})}
                    inputProps={{ min: 1, max: 60 }}
                    helperText="QR code will expire after this duration. Students must be within 20 meters of your location to mark attendance."
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

              <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  onClick={handleGenerateQR}
                  disabled={loading || !isFormValid}
                  size="large"
                  sx={{ 
                    bgcolor: '#60b5ff', 
                    px: 4,
                    py: 1.5,
                    '&:hover': { bgcolor: '#4a9eff' },
                    '&:disabled': { bgcolor: '#ccc' }
                  }}
                  startIcon={loading ? null : <QrCode2 />}
                >
                  {loading ? 'Generating QR Code...' : 'Generate QR Code'}
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/teacher')}
                  size="large"
                  sx={{ 
                    borderColor: '#ffe588', 
                    color: '#f57c00',
                    px: 4,
                    py: 1.5,
                    '&:hover': { bgcolor: '#fff8e1' }
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Paper>
          )}

          {step === 2 && generatedQR && (
            <>
              <Grid container spacing={4}>
                {/* QR Code Display */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
                    <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 2 }}>
                      📱 Active QR Code
                    </Typography>
                    
                    <Box sx={{ bgcolor: '#f0f8ff', borderRadius: 2, p: 2, mb: 3 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#60b5ff' }}>
                        {qrForm.subject}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {qrForm.class} {qrForm.division} • {qrForm.timeSlot}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Expires: {new Date(generatedQR.expiresAt).toLocaleTimeString()}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'inline-block',
                      p: 2, 
                      bgcolor: 'white', 
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      <img 
                        src={generatedQR.qrCode} 
                        alt="QR Code" 
                        style={{ maxWidth: '100%', height: 'auto', display: 'block' }} 
                      />
                    </Box>
                    
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                      Students must be within 20 meters of your location to mark attendance
                    </Typography>
                  </Paper>
                </Grid>
                
                {/* Live Attendance Tracking */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold' }}>
                        📊 Live Attendance Tracker
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip 
                          label={`${liveAttendance.length} Present`}
                          color="success"
                          sx={{ fontWeight: 'bold' }}
                        />
                        <Chip 
                          label="🔴 LIVE"
                          color="error"
                          sx={{ fontWeight: 'bold', animation: 'pulse 2s infinite' }}
                        />
                      </Box>
                    </Box>
                    
                    {/* Quick Stats */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                          <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                            {liveAttendance.length}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">Scanned</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#e8f5e8', borderRadius: 2 }}>
                          <Typography variant="h5" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                            {liveAttendance.filter(r => r.faceVerified).length}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">Face ID</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#fff3e0', borderRadius: 2 }}>
                          <Typography variant="h5" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                            {liveAttendance.filter(r => !r.faceVerified).length}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">QR Only</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    {/* Live Feed */}
                    <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #e0e7ff', borderRadius: 2, p: 1 }}>
                      {liveAttendance.length > 0 ? (
                        liveAttendance.map((record, index) => (
                          <Box 
                            key={record._id || index}
                            sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              py: 1.5, 
                              px: 2,
                              mb: 1,
                              bgcolor: index % 2 === 0 ? '#f8fafc' : 'white',
                              borderRadius: 2,
                              border: '1px solid #e0e7ff',
                              animation: index === 0 ? 'slideIn 0.5s ease-out' : 'none'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ bgcolor: record.faceVerified ? '#4caf50' : '#ff9800', width: 32, height: 32 }}>
                                {record.student?.name?.charAt(0)?.toUpperCase() || '?'}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {record.student?.name || 'Unknown Student'}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {record.student?.studentId || 'No ID'}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
                                {new Date(record.markedAt || Date.now()).toLocaleTimeString()}
                              </Typography>
                              <Chip 
                                label={record.faceVerified ? '✅ Verified' : '📱 QR Only'}
                                size="small"
                                color={record.faceVerified ? 'success' : 'warning'}
                                sx={{ fontSize: '0.7rem' }}
                              />
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                          <Box sx={{ 
                            width: 60, 
                            height: 60, 
                            borderRadius: '50%', 
                            bgcolor: '#e3f2fd', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                            animation: 'pulse 2s infinite'
                          }}>
                            <QrCodeScanner sx={{ fontSize: 30, color: '#1976d2' }} />
                          </Box>
                          <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                            🕰️ Waiting for Students
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Students will appear here as they scan the QR code
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    {/* Auto-refresh indicator */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, gap: 1 }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: '#4caf50',
                        animation: 'pulse 1s infinite'
                      }} />
                      <Typography variant="caption" color="textSecondary">
                        Auto-refreshing every 3 seconds
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* Attendance Summary & Actions */}
              <Paper sx={{ p: 3, mt: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
                <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 3 }}>
                  📋 Attendance Summary & Actions
                </Typography>
                
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                        {liveAttendance.length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">Total Present</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e8', borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                        {liveAttendance.filter(r => r.faceVerified).length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">Face Verified</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                        {((liveAttendance.filter(r => r.faceVerified).length / Math.max(liveAttendance.length, 1)) * 100).toFixed(0)}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">Verification Rate</Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                {liveAttendance.length > 0 && (
                  <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                    📝 Ready to submit attendance for <strong>{qrForm.subject}</strong> - 
                    <strong>{qrForm.class} {qrForm.division}</strong> on <strong>{new Date(qrForm.date).toLocaleDateString()}</strong>
                  </Alert>
                )}
                
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button 
                    variant="contained" 
                    onClick={submitAttendance}
                    disabled={submitting || liveAttendance.length === 0}
                    size="large"
                    sx={{ 
                      bgcolor: '#4caf50', 
                      px: 4,
                      py: 1.5,
                      minWidth: 200,
                      '&:hover': { bgcolor: '#45a049' },
                      '&:disabled': { bgcolor: '#ccc' }
                    }}
                    startIcon={submitting ? null : <CheckCircle />}
                  >
                    {submitting ? 'Submitting Attendance...' : `✅ Submit Attendance (${liveAttendance.length})`}
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    onClick={resetForm}
                    size="large"
                    sx={{ 
                      borderColor: '#60b5ff', 
                      color: '#60b5ff',
                      px: 4,
                      py: 1.5,
                      '&:hover': { bgcolor: 'rgba(96, 181, 255, 0.1)' }
                    }}
                  >
                    🔄 Generate New QR
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate('/teacher')}
                    size="large"
                    sx={{ 
                      borderColor: '#ffe588', 
                      color: '#f57c00',
                      px: 4,
                      py: 1.5,
                      '&:hover': { bgcolor: '#fff8e1' }
                    }}
                  >
                    ← Back to Dashboard
                  </Button>
                </Box>
                
                {liveAttendance.length === 0 && (
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      ⚠️ No students have scanned the QR code yet. Submit button will be enabled once students start marking attendance.
                    </Typography>
                  </Box>
                )}
              </Paper>
            </>
          )}
        </Container>
      </Box>
    );
  };

  const UpdateProfile = () => {
    const [formData, setFormData] = useState({
      name: user?.name || '',
      email: user?.email || '',
      department: user?.department || ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        await apiClient.put('/api/users/profile', formData);
        toast.success('Profile updated successfully!');
        navigate('/teacher/profile');
      } catch (error) {
        toast.error('Failed to update profile');
      } finally {
        setLoading(false);
      }
    };

    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 1 }}>
              👨‍🏫 Update Teacher Profile
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Keep your teaching profile information current and accurate
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
                  {formData.name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || '?'}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#60b5ff', mb: 1 }}>
                  Prof. {formData.name || user?.name || 'Teacher Name'}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {formData.department || user?.department} Department
                </Typography>
                <Box sx={{ bgcolor: '#f0f8ff', borderRadius: 2, p: 2 }}>
                  <Typography variant="body2" color="textSecondary">Employee ID</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#60b5ff' }}>
                    {user?.employeeId || user?._id?.slice(-6)?.toUpperCase()}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Update Form */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
                <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 3 }}>
                  📝 Professional Information
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                    <FormControl fullWidth>
                      <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Department</InputLabel>
                      <Select
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        label="Department"
                        sx={{
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                        }}
                      >
                        <MenuItem value="IT">Information Technology</MenuItem>
                        <MenuItem value="Computer">Computer Engineering</MenuItem>
                        <MenuItem value="Mechanical">Mechanical Engineering</MenuItem>
                        <MenuItem value="Civil">Civil Engineering</MenuItem>
                        <MenuItem value="Electrical">Electrical Engineering</MenuItem>
                        <MenuItem value="Electronics and Telecommunication">Electronics & Telecommunication</MenuItem>
                        <MenuItem value="Artificial Intelligence & Data Science">AI & Data Science</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button 
                    variant="contained" 
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{ 
                      bgcolor: '#60b5ff', 
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      '&:hover': { bgcolor: '#4a9eff' },
                      '&:disabled': { bgcolor: '#ccc' }
                    }}
                    startIcon={loading ? null : <Person />}
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate('/teacher/profile')}
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

          {/* Professional Tips Card */}
          <Box sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#f0f8ff', border: '1px solid #e3f2fd' }}>
              <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 2 }}>
                🎯 Professional Tips
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
                    <Typography variant="body2">Keep contact information updated for student communication</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
                    <Typography variant="body2">Ensure department is correct for proper class assignments</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Container>
      </Box>
    );
  };

  const ManageClasses = () => {
    const [classes, setClasses] = useState([]);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [classForm, setClassForm] = useState({
      subject: '',
      department: user?.department || '',
      class: '',
      division: '',
      type: 'lecture'
    });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterDepartment, setFilterDepartment] = useState('all');
    const [viewMode, setViewMode] = useState('grid');

    const filteredClasses = classes.filter(cls => {
      const matchesSearch = cls.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cls.class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cls.division?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || cls.type === filterType;
      const matchesDept = filterDepartment === 'all' || cls.department === filterDepartment;
      return matchesSearch && matchesType && matchesDept;
    });

    useEffect(() => {
      fetchClasses();
    }, []);

    const fetchClasses = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/api/classes/teacher');
        console.log('Classes response:', response.data);
        setClasses(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to fetch classes');
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    const handleAddClass = async () => {
      if (!isFormValid) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      setLoading(true);
      try {
        console.log('Adding class:', classForm);
        const response = await apiClient.post('/api/classes', classForm);
        console.log('Class added:', response.data);
        toast.success('Class added successfully!');
        setOpenAddDialog(false);
        setClassForm({
          subject: '',
          department: user?.department || '',
          class: '',
          division: '',
          type: 'lecture'
        });
        await fetchClasses();
      } catch (error) {
        console.error('Add class error:', error);
        toast.error(error.response?.data?.message || 'Failed to add class');
      } finally {
        setLoading(false);
      }
    };

    const handleRemoveClass = async (classId) => {
      if (window.confirm('Are you sure you want to remove this class?')) {
        try {
          await apiClient.delete(`/api/classes/${classId}`);
          toast.success('Class removed successfully!');
          fetchClasses();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to remove class');
        }
      }
    };

    const isFormValid = classForm.subject && classForm.department && classForm.class && classForm.division;

    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 1 }}>
              🏫 Manage Classes
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Organize and manage your teaching assignments
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #60b5ff 0%, #4a9eff 100%)', color: 'white', borderRadius: 3, height: 120 }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>{classes.length}</Typography>
                  <Typography variant="body2">Total Classes</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)', color: 'white', borderRadius: 3, height: 120 }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {classes.filter(c => c.type === 'lecture').length}
                  </Typography>
                  <Typography variant="body2">Lectures</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', color: 'white', borderRadius: 3, height: 120 }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {classes.filter(c => c.type === 'practical').length}
                  </Typography>
                  <Typography variant="body2">Practicals</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)', color: 'white', borderRadius: 3, height: 120 }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {new Set(classes.map(c => c.subject)).size}
                  </Typography>
                  <Typography variant="body2">Subjects</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filters and Controls */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold' }}>
                🔍 Filter & Search
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setViewMode('grid')}
                  sx={{ 
                    bgcolor: viewMode === 'grid' ? '#60b5ff' : 'transparent',
                    borderColor: '#60b5ff',
                    color: viewMode === 'grid' ? 'white' : '#60b5ff'
                  }}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setViewMode('table')}
                  sx={{ 
                    bgcolor: viewMode === 'table' ? '#60b5ff' : 'transparent',
                    borderColor: '#60b5ff',
                    color: viewMode === 'table' ? 'white' : '#60b5ff'
                  }}
                >
                  Table
                </Button>
              </Box>
            </Box>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Search Classes"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by subject, class, division..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#60b5ff' },
                      '&.Mui-focused fieldset': { borderColor: '#60b5ff' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#60b5ff' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Type Filter</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Type Filter"
                    sx={{
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                    }}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="lecture">📚 Lecture</MenuItem>
                    <MenuItem value="practical">🔬 Practical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Department</InputLabel>
                  <Select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    label="Department"
                    sx={{
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                    }}
                  >
                    <MenuItem value="all">All Departments</MenuItem>
                    <MenuItem value="IT">IT</MenuItem>
                    <MenuItem value="Computer">Computer</MenuItem>
                    <MenuItem value="Mechanical">Mechanical</MenuItem>
                    <MenuItem value="Civil">Civil</MenuItem>
                    <MenuItem value="Electrical">Electrical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => setOpenAddDialog(true)}
                  sx={{ 
                    bgcolor: '#60b5ff', 
                    py: 1.5,
                    '&:hover': { bgcolor: '#4a9eff' }
                  }}
                  startIcon={<School />}
                >
                  Add Class
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Classes Display */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Typography variant="h6" color="textSecondary">Loading classes...</Typography>
            </Box>
          ) : filteredClasses.length > 0 ? (
            viewMode === 'grid' ? (
              <Grid container spacing={3}>
                {filteredClasses.map((cls) => (
                  <Grid item xs={12} sm={6} md={4} key={cls._id}>
                    <Card sx={{ 
                      borderRadius: 3, 
                      boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)',
                      '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#60b5ff' }}>
                            {cls.subject}
                          </Typography>
                          <Chip 
                            label={cls.type}
                            color={cls.type === 'practical' ? 'secondary' : 'primary'}
                            size="small"
                            icon={cls.type === 'practical' ? <Assignment /> : <School />}
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            🏫 {cls.department}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            🎓 {cls.class} - Division {cls.division}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => handleRemoveClass(cls._id)}
                            sx={{ 
                              borderColor: '#f44336',
                              color: '#f44336',
                              '&:hover': { bgcolor: '#ffebee' }
                            }}
                          >
                            Remove
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f0f8ff' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Subject</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Department</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Class</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Division</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredClasses.map((cls, index) => (
                        <TableRow 
                          key={cls._id}
                          sx={{ 
                            '&:hover': { bgcolor: '#f8fafc' },
                            bgcolor: index % 2 === 0 ? '#ffffff' : '#fafbfc'
                          }}
                        >
                          <TableCell sx={{ fontWeight: 600 }}>{cls.subject}</TableCell>
                          <TableCell>{cls.department}</TableCell>
                          <TableCell>{cls.class}</TableCell>
                          <TableCell>{cls.division}</TableCell>
                          <TableCell>
                            <Chip 
                              label={cls.type}
                              color={cls.type === 'practical' ? 'secondary' : 'primary'}
                              size="small"
                              icon={cls.type === 'practical' ? <Assignment /> : <School />}
                            />
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outlined" 
                              color="error" 
                              size="small"
                              onClick={() => handleRemoveClass(cls._id)}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )
          ) : (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                📋 {classes.length === 0 ? 'No Classes Yet' : 'No Matching Classes'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                {classes.length === 0 
                  ? 'Start by adding your first class to begin managing your teaching schedule.'
                  : 'Try adjusting your search or filter criteria to find classes.'
                }
              </Typography>
              {classes.length === 0 && (
                <Button 
                  variant="contained" 
                  onClick={() => setOpenAddDialog(true)}
                  sx={{ bgcolor: '#60b5ff', '&:hover': { bgcolor: '#4a9eff' } }}
                  startIcon={<School />}
                >
                  Add Your First Class
                </Button>
              )}
            </Paper>
          )}

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button 
              variant="outlined"
              onClick={() => navigate('/teacher')}
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

          {/* Add Class Dialog */}
          <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ textAlign: 'center', color: '#60b5ff', pb: 1 }}>
              🏫 Add New Class
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject Name"
                    value={classForm.subject}
                    onChange={(e) => setClassForm({...classForm, subject: e.target.value})}
                    placeholder="e.g., Data Structures, Web Development"
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
                  <FormControl fullWidth>
                    <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Department</InputLabel>
                    <Select
                      value={classForm.department}
                      onChange={(e) => setClassForm({...classForm, department: e.target.value})}
                      label="Department"
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                      }}
                    >
                      <MenuItem value="IT">Information Technology</MenuItem>
                      <MenuItem value="Computer">Computer Engineering</MenuItem>
                      <MenuItem value="Mechanical">Mechanical Engineering</MenuItem>
                      <MenuItem value="Civil">Civil Engineering</MenuItem>
                      <MenuItem value="Electrical">Electrical Engineering</MenuItem>
                      <MenuItem value="Electronics and Telecommunication">Electronics & Telecommunication</MenuItem>
                      <MenuItem value="Artificial Intelligence & Data Science">AI & Data Science</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Academic Year</InputLabel>
                    <Select
                      value={classForm.class}
                      onChange={(e) => setClassForm({...classForm, class: e.target.value})}
                      label="Academic Year"
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                      }}
                    >
                      <MenuItem value="FE">First Year (FE)</MenuItem>
                      <MenuItem value="SE">Second Year (SE)</MenuItem>
                      <MenuItem value="TE">Third Year (TE)</MenuItem>
                      <MenuItem value="BE">Final Year (BE)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Division</InputLabel>
                    <Select
                      value={classForm.division}
                      onChange={(e) => setClassForm({...classForm, division: e.target.value})}
                      label="Division"
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                      }}
                    >
                      <MenuItem value="A">Division A</MenuItem>
                      <MenuItem value="B">Division B</MenuItem>
                      <MenuItem value="C">Division C</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Session Type</InputLabel>
                    <Select
                      value={classForm.type}
                      onChange={(e) => setClassForm({...classForm, type: e.target.value})}
                      label="Session Type"
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                      }}
                    >
                      <MenuItem value="lecture">📚 Lecture</MenuItem>
                      <MenuItem value="practical">🔬 Practical</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2 }}>
              <Button 
                onClick={() => setOpenAddDialog(false)}
                sx={{ 
                  borderColor: '#ffe588', 
                  color: '#f57c00',
                  '&:hover': { bgcolor: '#fff8e1' }
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddClass} 
                variant="contained"
                disabled={loading || !isFormValid}
                sx={{ 
                  bgcolor: '#60b5ff', 
                  '&:hover': { bgcolor: '#4a9eff' },
                  '&:disabled': { bgcolor: '#ccc' }
                }}
                startIcon={loading ? null : <School />}
              >
                {loading ? 'Adding Class...' : 'Add Class'}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    );
  };

  const ManageStudents = () => {
    const [searchId, setSearchId] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentAttendance, setStudentAttendance] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allStudents, setAllStudents] = useState([]);
    const [searchMode, setSearchMode] = useState('id'); // 'id' or 'browse'
    const [filterDepartment, setFilterDepartment] = useState('all');
    const [filterYear, setFilterYear] = useState('all');
    const [searchName, setSearchName] = useState('');

    useEffect(() => {
      if (searchMode === 'browse') {
        fetchAllStudents();
      }
    }, [searchMode]);

    const fetchAllStudents = async () => {
      try {
        const response = await apiClient.get('/api/users/students');
        setAllStudents(response.data || []);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    const searchStudent = async () => {
      if (!searchId.trim()) return;
      setLoading(true);
      try {
        const response = await apiClient.get(`/api/users/student/${searchId}`);
        setSelectedStudent(response.data);
        
        // Fetch student attendance
        const attendanceResponse = await apiClient.get(`/api/attendance/student/${response.data._id}`);
        setStudentAttendance(attendanceResponse.data);
      } catch (error) {
        console.error('Search student error:', error);
        toast.error(error.response?.data?.message || 'Student not found');
        setSelectedStudent(null);
        setStudentAttendance([]);
      } finally {
        setLoading(false);
      }
    };

    const selectStudent = async (student) => {
      setLoading(true);
      try {
        setSelectedStudent(student);
        const attendanceResponse = await apiClient.get(`/api/attendance/student/${student._id}`);
        setStudentAttendance(attendanceResponse.data);
      } catch (error) {
        toast.error('Failed to fetch student attendance');
      } finally {
        setLoading(false);
      }
    };

    const calculateAttendanceStats = () => {
      const total = studentAttendance.length;
      const present = studentAttendance.filter(a => a.status === 'present').length;
      const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
      return { total, present, percentage };
    };

    const filteredStudents = allStudents.filter(student => {
      const matchesName = student.name?.toLowerCase().includes(searchName.toLowerCase()) ||
                         student.studentId?.toLowerCase().includes(searchName.toLowerCase());
      const matchesDept = filterDepartment === 'all' || student.department === filterDepartment;
      const matchesYear = filterYear === 'all' || student.academicYear === filterYear;
      return matchesName && matchesDept && matchesYear;
    });

    const stats = selectedStudent ? calculateAttendanceStats() : null;

    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 1 }}>
              👥 Manage Students
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Search and manage student profiles and attendance records
            </Typography>
          </Box>

          {/* Search Mode Toggle */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', bgcolor: '#f0f8ff', borderRadius: 2, p: 0.5 }}>
                <Button
                  variant={searchMode === 'id' ? 'contained' : 'text'}
                  onClick={() => setSearchMode('id')}
                  sx={{ 
                    bgcolor: searchMode === 'id' ? '#60b5ff' : 'transparent',
                    color: searchMode === 'id' ? 'white' : '#60b5ff',
                    '&:hover': { bgcolor: searchMode === 'id' ? '#4a9eff' : 'rgba(96, 181, 255, 0.1)' }
                  }}
                >
                  🔍 Search by ID
                </Button>
                <Button
                  variant={searchMode === 'browse' ? 'contained' : 'text'}
                  onClick={() => setSearchMode('browse')}
                  sx={{ 
                    bgcolor: searchMode === 'browse' ? '#60b5ff' : 'transparent',
                    color: searchMode === 'browse' ? 'white' : '#60b5ff',
                    '&:hover': { bgcolor: searchMode === 'browse' ? '#4a9eff' : 'rgba(96, 181, 255, 0.1)' }
                  }}
                >
                  📋 Browse All
                </Button>
              </Box>
            </Box>

            {searchMode === 'id' ? (
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Enter Student Enrollment Number"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchStudent()}
                    placeholder="e.g., 2021001, ST001"
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
                  <Button 
                    variant="contained" 
                    onClick={searchStudent} 
                    disabled={loading || !searchId.trim()}
                    fullWidth
                    size="large"
                    sx={{ 
                      bgcolor: '#60b5ff', 
                      py: 1.5,
                      '&:hover': { bgcolor: '#4a9eff' },
                      '&:disabled': { bgcolor: '#ccc' }
                    }}
                    startIcon={loading ? null : <Person />}
                  >
                    {loading ? 'Searching...' : 'Search Student'}
                  </Button>
                </Grid>
              </Grid>
            ) : (
              <>
                <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 2 }}>
                  🔍 Filter Students
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Search by Name/ID"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
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
                      <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Department</InputLabel>
                      <Select
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                        label="Department"
                        sx={{
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                        }}
                      >
                        <MenuItem value="all">All Departments</MenuItem>
                        <MenuItem value="IT">IT</MenuItem>
                        <MenuItem value="Computer">Computer</MenuItem>
                        <MenuItem value="Mechanical">Mechanical</MenuItem>
                        <MenuItem value="Civil">Civil</MenuItem>
                        <MenuItem value="Electrical">Electrical</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Academic Year</InputLabel>
                      <Select
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                        label="Academic Year"
                        sx={{
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                        }}
                      >
                        <MenuItem value="all">All Years</MenuItem>
                        <MenuItem value="First">First Year</MenuItem>
                        <MenuItem value="Second">Second Year</MenuItem>
                        <MenuItem value="Third">Third Year</MenuItem>
                        <MenuItem value="Fourth">Fourth Year</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Students Grid */}
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  <Grid container spacing={2}>
                    {filteredStudents.map((student) => (
                      <Grid item xs={12} sm={6} md={4} key={student._id}>
                        <Card 
                          sx={{ 
                            p: 2, 
                            cursor: 'pointer',
                            borderRadius: 2,
                            '&:hover': { 
                              transform: 'translateY(-2px)', 
                              boxShadow: '0 8px 25px rgba(96, 181, 255, 0.3)',
                              transition: 'all 0.3s ease'
                            },
                            border: selectedStudent?._id === student._id ? '2px solid #60b5ff' : '1px solid #e0e0e0'
                          }}
                          onClick={() => selectStudent(student)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#60b5ff', width: 40, height: 40 }}>
                              {student.name?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {student.name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {student.studentId} • {student.department}
                              </Typography>
                            </Box>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  {filteredStudents.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        No students found matching your criteria
                      </Typography>
                    </Box>
                  )}
                </Box>
              </>
            )}
          </Paper>

          {selectedStudent && (
            <>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Student Profile Card */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
                    <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 3 }}>
                      👤 Student Profile
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ width: 80, height: 80, fontSize: 32, bgcolor: '#60b5ff', mr: 3 }}>
                        {selectedStudent.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#60b5ff' }}>
                          {selectedStudent.name}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          {selectedStudent.studentId} • {selectedStudent.department}
                        </Typography>
                        <Chip 
                          label={selectedStudent.isActive ? 'Active' : 'Inactive'} 
                          color={selectedStudent.isActive ? 'success' : 'default'} 
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box sx={{ bgcolor: '#f9f9f9', borderRadius: 2, p: 2, mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">Email Address</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedStudent.email}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ bgcolor: '#f9f9f9', borderRadius: 2, p: 2 }}>
                          <Typography variant="body2" color="textSecondary">Academic Year</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedStudent.academicYear || 'N/A'}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ bgcolor: '#f9f9f9', borderRadius: 2, p: 2 }}>
                          <Typography variant="body2" color="textSecondary">Semester</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedStudent.semester || 'N/A'}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ bgcolor: '#f9f9f9', borderRadius: 2, p: 2 }}>
                          <Typography variant="body2" color="textSecondary">Joined Date</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {new Date(selectedStudent.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Attendance Stats */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
                    <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 3 }}>
                      📊 Attendance Summary
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f0f8ff', borderRadius: 2 }}>
                          <Typography variant="h3" sx={{ color: '#60b5ff', fontWeight: 'bold' }}>
                            {stats.total}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">Total Classes</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f1f8e9', borderRadius: 2 }}>
                          <Typography variant="h3" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                            {stats.present}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">Present</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: stats.percentage >= 75 ? '#f1f8e9' : '#ffebee', borderRadius: 2 }}>
                          <Typography 
                            variant="h3" 
                            sx={{ 
                              color: stats.percentage >= 75 ? '#4caf50' : '#f44336',
                              fontWeight: 'bold'
                            }}
                          >
                            {stats.percentage}%
                          </Typography>
                          <Typography variant="body2" color="textSecondary">Attendance</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    {stats.percentage < 75 && (
                      <Alert severity="warning" sx={{ mt: 3, borderRadius: 2 }}>
                        ⚠️ Student is a defaulter (below 75% attendance)
                      </Alert>
                    )}
                    
                    {stats.percentage >= 75 && (
                      <Alert severity="success" sx={{ mt: 3, borderRadius: 2 }}>
                        ✅ Student has good attendance (above 75%)
                      </Alert>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              {/* Attendance History */}
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
                <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 3 }}>
                  📅 Recent Attendance History
                </Typography>
                {studentAttendance.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead sx={{ bgcolor: '#f0f8ff' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Subject</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Time</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Verification</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {studentAttendance.slice(0, 10).map((record, index) => (
                          <TableRow 
                            key={record._id}
                            sx={{ 
                              '&:hover': { bgcolor: '#f8fafc' },
                              bgcolor: index % 2 === 0 ? '#ffffff' : '#fafbfc'
                            }}
                          >
                            <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{record.subject}</TableCell>
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
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                      📋 No Attendance Records
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      This student has no attendance records yet
                    </Typography>
                  </Box>
                )}
              </Paper>
            </>
          )}

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button 
              variant="outlined"
              onClick={() => navigate('/teacher')}
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

  const AttendanceHistory = () => {
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [timeSlot, setTimeSlot] = useState('');
    const [teacherClasses, setTeacherClasses] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
      fetchTeacherClasses();
    }, []);

    const fetchTeacherClasses = async () => {
      try {
        const response = await apiClient.get('/api/classes/teacher');
        setTeacherClasses(response.data || []);
      } catch (error) {
        console.error('Error fetching teacher classes:', error);
      }
    };

    const handleFetchAttendance = async () => {
      if (!selectedClass) return;
      
      setLoading(true);
      try {
        const classData = JSON.parse(selectedClass);
        const params = new URLSearchParams();
        params.append('subject', classData.subject);
        if (selectedDate) params.append('date', selectedDate);
        if (timeSlot) params.append('timeSlot', timeSlot);
        
        const response = await apiClient.get(`/api/attendance/class?${params}`);
        setAttendanceData(response.data);
        setPage(0);
      } catch (error) {
        console.error('Error fetching attendance:', error);
        toast.error('Failed to fetch attendance data');
      } finally {
        setLoading(false);
      }
    };

    const filteredData = attendanceData.filter(record => {
      if (statusFilter !== 'all' && record.status !== statusFilter) return false;
      return true;
    });

    const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const exportToCSV = () => {
      const headers = ['Student Name', 'Student ID', 'Status', 'Date', 'Time', 'Verification'];
      const csvData = filteredData.map(record => [
        record.student?.name || '',
        record.student?.studentId || '',
        record.status || 'present',
        new Date(record.date).toLocaleDateString(),
        new Date(record.markedAt || record.date).toLocaleTimeString(),
        record.faceVerified ? 'Face + QR' : 'QR Only'
      ]);
      
      const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${JSON.parse(selectedClass).subject}_${selectedDate}_${timeSlot || 'all'}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    };

    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>Attendance History</Typography>
        
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Select Class</InputLabel>
                <Select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  label="Select Class"
                >
                  {teacherClasses.map((cls) => (
                    <MenuItem key={cls._id} value={JSON.stringify(cls)}>
                      {cls.subject} - {cls.class} {cls.division}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Time Slot</InputLabel>
                <Select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  label="Time Slot"
                >
                  <MenuItem value="">All Times</MenuItem>
                  <MenuItem value="9:00-10:00">9:00 AM - 10:00 AM</MenuItem>
                  <MenuItem value="10:00-11:00">10:00 AM - 11:00 AM</MenuItem>
                  <MenuItem value="11:00-12:00">11:00 AM - 12:00 PM</MenuItem>
                  <MenuItem value="12:00-13:00">12:00 PM - 1:00 PM</MenuItem>
                  <MenuItem value="14:00-15:00">2:00 PM - 3:00 PM</MenuItem>
                  <MenuItem value="15:00-16:00">3:00 PM - 4:00 PM</MenuItem>
                  <MenuItem value="16:00-17:00">4:00 PM - 5:00 PM</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="contained" 
                  onClick={handleFetchAttendance} 
                  disabled={!selectedClass || loading}
                  size="small"
                >
                  {loading ? 'Loading...' : 'Fetch'}
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={exportToCSV}
                  disabled={filteredData.length === 0}
                  size="small"
                >
                  Export
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {filteredData.length > 0 && (
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {JSON.parse(selectedClass || '{}').subject} - {new Date(selectedDate).toLocaleDateString()} {timeSlot && `(${timeSlot})`}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip label={`Total: ${filteredData.length}`} color="primary" size="small" />
                <Chip label={`Present: ${filteredData.filter(r => r.status === 'present').length}`} color="success" size="small" />
                <Chip label={`Absent: ${filteredData.filter(r => r.status === 'absent').length}`} color="error" size="small" />
              </Box>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Student ID</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Verification</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell>{record.student?.name}</TableCell>
                      <TableCell>{record.student?.studentId}</TableCell>
                      <TableCell>
                        <Chip 
                          label={record.status?.toUpperCase() || 'PRESENT'} 
                          color={record.status === 'present' ? 'success' : 'error'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(record.markedAt || record.date).toLocaleTimeString()}</TableCell>
                      <TableCell>{record.faceVerified ? '✅ Face + QR' : '📱 QR Only'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Showing {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredData.length)} of {filteredData.length}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button 
                  size="small" 
                  onClick={() => setPage(Math.max(0, page - 1))} 
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Typography variant="body2">{page + 1}</Typography>
                <Button 
                  size="small" 
                  onClick={() => setPage(page + 1)} 
                  disabled={(page + 1) * rowsPerPage >= filteredData.length}
                >
                  Next
                </Button>
              </Box>
            </Box>
          </Paper>
        )}

        {selectedClass && attendanceData.length === 0 && !loading && (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No attendance records found for the selected class and date.
            </Typography>
          </Paper>
        )}
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/teacher')}>Back</Button>
        </Box>
      </Container>
    );
  };

  const AttendanceAnalysis = () => {
    const [analysisData, setAnalysisData] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [viewType, setViewType] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [teacherClasses, setTeacherClasses] = useState([]);
    const [stats, setStats] = useState({
      totalStudents: 0,
      averageAttendance: 0,
      totalClasses: 0,
      presentCount: 0
    });

    useEffect(() => {
      fetchTeacherClasses();
      if (selectedClass) {
        fetchAnalysisData();
      }
    }, [selectedClass, dateRange]);

    const fetchTeacherClasses = async () => {
      try {
        const response = await apiClient.get('/api/classes/teacher');
        setTeacherClasses(response.data || []);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    const fetchAnalysisData = async () => {
      if (!selectedClass) return;
      setLoading(true);
      try {
        const classData = JSON.parse(selectedClass);
        const params = new URLSearchParams();
        params.append('subject', classData.subject);
        if (dateRange.start) params.append('startDate', dateRange.start);
        if (dateRange.end) params.append('endDate', dateRange.end);
        
        const response = await apiClient.get(`/api/attendance/class?${params}`);
        setAnalysisData(response.data || []);
        calculateStats(response.data || []);
      } catch (error) {
        console.error('Error fetching analysis:', error);
        toast.error('Failed to fetch attendance data');
      } finally {
        setLoading(false);
      }
    };

    const calculateStats = (data) => {
      const totalClasses = data.length;
      const presentCount = data.filter(record => record.status === 'present').length;
      const averageAttendance = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(1) : 0;
      const uniqueStudents = new Set(data.map(record => record.student?._id)).size;
      
      setStats({
        totalStudents: uniqueStudents,
        averageAttendance,
        totalClasses,
        presentCount
      });
    };

    const getChartData = () => {
      if (viewType === 'daily') {
        const dailyMap = {};
        analysisData.forEach(record => {
          const date = new Date(record.date).toLocaleDateString();
          if (!dailyMap[date]) dailyMap[date] = { date, present: 0, total: 0 };
          dailyMap[date].total++;
          if (record.status === 'present') dailyMap[date].present++;
        });
        return Object.values(dailyMap).map(day => ({
          ...day,
          percentage: day.total > 0 ? ((day.present / day.total) * 100).toFixed(1) : 0
        }));
      }
      
      if (viewType === 'students') {
        const studentMap = {};
        analysisData.forEach(record => {
          const studentId = record.student?._id;
          const studentName = record.student?.name || 'Unknown';
          if (!studentMap[studentId]) {
            studentMap[studentId] = { name: studentName, present: 0, total: 0 };
          }
          studentMap[studentId].total++;
          if (record.status === 'present') studentMap[studentId].present++;
        });
        return Object.values(studentMap).map(student => ({
          ...student,
          percentage: student.total > 0 ? ((student.present / student.total) * 100).toFixed(1) : 0
        })).sort((a, b) => b.percentage - a.percentage);
      }
      
      return [
        { name: 'Present', value: stats.presentCount, fill: '#4caf50' },
        { name: 'Absent', value: stats.totalClasses - stats.presentCount, fill: '#f44336' }
      ];
    };

    const chartData = getChartData();

    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 1 }}>
              📊 Attendance Analysis
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Comprehensive insights into class attendance patterns
            </Typography>
          </Box>

          {/* Filters */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
            <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 3 }}>
              🔍 Analysis Filters
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Select Class</InputLabel>
                  <Select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    label="Select Class"
                    sx={{
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                    }}
                  >
                    {teacherClasses.map((cls) => (
                      <MenuItem key={cls._id} value={JSON.stringify(cls)}>
                        {cls.subject} - {cls.class} {cls.division}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>View Type</InputLabel>
                  <Select
                    value={viewType}
                    onChange={(e) => setViewType(e.target.value)}
                    label="View Type"
                    sx={{
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                    }}
                  >
                    <MenuItem value="overview">📈 Overview</MenuItem>
                    <MenuItem value="daily">📅 Daily Trends</MenuItem>
                    <MenuItem value="students">👥 Student Performance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
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
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
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

          {selectedClass && (
            <>
              {/* Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #60b5ff 0%, #4a9eff 100%)', color: 'white', borderRadius: 3, height: 120 }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>{stats.totalStudents}</Typography>
                      <Typography variant="body2">Total Students</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)', color: 'white', borderRadius: 3, height: 120 }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>{stats.averageAttendance}%</Typography>
                      <Typography variant="body2">Average Attendance</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', color: 'white', borderRadius: 3, height: 120 }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>{stats.totalClasses}</Typography>
                      <Typography variant="body2">Total Classes</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)', color: 'white', borderRadius: 3, height: 120 }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>{stats.presentCount}</Typography>
                      <Typography variant="body2">Present Count</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Charts */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {viewType === 'overview' && (
                  <>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, borderRadius: 3, height: 400, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
                        <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 2 }}>
                          📈 Attendance Distribution
                        </Typography>
                        {chartData.length > 0 && (
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                label={({name, value}) => `${name}: ${value}`}
                              >
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, borderRadius: 3, height: 400, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
                        <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 2 }}>
                          📊 Performance Metrics
                        </Typography>
                        <Box sx={{ mt: 4 }}>
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" color="textSecondary">Attendance Rate</Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={stats.averageAttendance} 
                              sx={{ 
                                height: 12, 
                                borderRadius: 6,
                                bgcolor: '#e0e0e0',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: stats.averageAttendance >= 75 ? '#4caf50' : '#f44336',
                                  borderRadius: 6
                                }
                              }}
                            />
                            <Typography variant="h4" sx={{ mt: 1, color: stats.averageAttendance >= 75 ? '#4caf50' : '#f44336' }}>
                              {stats.averageAttendance}%
                            </Typography>
                          </Box>
                          
                          {stats.averageAttendance >= 75 ? (
                            <Alert severity="success" sx={{ borderRadius: 2 }}>
                              ✅ Excellent class performance! Above 75% attendance.
                            </Alert>
                          ) : (
                            <Alert severity="warning" sx={{ borderRadius: 2 }}>
                              ⚠️ Class needs attention. Below 75% attendance rate.
                            </Alert>
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                  </>
                )}

                {viewType === 'daily' && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
                      <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 2 }}>
                        📅 Daily Attendance Trends
                      </Typography>
                      {chartData.length > 0 && (
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={chartData}>
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 100]} />
                            <Bar dataKey="percentage" fill="#60b5ff" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </Paper>
                  </Grid>
                )}

                {viewType === 'students' && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
                      <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 3 }}>
                        👥 Student Performance Ranking
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead sx={{ bgcolor: '#f0f8ff' }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Rank</TableCell>
                              <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Student Name</TableCell>
                              <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Present</TableCell>
                              <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Total</TableCell>
                              <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Percentage</TableCell>
                              <TableCell sx={{ fontWeight: 'bold', color: '#60b5ff' }}>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {chartData.slice(0, 20).map((student, index) => (
                              <TableRow 
                                key={index}
                                sx={{ 
                                  '&:hover': { bgcolor: '#f8fafc' },
                                  bgcolor: index % 2 === 0 ? '#ffffff' : '#fafbfc'
                                }}
                              >
                                <TableCell sx={{ fontWeight: 'bold' }}>#{index + 1}</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{student.name}</TableCell>
                                <TableCell>{student.present}</TableCell>
                                <TableCell>{student.total}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={`${student.percentage}%`}
                                    color={student.percentage >= 75 ? 'success' : 'error'}
                                    size="small"
                                    sx={{ fontWeight: 'bold' }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={student.percentage >= 75 ? 'GOOD' : 'AT RISK'}
                                    color={student.percentage >= 75 ? 'success' : 'error'}
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </>
          )}

          {!selectedClass && (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                📈 Select a Class to Begin Analysis
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Choose a class from the dropdown above to view detailed attendance analytics
              </Typography>
            </Paper>
          )}

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button 
              variant="outlined"
              onClick={() => navigate('/teacher')}
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

  const SearchStudent = () => (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Search Student</Typography>
      <Paper sx={{ p: 2 }}>
        <TextField
          fullWidth
          label="Search by name or student ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Student ID</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.studentId}</TableCell>
                  <TableCell>{student.department}</TableCell>
                  <TableCell>{student.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/teacher')}>Back</Button>
        </Box>
      </Paper>
    </Container>
  );

  const TimetableView = () => <Timetable userRole="teacher" />;

  const SendNotificationView = () => {
    const [notificationForm, setNotificationForm] = useState({
      title: '',
      message: '',
      type: 'info',
      targetType: 'all',
      department: user?.department || '',
      academicYear: '',
      division: ''
    });
    const [loading, setLoading] = useState(false);
    const [sentNotifications, setSentNotifications] = useState([]);

    useEffect(() => {
      fetchSentNotifications();
    }, []);

    const fetchSentNotifications = async () => {
      try {
        const response = await apiClient.get('/api/notifications/sent');
        setSentNotifications(response.data || []);
      } catch (error) {
        console.error('Error fetching sent notifications:', error);
      }
    };

    const handleSendNotification = async () => {
      if (!notificationForm.title.trim() || !notificationForm.message.trim()) {
        toast.error('Please fill in all required fields');
        return;
      }

      setLoading(true);
      try {
        await apiClient.post('/api/notifications/send', notificationForm);
        toast.success('Notification sent successfully!');
        setNotificationForm({
          title: '',
          message: '',
          type: 'info',
          targetType: 'all',
          department: user?.department || '',
          academicYear: '',
          division: ''
        });
        fetchSentNotifications();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to send notification');
      } finally {
        setLoading(false);
      }
    };

    const getTargetDescription = (notification) => {
      if (notification.targetType === 'all') return 'All Students';
      if (notification.targetType === 'department') return `${notification.department} Department`;
      if (notification.targetType === 'year') return `${notification.academicYear} Year`;
      if (notification.targetType === 'division') return `${notification.academicYear} ${notification.division}`;
      return 'Unknown';
    };

    const isFormValid = notificationForm.title.trim() && notificationForm.message.trim();

    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 1 }}>
              📢 Send Notification
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Communicate important updates to your students
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Send Notification Form */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
                <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 3 }}>
                  ✍️ Compose Notification
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notification Title"
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                      placeholder="e.g., Class Cancelled, Assignment Reminder"
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
                      label="Message"
                      multiline
                      rows={4}
                      value={notificationForm.message}
                      onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                      placeholder="Type your message here..."
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
                    <FormControl fullWidth>
                      <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Priority</InputLabel>
                      <Select
                        value={notificationForm.type}
                        onChange={(e) => setNotificationForm({...notificationForm, type: e.target.value})}
                        label="Priority"
                        sx={{
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                        }}
                      >
                        <MenuItem value="info">📘 Info</MenuItem>
                        <MenuItem value="warning">⚠️ Warning</MenuItem>
                        <MenuItem value="success">✅ Success</MenuItem>
                        <MenuItem value="error">🚨 Urgent</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Send To</InputLabel>
                      <Select
                        value={notificationForm.targetType}
                        onChange={(e) => setNotificationForm({...notificationForm, targetType: e.target.value})}
                        label="Send To"
                        sx={{
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                        }}
                      >
                        <MenuItem value="all">🌐 All Students</MenuItem>
                        <MenuItem value="department">🏫 My Department</MenuItem>
                        <MenuItem value="year">🎓 Specific Year</MenuItem>
                        <MenuItem value="division">📚 Specific Division</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {notificationForm.targetType === 'department' && (
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Department</InputLabel>
                        <Select
                          value={notificationForm.department}
                          onChange={(e) => setNotificationForm({...notificationForm, department: e.target.value})}
                          label="Department"
                          sx={{
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                          }}
                        >
                          <MenuItem value="IT">Information Technology</MenuItem>
                          <MenuItem value="Computer">Computer Engineering</MenuItem>
                          <MenuItem value="Mechanical">Mechanical Engineering</MenuItem>
                          <MenuItem value="Civil">Civil Engineering</MenuItem>
                          <MenuItem value="Electrical">Electrical Engineering</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  
                  {(notificationForm.targetType === 'year' || notificationForm.targetType === 'division') && (
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Academic Year</InputLabel>
                        <Select
                          value={notificationForm.academicYear}
                          onChange={(e) => setNotificationForm({...notificationForm, academicYear: e.target.value})}
                          label="Academic Year"
                          sx={{
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                          }}
                        >
                          <MenuItem value="First">First Year</MenuItem>
                          <MenuItem value="Second">Second Year</MenuItem>
                          <MenuItem value="Third">Third Year</MenuItem>
                          <MenuItem value="Fourth">Fourth Year</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  
                  {notificationForm.targetType === 'division' && (
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Division</InputLabel>
                        <Select
                          value={notificationForm.division}
                          onChange={(e) => setNotificationForm({...notificationForm, division: e.target.value})}
                          label="Division"
                          sx={{
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                          }}
                        >
                          <MenuItem value="A">Division A</MenuItem>
                          <MenuItem value="B">Division B</MenuItem>
                          <MenuItem value="C">Division C</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </Grid>

                <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button 
                    variant="contained" 
                    onClick={handleSendNotification}
                    disabled={loading || !isFormValid}
                    size="large"
                    sx={{ 
                      bgcolor: '#60b5ff', 
                      px: 4,
                      py: 1.5,
                      '&:hover': { bgcolor: '#4a9eff' },
                      '&:disabled': { bgcolor: '#ccc' }
                    }}
                    startIcon={loading ? null : <Notifications />}
                  >
                    {loading ? 'Sending...' : 'Send Notification'}
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate('/teacher')}
                    size="large"
                    sx={{ 
                      borderColor: '#ffe588', 
                      color: '#f57c00',
                      px: 4,
                      py: 1.5,
                      '&:hover': { bgcolor: '#fff8e1' }
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Preview & Stats */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)', mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 2 }}>
                  📱 Preview
                </Typography>
                <Box sx={{ bgcolor: '#f0f8ff', borderRadius: 2, p: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {notificationForm.title || 'Notification Title'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {notificationForm.message || 'Your message will appear here...'}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      label={notificationForm.type.toUpperCase()}
                      color={notificationForm.type === 'error' ? 'error' : notificationForm.type === 'warning' ? 'warning' : notificationForm.type === 'success' ? 'success' : 'primary'}
                      size="small"
                    />
                    <Typography variant="caption" color="textSecondary">
                      {getTargetDescription(notificationForm)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
                <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 2 }}>
                  📊 Notification Stats
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ color: '#60b5ff', fontWeight: 'bold' }}>
                    {sentNotifications.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Sent
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Recent Notifications */}
          {sentNotifications.length > 0 && (
            <Paper sx={{ p: 3, mt: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
              <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 3 }}>
                📋 Recent Notifications
              </Typography>
              <Grid container spacing={2}>
                {sentNotifications.slice(0, 6).map((notification, index) => (
                  <Grid item xs={12} sm={6} md={4} key={notification._id}>
                    <Card sx={{ 
                      borderRadius: 2, 
                      border: '1px solid #e0e7ff',
                      '&:hover': { boxShadow: '0 4px 12px rgba(96, 181, 255, 0.2)' }
                    }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            {notification.title}
                          </Typography>
                          <Chip 
                            label={notification.type}
                            color={notification.type === 'error' ? 'error' : notification.type === 'warning' ? 'warning' : notification.type === 'success' ? 'success' : 'primary'}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
                          {notification.message.length > 60 ? `${notification.message.substring(0, 60)}...` : notification.message}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {getTargetDescription(notification)} • {new Date(notification.createdAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
        </Container>
      </Box>
    );
  };

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/update-profile" element={<UpdateProfile />} />
      <Route path="/generate-qr" element={<GenerateQR />} />
      <Route path="/classes" element={<ManageClasses />} />
      <Route path="/students" element={<ManageStudents />} />
      <Route path="/attendance" element={<AttendanceHistory />} />
      <Route path="/analysis" element={<AttendanceAnalysis />} />
      <Route path="/search" element={<SearchStudent />} />
      <Route path="/timetable" element={<TimetableView />} />
      <Route path="/send-notification" element={<SendNotificationView />} />
    </Routes>
  );
};

export default TeacherDashboard;