import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export const loadModels = async () => {
  if (modelsLoaded) return;
  
  try {
    const MODEL_URL = '/models';
    
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    
    modelsLoaded = true;
    console.log('Face recognition models loaded successfully');
  } catch (error) {
    console.warn('Local models not found, trying CDN...');
    try {
      const CDN_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
      
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(CDN_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(CDN_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(CDN_URL)
      ]);
      
      modelsLoaded = true;
      console.log('Face recognition models loaded from CDN');
    } catch (cdnError) {
      console.error('Failed to load models from CDN:', cdnError);
      modelsLoaded = false;
      throw new Error('Face recognition models not available');
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
        minConfidence: 0.3,
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

export const fastCaptureDescriptors = async (videoElement, count = 5) => {
  const descriptors = [];
  const promises = [];
  
  for (let i = 0; i < count; i++) {
    promises.push(
      new Promise(async (resolve) => {
        await new Promise(r => setTimeout(r, i * 200));
        const desc = await getFaceDescriptor(videoElement);
        resolve(desc);
      })
    );
  }
  
  const results = await Promise.all(promises);
  return results.filter(desc => desc && desc.length === 128);
};

export const getFaceDescriptor = async (videoElement) => {
  try {
    if (!modelsLoaded) {
      try {
        await loadModels();
      } catch (error) {
        console.warn('Face recognition disabled - models not available');
        return null;
      }
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Reduce canvas size for faster processing
    const scale = 0.5;
    canvas.width = (videoElement.videoWidth || 320) * scale;
    canvas.height = (videoElement.videoHeight || 240) * scale;
    
    ctx.scale(scale, scale);
    ctx.drawImage(videoElement, 0, 0);
    
    const detection = await detectFace(canvas);
    
    if (detection && detection.descriptor) {
      return Array.from(detection.descriptor);
    }
    
    return null;
    
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

// Benchmark sequential captures to measure latency and stability
export const benchmarkCapture = async (videoElement, count = 10) => {
  const timesMs = [];
  const descriptors = [];
  for (let i = 0; i < count; i++) {
    const t0 = performance.now();
    const desc = await getFaceDescriptor(videoElement);
    const t1 = performance.now();
    timesMs.push(t1 - t0);
    if (desc && desc.length === 128) descriptors.push(desc);
    // small spacing to avoid hammering
    await new Promise((r) => setTimeout(r, 100));
  }
  return { descriptors, timesMs };
};