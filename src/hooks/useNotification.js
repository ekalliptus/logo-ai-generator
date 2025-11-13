import { useState, useCallback } from 'react';
import { MESSAGE_TYPES } from '../utils/constants';

/**
 * Custom hook for managing notification messages
 * @returns {object} - Notification state and control functions
 */
export function useNotification() {
  const [message, setMessage] = useState(null);

  const showMessage = useCallback((text, type = MESSAGE_TYPES.INFO) => {
    setMessage({ text, type });
  }, []);

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  const showError = useCallback((text) => {
    showMessage(text, MESSAGE_TYPES.ERROR);
  }, [showMessage]);

  const showSuccess = useCallback((text) => {
    showMessage(text, MESSAGE_TYPES.SUCCESS);
  }, [showMessage]);

  const showInfo = useCallback((text) => {
    showMessage(text, MESSAGE_TYPES.INFO);
  }, [showMessage]);

  const showWarning = useCallback((text) => {
    showMessage(text, 'warning');
  }, [showMessage]);

  return {
    message,
    showMessage,
    showError,
    showSuccess,
    showInfo,
    showWarning,
    clearMessage,
  };
}
