import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Box, Typography, Alert, Button } from '@mui/material';

const QRScanner = ({ onScan, onError }) => {
  const [scanner, setScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [scanner]);

  const startScanning = () => {
    setError('');
    setIsScanning(true);

    const qrScanner = new Html5QrcodeScanner(
      'qr-reader',
      { 
        fps: 30,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2,
        facingMode: 'environment' // Use back camera for QR scanning
      },
      false
    );

    qrScanner.render(
      (decodedText) => {
        try {
          const qrData = JSON.parse(decodedText);
          if (qrData.id && qrData.data) {
            qrScanner.clear();
            setIsScanning(false);
            onScan(qrData);
          } else {
            throw new Error('Invalid QR format');
          }
        } catch (err) {
          setError('Invalid QR code format');
          onError?.('Invalid QR code format');
        }
      },
      (errorMessage) => {
        // Ignore common scanning errors
        if (!errorMessage.includes('NotFoundException')) {
          console.warn('QR scan error:', errorMessage);
        }
      }
    );

    setScanner(qrScanner);
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
        </Alert>
      )}

      {!isScanning ? (
        <Box>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Click start to scan the QR code displayed by your teacher
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
            🚀 Start Scanning
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Point your camera at the QR code
          </Typography>
          <Box 
            id="qr-reader" 
            sx={{ 
              maxWidth: 400, 
              mx: 'auto', 
              mb: 2,
              '& video': {
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
            Stop Scanning
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default QRScanner;