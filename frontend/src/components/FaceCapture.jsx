import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress, LinearProgress } from '@mui/material';
import Webcam from 'react-webcam';
import { instantCapture, preloadModels } from '../utils/faceRecognition';

const FaceCapture = ({ onCapture, onError }) => {
  const webcamRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState('');
  const [modelsAvailable, setModelsAvailable] = useState(true);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setProgress(20);
        const loaded = await preloadModels();
        setProgress(100);
        setModelsAvailable(loaded);
        if (!loaded) {
          setError('Face recognition models could not be loaded. You can skip this step.');
        }
      } catch (err) {
        console.error('Model loading error:', err);
        setModelsAvailable(false);
        setError('Face recognition models are not available. You can skip this step.');
      } finally {
        setModelsLoading(false);
      }
    };
    loadModels();
  }, []);

  const captureImage = async () => {
    if (!webcamRef.current || !modelsAvailable) return;

    setIsCapturing(true);
    setError('');

    try {
      const video = webcamRef.current.video;
      
      if (!video || video.readyState !== 4) {
        setError('Camera not ready.');
        setIsCapturing(false);
        return;
      }

      // Instant capture - no delays
      const faceDescriptor = await instantCapture(video);

      if (faceDescriptor) {
        onCapture([faceDescriptor]);
        setError('');
      } else {
        setError('No face detected. Ensure good lighting and face visibility.');
      }
    } catch (err) {
      console.error('Face capture error:', err);
      setError('Capture failed. Try again.');
      onError?.(err);
    } finally {
      setIsCapturing(false);
    }
  };

  const skipFaceCapture = () => {
    // Allow users to skip face capture
    onCapture(null); // Pass null to indicate skipped
  };

  return (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Face Registration
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {modelsLoading ? 'Loading models...' : 'Click capture for instant face registration'}
      </Typography>
      
      {modelsLoading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              mb: 1,
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#60b5ff'
              }
            }} 
          />
          <Typography variant="caption" color="textSecondary">
            Preparing face recognition...
          </Typography>
        </Box>
      )}
      
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <Webcam
          ref={webcamRef}
          audio={false}
          width={320}
          height={240}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: 'user' // Use front camera for face recognition
          }}
          style={{ 
            border: '2px solid #60b5ff', 
            borderRadius: '8px',
            opacity: modelsLoading ? 0.5 : 1
          }}
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
          disabled={isCapturing || modelsLoading || !modelsAvailable}
          sx={{ 
            minWidth: 120,
            background: '#60b5ff',
            '&:hover': { background: '#4a9eff' }
          }}
        >
          {isCapturing ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
              Capturing...
            </>
          ) : (
            'Capture Face'
          )}
        </Button>
        
        {(!modelsAvailable || modelsLoading) && (
          <Button
            variant="outlined"
            onClick={skipFaceCapture}
            disabled={modelsLoading}
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
            Skip for Now
          </Button>
        )}
      </Box>
      
      {!modelsAvailable && !modelsLoading && (
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          Face recognition is optional. You can register without it and add it later.
        </Typography>
      )}
      
      {modelsAvailable && !modelsLoading && (
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          💡 Instant capture - just look at camera and click
        </Typography>
      )}
    </Box>
  );
};

export default FaceCapture;