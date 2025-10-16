import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import Webcam from 'react-webcam';
import { fastCaptureDescriptors } from '../utils/faceRecognition';

const FaceCapture = ({ onCapture, onError }) => {
  const webcamRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState('');
  const [modelsAvailable, setModelsAvailable] = useState(true);

  const captureImage = async () => {
    if (!webcamRef.current) return;

    setIsCapturing(true);
    setError('');

    try {
      const video = webcamRef.current.video;
      
      if (!video || video.readyState !== 4) {
        setError('Camera not ready. Please wait and try again.');
        setIsCapturing(false);
        return;
      }

      const faceDescriptors = await fastCaptureDescriptors(video, 5);

      if (faceDescriptors && faceDescriptors.length > 0) {
        onCapture(faceDescriptors);
        setError('');
      } else {
        setError('Unable to capture face data. Please ensure your face is clearly visible and try again.');
      }
    } catch (err) {
      console.error('Face capture error:', err);
      if (err.message.includes('models not available')) {
        setModelsAvailable(false);
        setError('Face recognition models are not available. Please ensure the models are downloaded or use the skip option.');
      } else {
        setError('Error capturing face. Please ensure your face is clearly visible and try again.');
        onError?.(err);
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const skipFaceCapture = () => {
    // Allow users to skip face capture if models aren't available
    onCapture([Array.from({length: 128}, () => Math.random())]);
  };

  return (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Face Registration
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Position your face in the camera. Fast capture in progress...
      </Typography>
      
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <Webcam
          ref={webcamRef}
          audio={false}
          width={320}
          height={240}
          screenshotFormat="image/jpeg"
          style={{ border: '2px solid #ccc', borderRadius: '8px' }}
        />
      </Box>

      {error && (
        <Alert severity={modelsAvailable ? "error" : "warning"} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={captureImage}
          disabled={isCapturing}
          sx={{ minWidth: 120 }}
        >
          {isCapturing ? 'Capturing...' : 'Capture Face'}
        </Button>
        
        {!modelsAvailable && (
          <Button
            variant="outlined"
            onClick={skipFaceCapture}
            sx={{ minWidth: 120 }}
          >
            Skip Face Capture
          </Button>
        )}
      </Box>
      
      {!modelsAvailable && (
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          Face recognition models are not available. You can still use the system without face verification.
        </Typography>
      )}
    </Box>
  );
};

export default FaceCapture;