import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Collapse,
  IconButton,
  Divider
} from '@mui/material';
import { CheckCircle, Info, Warning, Error, ExpandMore, ExpandLess, Person, Schedule, Class } from '@mui/icons-material';
import apiClient from '../utils/apiClient';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState({});
  const [filters, setFilters] = useState({
    year: '',
    division: '',
    department: ''
  });
  const navigate = useNavigate();

  const toggleExpand = (notificationId) => {
    setExpandedCards(prev => ({
      ...prev,
      [notificationId]: !prev[notificationId]
    }));
  };

  useEffect(() => {
    fetchNotifications();
  }, [filters]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.year) params.append('year', filters.year);
      if (filters.division) params.append('division', filters.division);
      if (filters.department) params.append('department', filters.department);
      
      const response = await apiClient.get(`/api/notifications/student?${params}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ year: '', division: '', department: '' });
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiClient.put(`/api/notifications/${notificationId}/read`);
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle color="success" />;
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      default: return <Info color="info" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        🔔 All Notifications
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Filter Notifications</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                value={filters.year}
                onChange={(e) => setFilters({...filters, year: e.target.value})}
                label="Year"
              >
                <MenuItem value="">All Years</MenuItem>
                <MenuItem value={1}>1st Year</MenuItem>
                <MenuItem value={2}>2nd Year</MenuItem>
                <MenuItem value={3}>3rd Year</MenuItem>
                <MenuItem value={4}>4th Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Division</InputLabel>
              <Select
                value={filters.division}
                onChange={(e) => setFilters({...filters, division: e.target.value})}
                label="Division"
              >
                <MenuItem value="">All Divisions</MenuItem>
                <MenuItem value="A">Division A</MenuItem>
                <MenuItem value="B">Division B</MenuItem>
                <MenuItem value="C">Division C</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={filters.department}
                onChange={(e) => setFilters({...filters, department: e.target.value})}
                label="Department"
              >
                <MenuItem value="">All Departments</MenuItem>
                <MenuItem value="Computer">Computer</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="Mechanical">Mechanical</MenuItem>
                <MenuItem value="Civil">Civil</MenuItem>
                <MenuItem value="Electrical">Electrical</MenuItem>
                <MenuItem value="Electronics and Telecommunication">Electronics & Telecom</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="outlined" onClick={clearFilters} fullWidth>
              Clear Filters
            </Button>
          </Grid>
        </Grid>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          📊 Showing {notifications.length} notifications
        </Typography>
      </Paper>

      {loading ? (
        <Alert severity="info">Loading notifications...</Alert>
      ) : notifications.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {notifications.map((notification) => {
            const isRead = notification.isRead.some(r => r.student);
            return (
              <Card 
                key={notification._id} 
                sx={{ 
                  opacity: isRead ? 0.7 : 1,
                  border: isRead ? 'none' : '2px solid #1976d2'
                }}
              >
                <CardContent>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      {getTypeIcon(notification.type)}
                      <Typography variant="h6" sx={{ flex: 1 }}>
                        {notification.title}
                      </Typography>
                      {!isRead && <Chip label="New" color="primary" size="small" />}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={notification.type.toUpperCase()} 
                        color={getTypeColor(notification.type)} 
                        size="small" 
                      />
                      <IconButton 
                        onClick={() => toggleExpand(notification._id)}
                        size="small"
                      >
                        {expandedCards[notification._id] ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Message Preview */}
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {notification.message.length > 100 && !expandedCards[notification._id] 
                      ? `${notification.message.substring(0, 100)}...` 
                      : notification.message}
                  </Typography>

                  {/* Basic Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="caption">
                        {notification.sender?.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Schedule fontSize="small" color="action" />
                      <Typography variant="caption">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Class fontSize="small" color="action" />
                      <Typography variant="caption">
                        {notification.recipients.year === 1 ? '1st' : notification.recipients.year === 2 ? '2nd' : notification.recipients.year === 3 ? '3rd' : '4th'} Year - {notification.recipients.division} - {notification.recipients.department}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Expanded Details */}
                  <Collapse in={expandedCards[notification._id]}>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          📧 Notification Details
                        </Typography>
                        <Box sx={{ pl: 1 }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>ID:</strong> {notification._id}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Type:</strong> {notification.type}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Status:</strong> {isRead ? '✅ Read' : '📬 Unread'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Created:</strong> {new Date(notification.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          🎯 Target Audience
                        </Typography>
                        <Box sx={{ pl: 1 }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Year:</strong> {notification.recipients.year === 1 ? '1st Year' : notification.recipients.year === 2 ? '2nd Year' : notification.recipients.year === 3 ? '3rd Year' : '4th Year'}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Division:</strong> Division {notification.recipients.division}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Department:</strong> {notification.recipients.department}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Sender:</strong> {notification.sender?.name} (Teacher)
                          </Typography>
                        </Box>
                      </Grid>
                      {notification.message.length > 100 && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="primary" gutterBottom>
                            📝 Full Message
                          </Typography>
                          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Typography variant="body2">
                              {notification.message}
                            </Typography>
                          </Paper>
                        </Grid>
                      )}
                    </Grid>
                  </Collapse>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                    {!isRead && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => markAsRead(notification._id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                    <Button 
                      size="small" 
                      onClick={() => toggleExpand(notification._id)}
                    >
                      {expandedCards[notification._id] ? 'Show Less' : 'Show Details'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      ) : (
        <Alert severity="info">
          No notifications available
        </Alert>
      )}

      <Box sx={{ mt: 3 }}>
        <Button variant="outlined" onClick={() => navigate('/student')}>
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default StudentNotifications;