export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('📍 Geolocation not supported on this device'));
      return;
    }

    let attempts = 0;
    const maxAttempts = 3;
    const bestPosition = { accuracy: Infinity };

    const tryGetLocation = () => {
      attempts++;
      
      const options = {
        enableHighAccuracy: true,
        timeout: attempts === 1 ? 20000 : 10000, // Longer timeout for first attempt
        maximumAge: attempts === 1 ? 0 : 30000 // Fresh location for first attempt
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const accuracy = position.coords.accuracy;
          
          // Keep the most accurate position
          if (accuracy < bestPosition.accuracy) {
            bestPosition.latitude = position.coords.latitude;
            bestPosition.longitude = position.coords.longitude;
            bestPosition.accuracy = accuracy;
            bestPosition.timestamp = position.timestamp;
          }
          
          // If accuracy is good enough (< 20m) or max attempts reached, resolve
          if (accuracy <= 20 || attempts >= maxAttempts) {
            if (accuracy > 30) {
              console.warn(`Location accuracy is ${Math.round(accuracy)}m - may affect attendance validation`);
            }
            
            resolve({
              latitude: bestPosition.latitude,
              longitude: bestPosition.longitude,
              accuracy: bestPosition.accuracy,
              timestamp: bestPosition.timestamp,
              attempts: attempts
            });
          } else {
            // Try again for better accuracy
            setTimeout(tryGetLocation, 1000);
          }
        },
        (error) => {
          if (attempts < maxAttempts && error.code === error.TIMEOUT) {
            // Retry on timeout
            setTimeout(tryGetLocation, 1000);
            return;
          }
          
          // If we have a previous position, use it
          if (bestPosition.latitude) {
            console.warn('Using best available position due to error:', error.message);
            resolve(bestPosition);
            return;
          }
          
          let message = '📍 Location access failed';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = '📍 Location permission denied. Please enable location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = '📍 Location unavailable. Please check your GPS/network connection.';
              break;
            case error.TIMEOUT:
              message = '📍 Location request timed out. Please try again.';
              break;
          }
          reject(new Error(message));
        },
        options
      );
    };

    tryGetLocation();
  });
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Validate coordinates
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    throw new Error('Invalid coordinates provided');
  }
  
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

// Get high accuracy location for attendance marking
export const getHighAccuracyLocation = async () => {
  try {
    const location = await getCurrentLocation();
    
    // If accuracy is poor, try to get a better reading
    if (location.accuracy > 30) {
      console.log('Poor accuracy detected, attempting to improve...');
      
      // Wait a moment and try again
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        const betterLocation = await getCurrentLocation();
        if (betterLocation.accuracy < location.accuracy) {
          return betterLocation;
        }
      } catch (e) {
        console.warn('Failed to get better accuracy, using original location');
      }
    }
    
    return location;
  } catch (error) {
    throw error;
  }
};

// Helper function to check if location is within allowed radius
export const isWithinRadius = (studentLat, studentLon, classLat, classLon, allowedRadius = 20) => {
  try {
    const distance = calculateDistance(studentLat, studentLon, classLat, classLon);
    return {
      isWithin: distance <= allowedRadius,
      distance: Math.round(distance),
      allowedRadius
    };
  } catch (error) {
    console.error('Distance calculation error:', error);
    return {
      isWithin: false,
      distance: null,
      allowedRadius,
      error: error.message
    };
  }
};