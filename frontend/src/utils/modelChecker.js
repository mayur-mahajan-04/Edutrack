// Utility to check if face recognition models are available
export const checkModelsAvailability = async () => {
  const models = [
    '/models/ssd_mobilenetv1_model-weights_manifest.json',
    '/models/face_landmark_68_model-weights_manifest.json', 
    '/models/face_recognition_model-weights_manifest.json'
  ];

  const results = await Promise.allSettled(
    models.map(async (model) => {
      try {
        const response = await fetch(model);
        return { model, available: response.ok };
      } catch (error) {
        return { model, available: false };
      }
    })
  );

  const availability = results.map(result => result.value);
  const allAvailable = availability.every(item => item.available);
  
  return {
    allAvailable,
    models: availability
  };
};

export const getModelDownloadInstructions = () => {
  return {
    message: "Face recognition models are required for face verification.",
    instructions: [
      "1. Download the following models from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights",
      "2. Place them in the 'frontend/public/models/' directory:",
      "   - ssd_mobilenetv1_model-weights_manifest.json",
      "   - ssd_mobilenetv1_model-shard1",
      "   - face_landmark_68_model-weights_manifest.json", 
      "   - face_landmark_68_model-shard1",
      "   - face_recognition_model-weights_manifest.json",
      "   - face_recognition_model-shard1",
      "3. Refresh the page after downloading the models."
    ]
  };
};