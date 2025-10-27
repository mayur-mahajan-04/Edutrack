export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('📍 Geolocation not supported on this device'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000, // Increased timeout for better accuracy
      maximumAge: 60000 // 1 minute cache for attendance marking
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = position.coords.accuracy;
        
        // Warn if accuracy is poor (>50 meters)
        if (accuracy > 50) {
          console.warn(`Location accuracy is ${Math.round(accuracy)}m - may affect attendance validation`);
        }
        
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
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