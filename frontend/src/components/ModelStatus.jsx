import React, { useState, useEffect } from 'react';
import { Alert, Button, Dialog, DialogTitle, DialogContent, Typography, List, ListItem, ListItemText } from '@mui/material';
import { checkModelsAvailability, getModelDownloadInstructions } from '../utils/modelChecker';

const ModelStatus = () => {
  const [modelsAvailable, setModelsAvailable] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkModels();
  }, []);

  const checkModels = async () => {
    try {
      const { allAvailable } = await checkModelsAvailability();
      setModelsAvailable(allAvailable);
    } catch (error) {
      setModelsAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading || modelsAvailable) {
    return null;
  }

  const instructions = getModelDownloadInstructions();

  return (
    <>
      <Alert 
        severity="warning" 
        sx={{ mb: 2 }}
        action={
          <Button 
            color="inherit" 
            size="small" 
            onClick={() => setShowInstructions(true)}
          >
            Instructions
          </Button>
        }
      >
        Face recognition models not found. Face verification will not work.
      </Alert>

      <Dialog open={showInstructions} onClose={() => setShowInstructions(false)} maxWidth="md">
        <DialogTitle>Face Recognition Model Setup</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {instructions.message}
          </Typography>
          <List>
            {instructions.instructions.map((instruction, index) => (
              <ListItem key={index}>
                <ListItemText primary={instruction} />
              </ListItem>
            ))}
          </List>
          <Button 
            variant="contained" 
            onClick={checkModels}
            sx={{ mt: 2 }}
          >
            Check Again
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModelStatus;