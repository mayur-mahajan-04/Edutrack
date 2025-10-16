import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  CardActions,
  Chip, 
  Button, 
  Collapse,
  IconButton,
  Divider,
  Badge,
  Grid
} from '@mui/material';
import { 
  ExpandMore, 
  ExpandLess, 
  Notifications, 
  Schedule, 
  Person, 
  Info 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState({});
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

  const toggleExpanded = (notificationId) => {
    setExpandedCards(prev => ({
      ...prev,
      [notificationId]: !prev[notificationId]
    }));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'attendance': return <Schedule sx={{ color: '#60b5ff' }} />;
      case 'announcement': return <Notifications sx={{ color: '#ff9800' }} />;
      case 'personal': return <Person sx={{ color: '#4caf50' }} />;
      default: return <Info sx={{ color: '#60b5ff' }} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'attendance': return '#60b5ff';
      case 'announcement': return '#ff9800';
      case 'personal': return '#4caf50';
      default: return '#60b5ff';
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
      <Box sx={{ maxWidth: 1000, mx: 'auto', px: 2 }}>
        <Typography variant="h4" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
          🔔 Notifications
        </Typography>
        
        {notifications.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
            <Box sx={{ mb: 2 }}>
              <Notifications sx={{ fontSize: 64, color: '#ddd' }} />
            </Box>
            <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
              📭 No notifications yet
            </Typography>
            <Typography variant="body2" color="textSecondary">
              You'll see important updates and announcements here
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {notifications.map((notification) => {
              const isExpanded = expandedCards[notification._id];
              const notificationType = notification.type || 'general';
              
              return (
                <Grid item xs={12} key={notification._id}>
                  <Card 
                    sx={{ 
                      borderRadius: 3, 
                      boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)',
                      border: !notification.read ? `2px solid ${getNotificationColor(notificationType)}` : '1px solid #e0e0e0',
                      bgcolor: !notification.read ? 'rgba(96, 181, 255, 0.02)' : 'white',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 6px 25px rgba(96, 181, 255, 0.2)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <CardContent sx={{ pb: 1 }}>
                      {/* Header */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                          <Badge 
                            variant="dot" 
                            color="error" 
                            invisible={notification.read}
                            sx={{
                              '& .MuiBadge-badge': {
                                backgroundColor: getNotificationColor(notificationType)
                              }
                            }}
                          >
                            {getNotificationIcon(notificationType)}
                          </Badge>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                                {notification.title || 'Notification'}
                              </Typography>
                              {!notification.read && (
                                <Chip 
                                  label="New" 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: getNotificationColor(notificationType),
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.7rem'
                                  }} 
                                />
                              )}
                              <Chip 
                                label={notificationType.toUpperCase()} 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  borderColor: getNotificationColor(notificationType),
                                  color: getNotificationColor(notificationType),
                                  fontSize: '0.65rem'
                                }} 
                              />
                            </Box>
                            <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              📅 {new Date(notification.createdAt || Date.now()).toLocaleDateString()}
                              🕒 {new Date(notification.createdAt || Date.now()).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton 
                          onClick={() => toggleExpanded(notification._id)}
                          sx={{ color: '#60b5ff' }}
                        >
                          {isExpanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>

                      {/* Preview Message */}
                      <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                        {notification.message ? 
                          (notification.message.length > 100 && !isExpanded ? 
                            `${notification.message.substring(0, 100)}...` : 
                            notification.message
                          ) : 
                          'No message content'
                        }
                      </Typography>

                      {/* Expanded Details */}
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 2 }}>
                          <Typography variant="subtitle2" sx={{ color: '#60b5ff', fontWeight: 600, mb: 1 }}>
                            📋 Notification Details
                          </Typography>
                          
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ mb: 1 }}>
                                <Typography variant="caption" color="textSecondary">ID:</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                  {notification._id || 'N/A'}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ mb: 1 }}>
                                <Typography variant="caption" color="textSecondary">Status:</Typography>
                                <Typography variant="body2">
                                  {notification.read ? '✅ Read' : '🔔 Unread'}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ mb: 1 }}>
                                <Typography variant="caption" color="textSecondary">Priority:</Typography>
                                <Typography variant="body2">
                                  {notification.priority || 'Normal'} 
                                  {notification.priority === 'high' && '🔴'}
                                  {notification.priority === 'medium' && '🟡'}
                                  {notification.priority === 'low' && '🟢'}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ mb: 1 }}>
                                <Typography variant="caption" color="textSecondary">From:</Typography>
                                <Typography variant="body2">
                                  {notification.sender || notification.from || 'System'}
                                </Typography>
                              </Box>
                            </Grid>
                            {notification.subject && (
                              <Grid item xs={12}>
                                <Box sx={{ mb: 1 }}>
                                  <Typography variant="caption" color="textSecondary">Subject:</Typography>
                                  <Typography variant="body2">
                                    {notification.subject}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}
                            {notification.actionUrl && (
                              <Grid item xs={12}>
                                <Box sx={{ mb: 1 }}>
                                  <Typography variant="caption" color="textSecondary">Action Required:</Typography>
                                  <Button 
                                    size="small" 
                                    variant="outlined" 
                                    href={notification.actionUrl}
                                    sx={{ ml: 1, borderColor: '#60b5ff', color: '#60b5ff' }}
                                  >
                                    Take Action
                                  </Button>
                                </Box>
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                      </Collapse>
                    </CardContent>

                    <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {!notification.read && (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => markAsRead(notification._id)}
                              sx={{ 
                                bgcolor: '#60b5ff',
                                '&:hover': { bgcolor: '#4a9eff' },
                                textTransform: 'none'
                              }}
                            >
                              ✓ Mark as Read
                            </Button>
                          )}
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => toggleExpanded(notification._id)}
                            sx={{ 
                              borderColor: '#60b5ff',
                              color: '#60b5ff',
                              textTransform: 'none'
                            }}
                          >
                            {isExpanded ? 'Show Less' : 'Show Details'}
                          </Button>
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          {notification.read ? 'Read' : 'Unread'}
                        </Typography>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
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