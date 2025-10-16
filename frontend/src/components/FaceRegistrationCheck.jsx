import React from 'react';
import { Alert, Button, Box } from '@mui/material';

const FaceRegistrationCheck = ({ user, onRegisterFace }) => {
  const hasFaceRegistered = user?.faceDescriptor && 
    Array.isArray(user.faceDescriptor) && 
    user.faceDescriptor.length === 128;

  if (hasFaceRegistered) {
    return null; // Don't show anything if face is registered
  }

  return (
    <Alert 
      severity="warning" 
      sx={{ mb: 2 }}
      action={
        <Button 
          color="inherit" 
          size="small" 
          onClick={onRegisterFace}
        >
          Register Face
        </Button>
      }
    >
      Face not registered. You need to register your face to mark attendance.
    </Alert>
  );
};

export default FaceRegistrationCheck;