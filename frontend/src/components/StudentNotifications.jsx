import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Chip, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/api/notifications/student');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiClient.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>Loading notifications...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto', px: 2 }}>
        <Typography variant="h4" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
          🔔 Notifications
        </Typography>
        
        {notifications.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" color="textSecondary">
              📭 No notifications yet
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              You'll see important updates and announcements here
            </Typography>
          </Paper>
        ) : (
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <List>
              {notifications.map((notification, index) => (
                <ListItem
                  key={notification._id}
                  sx={{
                    borderBottom: index < notifications.length - 1 ? '1px solid #eee' : 'none',
                    bgcolor: notification.read ? 'transparent' : '#f0f8ff',
                    '&:hover': { bgcolor: '#f8fafc' }
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Chip label="New" color="primary" size="small" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(notification.createdAt).toLocaleString()}
                        </Typography>
                        {!notification.read && (
                          <Button
                            size="small"
                            onClick={() => markAsRead(notification._id)}
                            sx={{ ml: 2, color: '#60b5ff' }}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
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
      </Box>
    </Box>
  );
};

export default StudentNotifications;