import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Alert } from '@mui/material';
import { preloadModels } from '../utils/faceRecognition';

const ModelStatus = () => {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    checkModelStatus();
  }, []);

  const checkModelStatus = async () => {
    try {
      const loaded = await preloadModels();
      setStatus(loaded ? 'ready' : 'failed');
      if (!loaded) {
        setError('Face recognition models could not be loaded');
      }
    } catch (err) {
      setStatus('failed');
      setError(err.message || 'Model loading failed');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'ready': return 'success';
      case 'failed': return 'error';
      default: return 'warning';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'ready': return '✅ Face Recognition Ready';
      case 'failed': return '❌ Face Recognition Unavailable';
      default: return '⏳ Loading Face Recognition...';
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Chip 
        label={getStatusText()}
        color={getStatusColor()}
        size="small"
        sx={{ mb: 1 }}
      />
      {status === 'failed' && error && (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          <Typography variant="body2">
            {error}. You can still mark attendance without face verification.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default ModelStatus;