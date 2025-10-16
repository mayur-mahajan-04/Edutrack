# Face Recognition Models

This directory should contain the face-api.js models for face recognition functionality.

## Required Files:

Download these files from the face-api.js repository and place them in this directory:

1. **ssd_mobilenetv1_model-weights_manifest.json**
2. **ssd_mobilenetv1_model-shard1**
3. **face_landmark_68_model-weights_manifest.json**
4. **face_landmark_68_model-shard1**
5. **face_recognition_model-weights_manifest.json**
6. **face_recognition_model-shard1**

## Download Links:

You can download these files from:
https://github.com/justadudewhohacks/face-api.js/tree/master/weights

## Alternative: Use CDN (for development)

If you don't want to download the models locally, you can modify the `loadModels` function in `src/utils/faceRecognition.js` to use CDN:

```javascript
const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
```

## Note:

- The system will work without these models but face recognition will be disabled
- Users can still register and use the system with QR code attendance
- Total model size is approximately 6MB
- Models are loaded once and cached in memory

## File Structure:
```
models/
├── ssd_mobilenetv1_model-weights_manifest.json
├── ssd_mobilenetv1_model-shard1
├── face_landmark_68_model-weights_manifest.json
├── face_landmark_68_model-shard1
├── face_recognition_model-weights_manifest.json
└── face_recognition_model-shard1
```