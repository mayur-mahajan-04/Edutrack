import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export const loadModels = async () => {
  if (modelsLoaded) return;
  
  try {
    // Try CDN first for reliability
    const CDN_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
    
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(CDN_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(CDN_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(CDN_URL)
    ]);
    
    modelsLoaded = true;
    console.log('Models loaded from CDN');
  } catch (error) {
    try {
      // Fallback to local
      const MODEL_URL = '/models';
      
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);
      
      modelsLoaded = true;
      console.log('Models loaded locally');
    } catch (localError) {
      console.error('Failed to load models:', localError);
      modelsLoaded = false;
      throw new Error('Models unavailable');
    }
  }
};

export const detectFace = async (imageElement) => {
  try {
    if (!modelsLoaded) {
      await loadModels();
    }
    
    const detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.SsdMobilenetv1Options({ 
        minConfidence: 0.4, // Higher confidence for better quality
        maxResults: 1
      }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    return detection;
  } catch (error) {
    console.error('Error detecting face:', error);
    return null;
  }
};

export const compareFaces = (descriptor1, descriptor2, threshold = 0.6) => {
  if (!descriptor1 || !descriptor2) return false;
  
  try {
    const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
    return distance < threshold;
  } catch (error) {
    console.error('Error comparing faces:', error);
    return false;
  }
};

export const compareMultipleFaces = (storedDescriptors, currentDescriptor, threshold = 0.5) => {
  if (!storedDescriptors?.length || !currentDescriptor) return false;
  
  try {
    for (const desc of storedDescriptors) {
      const distance = faceapi.euclideanDistance(desc, currentDescriptor);
      if (distance < threshold) return true;
    }
    return false;
  } catch (error) {
    console.error('Error comparing multiple faces:', error);
    return false;
  }
};

export const fastCaptureDescriptors = async (videoElement, count = 3) => {
  // Ensure models are loaded first
  if (!modelsLoaded) {
    await loadModels();
  }
  
  const descriptors = [];
  let attempts = 0;
  const maxAttempts = count * 2; // Allow more attempts for better success rate
  
  while (descriptors.length < count && attempts < maxAttempts) {
    const desc = await getFaceDescriptor(videoElement);
    if (desc && desc.length === 128) {
      descriptors.push(desc);
    }
    attempts++;
    
    // Small delay only if we need more descriptors
    if (descriptors.length < count && attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 100));
    }
  }
  
  return descriptors;
};

export const getFaceDescriptor = async (videoElement) => {
  try {
    if (!modelsLoaded) {
      throw new Error('Models not loaded');
    }
    
    // Direct video processing - no canvas for maximum speed
    const detection = await faceapi
      .detectSingleFace(videoElement, new faceapi.SsdMobilenetv1Options({ 
        minConfidence: 0.3, // Lower for faster detection
        maxResults: 1
      }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    return detection?.descriptor ? Array.from(detection.descriptor) : null;
    
  } catch (error) {
    console.error('Error getting face descriptor:', error);
    return null;
  }
};

let descriptorCache = new Map();

export const getCachedDescriptor = (key) => descriptorCache.get(key);
export const setCachedDescriptor = (key, descriptor) => {
  if (descriptorCache.size > 100) descriptorCache.clear();
  descriptorCache.set(key, descriptor);
};

// Quick single capture for fast registration
export const instantCapture = async (videoElement) => {
  if (!modelsLoaded) {
    await loadModels();
  }
  
  // Single attempt with optimized processing
  return await getFaceDescriptor(videoElement);
};

// Aggressive preloading for instant availability
export const preloadModels = async () => {
  if (modelsLoaded) return true;
  
  try {
    await loadModels();
    return true;
  } catch (error) {
    console.warn('Preload failed:', error);
    return false;
  }
};

// Start loading immediately when module loads
if (typeof window !== 'undefined') {
  setTimeout(() => preloadModels(), 100);
}