import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onScan, onError }) => {
  const scannerRef = useRef(null);
  const [scanner, setScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanner]);

  const startScanning = () => {
    if (scanner) {
      scanner.clear();
    }

    const newScanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      false
    );

    newScanner.render(
      (decodedText) => {
        try {
          const qrData = JSON.parse(decodedText);
          onScan(qrData);
          newScanner.clear();
          setIsScanning(false);
        } catch (error) {
          onError('Invalid QR code format');
        }
      },
      (error) => {
        console.log('QR scan error:', error);
      }
    );

    setScanner(newScanner);
    setIsScanning(true);
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
    setIsScanning(false);
  };

  return (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Scan QR Code for Attendance
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        {!isScanning ? (
          <Button
            variant="contained"
            onClick={startScanning}
            sx={{ minWidth: 120 }}
          >
            Start Scanning
          </Button>
        ) : (
          <Button
            variant="outlined"
            onClick={stopScanning}
            sx={{ minWidth: 120 }}
          >
            Stop Scanning
          </Button>
        )}
      </Box>

      <Box id="qr-reader" sx={{ maxWidth: 400, margin: '0 auto' }} />
    </Box>
  );
};

export default QRScanner;