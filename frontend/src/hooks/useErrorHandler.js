import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((error, showToast = true) => {
    console.error('Error occurred:', error);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      // Server responded with error status
      errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.message) {
      // Something else happened
      errorMessage = error.message;
    }
    
    setError(errorMessage);
    
    if (showToast) {
      toast.error(errorMessage);
    }
    
    return errorMessage;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeAsync = useCallback(async (asyncFunction, showToast = true) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await asyncFunction();
      return result;
    } catch (error) {
      const errorMessage = handleError(error, showToast);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    executeAsync
  };
};