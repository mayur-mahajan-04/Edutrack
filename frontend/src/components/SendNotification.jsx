import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Alert,
  Box
} from '@mui/material';
import apiClient from '../utils/apiClient';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const SendNotification = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    year: '',
    division: '',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message || !formData.year || !formData.division || !formData.department) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/api/notifications/send', formData);
      toast.success('Notification sent successfully!');
      setFormData({
        title: '',
        message: '',
        type: 'info',
        year: '',
        division: '',
        department: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>📢 Send Notification</Typography>
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title *"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message *"
                multiline
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  label="Type"
                >
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="error">Important</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Year *</InputLabel>
                <Select
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  label="Year *"
                >
                  <MenuItem value={1}>1st Year</MenuItem>
                  <MenuItem value={2}>2nd Year</MenuItem>
                  <MenuItem value={3}>3rd Year</MenuItem>
                  <MenuItem value={4}>4th Year</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Division *</InputLabel>
                <Select
                  value={formData.division}
                  onChange={(e) => setFormData({...formData, division: e.target.value})}
                  label="Division *"
                >
                  <MenuItem value="A">Division A</MenuItem>
                  <MenuItem value="B">Division B</MenuItem>
                  <MenuItem value="C">Division C</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Department *</InputLabel>
                <Select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  label="Department *"
                >
                  <MenuItem value="Computer">Computer</MenuItem>
                  <MenuItem value="IT">IT</MenuItem>
                  <MenuItem value="Mechanical">Mechanical</MenuItem>
                  <MenuItem value="Civil">Civil</MenuItem>
                  <MenuItem value="Electrical">Electrical</MenuItem>
                  <MenuItem value="Electronics and Telecommunication">Electronics & Telecom</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                This notification will be sent to all students in {formData.year && formData.division && formData.department ? 
                  `${formData.year === 1 ? '1st' : formData.year === 2 ? '2nd' : formData.year === 3 ? '3rd' : '4th'} Year - Division ${formData.division} - ${formData.department} Department` : 
                  'the selected class'}
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? 'Sending...' : 'Send Notification'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/teacher')}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default SendNotification;