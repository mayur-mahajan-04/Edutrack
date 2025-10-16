import React, { useRef, useState, useEffect } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import Webcam from 'react-webcam';
import { getFaceDescriptor, fastCaptureDescriptors, compareMultipleFaces, getCachedDescriptor, setCachedDescriptor } from '../utils/faceRecognition';

const FaceVerification = ({ userFaceDescriptor, onVerificationComplete }) => {
  const webcamRef = useRef(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Check if camera is live by monitoring video stream
    const checkLiveness = () => {
      if (webcamRef.current?.video) {
        const video = webcamRef.current.video;
        if (video.readyState === 4 && video.videoWidth > 0) {
          setIsLive(true);
        }
      }
    };

    const interval = setInterval(checkLiveness, 1000);
    return () => clearInterval(interval);
  }, []);

  const verifyFace = async () => {
    if (!webcamRef.current) return;

    setIsVerifying(true);
    setError('');

    try {
      const video = webcamRef.current.video;
      
      // Ensure video is live and ready
      if (!video || video.readyState !== 4 || !isLive) {
        setError('Camera not ready or not live. Please ensure camera is working.');
        setIsVerifying(false);
        return;
      }

      // Additional liveness check - ensure video is actually streaming
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setError('No live video detected. Please check your camera.');
        setIsVerifying(false);
        return;
      }

      const cacheKey = `face_${Date.now()}`;
      let currentFaceDescriptor = getCachedDescriptor(cacheKey);
      
      if (!currentFaceDescriptor) {
        const samples = await fastCaptureDescriptors(video, 3);
        if (samples && samples.length > 0) {
          if (samples.length === 1) {
            currentFaceDescriptor = samples[0];
          } else {
            const sums = Array(128).fill(0);
            for (const d of samples) {
              for (let i = 0; i < 128; i++) sums[i] += d[i];
            }
            currentFaceDescriptor = sums.map(s => s / samples.length);
          }
          setCachedDescriptor(cacheKey, currentFaceDescriptor);
        }
      }

      if (!currentFaceDescriptor) {
        setError('No face detected. Please ensure your face is clearly visible in the camera.');
        setIsVerifying(false);
        return;
      }

      if (!userFaceDescriptor || !Array.isArray(userFaceDescriptor) || userFaceDescriptor.length === 0) {
        setError('No registered face found. Please register your face first.');
        setIsVerifying(false);
        onVerificationComplete(false);
        return;
      }

      // Normalize stored descriptors: accept a single 128-length array or an array of such arrays
      let storedDescriptors;
      if (Array.isArray(userFaceDescriptor) && Array.isArray(userFaceDescriptor[0])) {
        storedDescriptors = userFaceDescriptor;
      } else if (Array.isArray(userFaceDescriptor) && userFaceDescriptor.length === 128) {
        storedDescriptors = [userFaceDescriptor];
      } else {
        setError('Invalid stored face data. Please re-register your face.');
        setIsVerifying(false);
        return;
      }

      const isMatch = compareMultipleFaces(storedDescriptors, currentFaceDescriptor, 0.5);
      
      if (isMatch) {
        onVerificationComplete(true);
      } else {
        setError('Face does not match registered face. Please try again.');
        onVerificationComplete(false);
      }
    } catch (err) {
      console.error('Face verification error:', err);
      setError('Face verification failed. Please try again.');
      onVerificationComplete(false);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Face Verification Required
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Look directly at the camera for live face verification
      </Typography>
      
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <Webcam
          ref={webcamRef}
          audio={false}
          width={320}
          height={240}
          screenshotFormat="image/jpeg"
          style={{ 
            border: isLive ? '2px solid #4caf50' : '2px solid #f44336', 
            borderRadius: '8px' 
          }}
        />
        {!isLive && (
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px'
          }}>
            Camera Loading...
          </Box>
        )}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color={isLive ? 'success.main' : 'error.main'}>
          Camera Status: {isLive ? '● Live' : '● Not Ready'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        onClick={verifyFace}
        disabled={isVerifying || !isLive}
        sx={{ minWidth: 120 }}
      >
        {isVerifying ? 'Verifying...' : 'Verify Face'}
      </Button>
    </Box>
  );
};

export default FaceVerification;