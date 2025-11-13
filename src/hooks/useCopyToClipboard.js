import { useState, useCallback } from 'react';

/**
 * Custom hook for copying text to clipboard
 * Uses modern Clipboard API with fallback to execCommand
 * @returns {object} - Copy function and state
 */
export function useCopyToClipboard() {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(async (text) => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        return true;
      }

      // Fallback to execCommand for older browsers
      const tempInput = document.createElement('textarea');
      tempInput.value = text;
      tempInput.style.position = 'fixed';
      tempInput.style.opacity = '0';
      document.body.appendChild(tempInput);
      tempInput.select();

      const success = document.execCommand('copy');
      document.body.removeChild(tempInput);

      if (success) {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        return true;
      }

      throw new Error('Copy command failed');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }, []);

  return {
    copyToClipboard,
    isCopied,
  };
}
