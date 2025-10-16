import React from 'react';
import { Avatar } from '@mui/material';

const FaceAvatar = ({ user, size = 80 }) => {
  const getInitials = () => {
    if (!user?.name) return '?';
    return user.name.charAt(0).toUpperCase();
  };

  const getAvatarColor = () => {
    if (!user?.name) return '#1976d2';
    const charCode = user.name.charCodeAt(0);
    const hue = (charCode * 137.508) % 360;
    return `hsl(${hue}, 60%, 50%)`;
  };

  return (
    <Avatar 
      sx={{ 
        width: size, 
        height: size, 
        bgcolor: getAvatarColor(),
        fontSize: size * 0.4
      }}
    >
      {getInitials()}
    </Avatar>
  );
};

export default FaceAvatar;