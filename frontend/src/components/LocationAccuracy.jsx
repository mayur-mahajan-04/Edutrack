import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Alert, LinearProgress } from '@mui/material';
import { LocationOn, GpsFixed, GpsNotFixed } from '@mui/icons-material';
import { getCurrentLocation } from '../utils/geolocation';

const LocationAccuracy = ({ onLocationUpdate, showDetails = true }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
      onLocationUpdate?.(loc);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy <= 10) return 'success';
    if (accuracy <= 20) return 'warning';
    return 'error';
  };

  const getAccuracyLabel = (accuracy) => {
    if (accuracy <= 10) return 'Excellent';
    if (accuracy <= 20) return 'Good';
    if (accuracy <= 50) return 'Fair';
    return 'Poor';
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />
        <Typography variant="body2" color="textSecondary">
          📍 Getting precise location...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!showDetails) {
    return (
      <Chip
        icon={location?.accuracy <= 20 ? <GpsFixed /> : <GpsNotFixed />}
        label={`±${Math.round(location?.accuracy || 0)}m`}
        color={getAccuracyColor(location?.accuracy)}
        size="small"
      />
    );
  }

  return (
    <Box sx={{ 
      bgcolor: '#f0f8ff', 
      borderRadius: 2, 
      p: 2, 
      border: '1px solid #e3f2fd' 
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <LocationOn sx={{ color: '#60b5ff' }} />
        <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold' }}>
          Location Status
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Chip
          icon={location?.accuracy <= 20 ? <GpsFixed /> : <GpsNotFixed />}
          label={`${getAccuracyLabel(location?.accuracy)} (±${Math.round(location?.accuracy || 0)}m)`}
          color={getAccuracyColor(location?.accuracy)}
          sx={{ fontWeight: 'bold' }}
        />
        {location?.attempts > 1 && (
          <Typography variant="caption" color="textSecondary">
            {location.attempts} attempts
          </Typography>
        )}
      </Box>
      
      {location?.accuracy > 30 && (
        <Alert severity="warning" sx={{ borderRadius: 1, fontSize: '0.8rem' }}>
          ⚠️ Location accuracy is poor. Move to an open area for better GPS signal.
        </Alert>
      )}
      
      {location?.accuracy <= 20 && (
        <Alert severity="success" sx={{ borderRadius: 1, fontSize: '0.8rem' }}>
          ✅ Location accuracy is good for attendance marking.
        </Alert>
      )}
    </Box>
  );
};

export default LocationAccuracy;