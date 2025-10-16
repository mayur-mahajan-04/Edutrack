import { useEffect } from 'react';
import { preloadModels } from '../utils/faceRecognition';

const ModelPreloader = () => {
  useEffect(() => {
    // Immediate aggressive preloading
    const loadModels = async () => {
      try {
        await preloadModels();
        console.log('Models ready for instant capture');
      } catch (error) {
        console.warn('Model preload failed:', error);
      }
    };

    // Start immediately - no delay
    loadModels();
  }, []);

  return null;
};

export default ModelPreloader;