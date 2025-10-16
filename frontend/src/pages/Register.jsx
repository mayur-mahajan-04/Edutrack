import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  IconButton,
  Card,
  CardContent
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  Phone,
  School,
  Visibility,
  VisibilityOff,
  Face,
  CheckCircle
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FaceCapture from '../components/FaceCapture';

const steps = ['Basic Info', 'Face Registration', 'Complete'];

export default function Register() {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: 'student',
    firstName: '',
    lastName: '',
    enrollmentNumber: '',
    gender: '',
    dob: '',
    phone: '',
    email: '',
    department: '',
    studyYear: '',
    password: '',
    confirmPassword: '',
    faceDescriptor: null,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateStep1 = () => {
    const {
      firstName,
      lastName,
      enrollmentNumber,
      gender,
      dob,
      phone,
      email,
      department,
      studyYear,
      password,
      confirmPassword,
    } = formData;

    if (!firstName.trim() || !lastName.trim()) return 'First and last name are required';
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
    if (password !== confirmPassword) return 'Passwords do not match';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (!gender) return 'Gender is required';
    if (!dob) return 'Date of birth is required';
    if (!/^[0-9]{10}$/.test(phone)) return 'Phone number must be 10 digits';
    if (!department) return 'Department is required';
    if (formData.role === 'student' && (!enrollmentNumber || !studyYear))
      return 'Enrollment number and study year are required for students';
    return '';
  };

  const handleNext = () => {
    if (activeStep === 0) {
      const validationError = validateStep1();
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFaceCapture = (faceDescriptor) => {
    const toArray = (v) => (Array.isArray(v) ? v : [v]);
    const descs = toArray(faceDescriptor);
    const validDescs = descs.filter((d) => Array.isArray(d) && d.length === 128);

    let flattened = null;
    if (validDescs.length === 1) flattened = validDescs[0];
    else if (validDescs.length > 1) {
      const sums = Array(128).fill(0);
      for (const d of validDescs) for (let i = 0; i < 128; i++) sums[i] += d[i];
      flattened = sums.map((s) => s / validDescs.length);
    }

    setFormData({
      ...formData,
      faceDescriptor: flattened,
    });
    handleNext();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
      const submitData = {
        name: fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        faceDescriptor: formData.faceDescriptor,
      };

      if (formData.role === 'student') {
        submitData.studentId = formData.enrollmentNumber;
        const yearToSemester = {
          first: 1,
          second: 2,
          third: 3,
          fourth: 4,
        };
        const sem = yearToSemester[formData.studyYear] || undefined;
        if (sem) submitData.semester = sem;
      }

      if (formData.department) {
        submitData.department = formData.department;
      }

      const result = await register(submitData);
      if (result.success) navigate('/login');
      else setError(result.error || 'Registration failed');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select name="role" value={formData.role} onChange={handleChange} label="Role">
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="teacher">Teacher</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                required
                fullWidth
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#60b5ff' },
                    '&.Mui-focused fieldset': { borderColor: '#60b5ff' }
                  }
                }}
              />
              <TextField
                required
                fullWidth
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#60b5ff' },
                    '&.Mui-focused fieldset': { borderColor: '#60b5ff' }
                  }
                }}
              />
            </Box>

            {formData.role === 'student' && (
              <TextField
                fullWidth
                required
                margin="normal"
                name="enrollmentNumber"
                label="Enrollment Number"
                value={formData.enrollmentNumber}
                onChange={(e) =>
                  setFormData({ ...formData, enrollmentNumber: e.target.value.toUpperCase() })
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#60b5ff' },
                    '&.Mui-focused fieldset': { borderColor: '#60b5ff' }
                  }
                }}
              />
            )}

            <TextField
              fullWidth
              required
              margin="normal"
              type="email"
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#60b5ff' },
                  '&.Mui-focused fieldset': { borderColor: '#60b5ff' }
                }
              }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Gender</InputLabel>
                <Select name="gender" value={formData.gender} onChange={handleChange} label="Gender">
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                required
                type="date"
                name="dob"
                label="Date of Birth"
                InputLabelProps={{ shrink: true }}
                value={formData.dob}
                onChange={handleChange}
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#60b5ff' },
                    '&.Mui-focused fieldset': { borderColor: '#60b5ff' }
                  }
                }}
              />
            </Box>

            <TextField
              fullWidth
              required
              type="tel"
              name="phone"
              label="Phone Number"
              placeholder="10-digit number"
              value={formData.phone}
              onChange={handleChange}
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#60b5ff' },
                  '&.Mui-focused fieldset': { borderColor: '#60b5ff' }
                }
              }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Department</InputLabel>
              <Select name="department" value={formData.department} onChange={handleChange} label="Department">
                <MenuItem value="">Select Department</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="Computer">Computer</MenuItem>
                <MenuItem value="Mechanical">Mechanical</MenuItem>
                <MenuItem value="Civil">Civil</MenuItem>
                <MenuItem value="Electrical">Electrical</MenuItem>
                <MenuItem value="Electronics and Telecommunication">Electronics and Telecommunication</MenuItem>
                <MenuItem value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</MenuItem>
              </Select>
            </FormControl>

            {formData.role === 'student' && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Study Year</InputLabel>
                <Select name="studyYear" value={formData.studyYear} onChange={handleChange} label="Study Year">
                  <MenuItem value="">Select Year</MenuItem>
                  <MenuItem value="first">First Year</MenuItem>
                  <MenuItem value="second">Second Year</MenuItem>
                  <MenuItem value="third">Third Year</MenuItem>
                  <MenuItem value="fourth">Fourth Year</MenuItem>
                </Select>
              </FormControl>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                required
                type={showPassword ? 'text' : 'password'}
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#60b5ff' },
                    '&.Mui-focused fieldset': { borderColor: '#60b5ff' }
                  }
                }}
              />
              <TextField
                fullWidth
                required
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#60b5ff' },
                    '&.Mui-focused fieldset': { borderColor: '#60b5ff' }
                  }
                }}
              />
            </Box>
          </Box>
        );

      case 1:
        return (
          <FaceCapture
            onCapture={handleFaceCapture}
            onError={() => setError('Face capture failed. Please try again.')}
          />
        );

      case 2:
        return (
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom>
              Registration Complete!
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Review your details before submitting:
            </Typography>
            <Box sx={{ textAlign: 'left', mt: 2, mb: 2 }}>
              <Typography variant="body2">Name: {formData.firstName} {formData.lastName}</Typography>
              <Typography variant="body2">Email: {formData.email}</Typography>
              <Typography variant="body2">Role: {formData.role}</Typography>
              {formData.role === 'student' && (
                <>
                  <Typography variant="body2">Enrollment No: {formData.enrollmentNumber}</Typography>
                  <Typography variant="body2">Study Year: {formData.studyYear}</Typography>
                </>
              )}
              <Typography variant="body2">Department: {formData.department}</Typography>
              <Typography variant="body2">Gender: {formData.gender}</Typography>
              <Typography variant="body2">Phone: {formData.phone}</Typography>
            </Box>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{ 
                mt: 2,
                background: '#60b5ff',
                '&:hover': { background: '#4a9eff' }
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #60b5ff 0%, #4a9eff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2
      }}
    >
      <Container component="main" maxWidth="md">
        <Paper 
          elevation={8}
          sx={{ 
            padding: { xs: 3, sm: 4 },
            borderRadius: 3,
            background: 'white',
            boxShadow: '0 8px 32px rgba(96, 181, 255, 0.2)'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#60b5ff',
                mb: 2,
                boxShadow: '0 4px 16px rgba(96, 181, 255, 0.3)'
              }}
            >
              <School sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 600,
                color: '#60b5ff',
                mb: 1
              }}
            >
              Join EduTrack
            </Typography>
            
            <Typography variant="body1" color="text.secondary">
              Create your academic account in 3 simple steps
            </Typography>
          </Box>

          <Stepper 
            activeStep={activeStep} 
            sx={{ 
              mb: 4,
              '& .MuiStepLabel-label': {
                fontSize: '0.9rem',
                fontWeight: 500
              },
              '& .MuiStepIcon-root.Mui-active': {
                color: '#60b5ff'
              },
              '& .MuiStepIcon-root.Mui-completed': {
                color: '#ffe588'
              }
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2
              }}
            >
              {error}
            </Alert>
          )}

          {renderStepContent(activeStep)}

          {activeStep < 2 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button 
                disabled={activeStep === 0} 
                onClick={handleBack}
                sx={{ borderRadius: 2, px: 3, py: 1.5, textTransform: 'none' }}
              >
                ← Back
              </Button>
              <Button 
                variant="contained" 
                onClick={handleNext} 
                disabled={activeStep === 1}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  background: '#60b5ff',
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': {
                    background: '#4a9eff'
                  }
                }}
              >
                {activeStep === 1 ? 'Capture Face' : 'Next →'}
              </Button>
            </Box>
          )}

          {activeStep === 0 && (
            <Box textAlign="center" sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <RouterLink 
                  to="/login" 
                  style={{ 
                    textDecoration: 'none', 
                    color: '#60b5ff',
                    fontWeight: 500
                  }}
                >
                  Sign In →
                </RouterLink>
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}