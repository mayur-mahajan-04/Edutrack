import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material';
import Webcam from 'react-webcam';
import { instantCapture } from '../utils/faceRecognition';
import { compareFaces } from '../utils/faceRecognition';

const FaceVerification = ({ userFaceDescriptor, onVerificationComplete }) => {
  const webcamRef = useRef(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  const verifyFace = async () => {
    if (!webcamRef.current || !userFaceDescriptor) return;

    setIsVerifying(true);
    setError('');

    try {
      const video = webcamRef.current.video;
      
      if (!video || video.readyState !== 4) {
        setError('Camera not ready');
        setIsVerifying(false);
        return;
      }

      const currentDescriptor = await instantCapture(video);

      if (currentDescriptor) {
        const isMatch = compareFaces(userFaceDescriptor, currentDescriptor, 0.6);
        
        if (isMatch) {
          onVerificationComplete(true);
        } else {
          setAttempts(prev => prev + 1);
          if (attempts + 1 >= maxAttempts) {
            setError('Face verification failed. Please try again later.');
            onVerificationComplete(false);
          } else {
            setError(`Face doesn't match. ${maxAttempts - attempts - 1} attempts remaining.`);
          }
        }
      } else {
        setAttempts(prev => prev + 1);
        if (attempts + 1 >= maxAttempts) {
          setError('Unable to detect face. Verification failed.');
          onVerificationComplete(false);
        } else {
          setError(`No face detected. ${maxAttempts - attempts - 1} attempts remaining.`);
        }
      }
    } catch (err) {
      console.error('Face verification error:', err);
      setError('Verification failed. Please try again.');
      onVerificationComplete(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const skipVerification = () => {
    onVerificationComplete(false);
  };

  return (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#60b5ff', fontWeight: 'bold' }}>
        👤 Face Verification
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Look directly at the camera for verification
      </Typography>
      
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <Webcam
          ref={webcamRef}
          audio={false}
          width={320}
          height={240}
          screenshotFormat="image/jpeg"
          style={{ 
            border: '2px solid #60b5ff', 
            borderRadius: '8px'
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={verifyFace}
          disabled={isVerifying || attempts >= maxAttempts}
          sx={{ 
            minWidth: 120,
            bgcolor: '#60b5ff',
            '&:hover': { bgcolor: '#4a9eff' }
          }}
        >
          {isVerifying ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
              Verifying...
            </>
          ) : (
            'Verify Face'
          )}
        </Button>
        
        <Button
          variant="outlined"
          onClick={skipVerification}
          sx={{ 
            minWidth: 120,
            borderColor: '#60b5ff',
            color: '#60b5ff',
            '&:hover': {
              borderColor: '#4a9eff',
              backgroundColor: 'rgba(96, 181, 255, 0.04)'
            }
          }}
        >
          Skip Verification
        </Button>
      </Box>
      
      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
        Attempts: {attempts}/{maxAttempts}
      </Typography>
    </Box>
  );
};

export default FaceVerification;