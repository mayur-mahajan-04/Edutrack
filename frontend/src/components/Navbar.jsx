import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Avatar, 
  IconButton, 
  Menu, 
  MenuItem, 
  Chip,
  Divider
} from '@mui/material';
import { 
  School, 
  AccountCircle, 
  Logout, 
  Dashboard, 
  Notifications,
  Settings
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleDashboard = () => {
    navigate(`/${user?.role}`);
    handleMenuClose();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'teacher': return 'warning';
      case 'student': return 'success';
      default: return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return '👑';
      case 'teacher': return '👨‍🏫';
      case 'student': return '🎓';
      default: return '👤';
    }
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        bgcolor: '#60b5ff',
        boxShadow: '0 2px 4px rgba(96, 181, 255, 0.2)'
      }}
    >
      <Toolbar sx={{ minHeight: '70px !important' }}>
        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <School sx={{ fontSize: 30, mr: 2, color: 'white' }} />
          <Box>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                color: 'white',
                letterSpacing: '0.3px',
                fontSize: 28
              }}
            >
              EduTrack
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontSize: '0.9rem',
                fontWeight: 400
              }}
            >
              Education Management System
            </Typography>
          </Box>
        </Box>

        {/* User Info and Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Role Chip */}
          <Chip
            label={user?.role?.toUpperCase()}
            size="small"
            sx={{ 
              bgcolor: '#ffe588',
              color: '#2d3748',
              fontWeight: 500,
              fontSize: '0.7rem',
              border: '1px solid rgba(255, 229, 136, 0.8)'
            }}
          />

          {/* User Avatar and Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500 }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {user?.department || user?.email}
              </Typography>
            </Box>
            
            <IconButton
              onClick={handleMenuOpen}
              sx={{ p: 0 }}
            >
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36,
                  bgcolor: '#ffe588',
                  color: '#2d3748',
                  fontSize: '1rem',
                  fontWeight: 500,
                  border: '2px solid rgba(255, 229, 136, 0.8)'
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>

          {/* User Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 180,
                borderRadius: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0'
              }
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            
            <MenuItem onClick={handleDashboard}>
              <Dashboard sx={{ mr: 2, fontSize: 20 }} />
              Dashboard
            </MenuItem>
            
            <MenuItem onClick={() => { navigate(`/${user?.role}/profile`); handleMenuClose(); }}>
              <AccountCircle sx={{ mr: 2, fontSize: 20 }} />
              Profile
            </MenuItem>
            
            {user?.role === 'student' && (
              <MenuItem onClick={() => { navigate('/student/notifications'); handleMenuClose(); }}>
                <Notifications sx={{ mr: 2, fontSize: 20 }} />
                Notifications
              </MenuItem>
            )}
            
            <Divider />
            
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <Logout sx={{ mr: 2, fontSize: 20 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;