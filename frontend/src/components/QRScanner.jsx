import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Box, Typography, Alert, Button, CircularProgress } from '@mui/material';

const QRScanner = ({ onScan, onError }) => {
  const [scanner, setScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    // Auto-start scanning when component mounts
    startScanning();
    
    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      // Stop the stream immediately, we just needed permission
      stream.getTracks().forEach(track => track.stop());
      setPermissionGranted(true);
      return true;
    } catch (err) {
      console.error('Camera permission denied:', err);
      setError('Camera permission is required for QR scanning. Please allow camera access and try again.');
      return false;
    }
  };

  const startScanning = async () => {
    setError('');
    setIsInitializing(true);

    // Request camera permission first
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      setIsInitializing(false);
      return;
    }

    setIsScanning(true);
    setIsInitializing(false);

    // Wait for DOM element to be rendered
    setTimeout(() => {
      try {
        const qrScanner = new Html5QrcodeScanner(
          'qr-reader',
          { 
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            showZoomSliderIfSupported: false,
            facingMode: 'environment', // Use back camera for QR scanning
            rememberLastUsedCamera: true
          },
          false
        );

        qrScanner.render(
          (decodedText) => {
            try {
              const qrData = JSON.parse(decodedText);
              if (qrData.id && qrData.data) {
                qrScanner.clear().then(() => {
                  setIsScanning(false);
                  onScan(qrData);
                }).catch(console.error);
              } else {
                throw new Error('Invalid QR format');
              }
            } catch (err) {
              setError('Invalid QR code format. Please scan a valid attendance QR code.');
              onError?.('Invalid QR code format');
            }
          },
          (errorMessage) => {
            // Only show relevant errors
            if (errorMessage.includes('NotAllowedError')) {
              setError('Camera access denied. Please allow camera permission.');
            } else if (errorMessage.includes('NotFoundError')) {
              setError('No camera found. Please check your device.');
            }
            // Ignore NotFoundException (no QR code found)
          }
        ).catch((err) => {
          console.error('Scanner initialization error:', err);
          setError('Failed to initialize camera. Please refresh and try again.');
          setIsScanning(false);
        });

        setScanner(qrScanner);
      } catch (err) {
        console.error('QR Scanner error:', err);
        setError('Failed to start QR scanner. Please try again.');
        setIsScanning(false);
        setIsInitializing(false);
      }
    }, 100); // Wait 100ms for DOM to update
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.clear().then(() => {
        setIsScanning(false);
        setScanner(null);
      }).catch(console.error);
    }
  };

  return (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#60b5ff', fontWeight: 'bold' }}>
        📱 QR Code Scanner
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
          {error.includes('permission') && (
            <Button 
              size="small" 
              onClick={startScanning} 
              sx={{ mt: 1, display: 'block', mx: 'auto' }}
            >
              Try Again
            </Button>
          )}
        </Alert>
      )}

      {isInitializing && (
        <Box sx={{ mb: 2 }}>
          <CircularProgress sx={{ color: '#60b5ff' }} />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Initializing camera...
          </Typography>
        </Box>
      )}

      {!isScanning && !isInitializing ? (
        <Box>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {error ? 'Camera failed to start. Try again.' : 'Click start to scan the QR code displayed by your teacher'}
          </Typography>
          <Button
            variant="contained"
            onClick={startScanning}
            sx={{
              bgcolor: '#60b5ff',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              '&:hover': { bgcolor: '#4a9eff' }
            }}
          >
            🚀 {error ? 'Retry' : 'Start'} Scanning
          </Button>
        </Box>
      ) : isScanning && (
        <Box>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            📷 Point your back camera at the QR code
          </Typography>
          <Box 
            id="qr-reader" 
            sx={{ 
              maxWidth: 400, 
              mx: 'auto', 
              mb: 2,
              '& video': {
                borderRadius: 2,
                border: '2px solid #60b5ff',
                maxWidth: '100%'
              },
              '& canvas': {
                borderRadius: 2,
                border: '2px solid #60b5ff'
              }
            }}
          />
          <Button
            variant="outlined"
            onClick={stopScanning}
            sx={{
              borderColor: '#60b5ff',
              color: '#60b5ff',
              px: 3,
              py: 1,
              '&:hover': { bgcolor: 'rgba(96, 181, 255, 0.1)' }
            }}
          >
            ⏹️ Stop Scanning
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default QRScanner;