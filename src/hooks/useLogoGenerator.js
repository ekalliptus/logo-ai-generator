import { useState, useCallback } from 'react';
import { generateLogos } from '../utils/apiClient';
import { generateFinalPrompt } from '../utils/promptBuilder';

/**
 * Custom hook for logo generation
 * @returns {object} - Logo generation state and function
 */
export function useLogoGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);

  const generateLogo = useCallback(async (userPrompt, style, customColors = null) => {
    // Validation
    if (!userPrompt || !userPrompt.trim()) {
      setError('Please describe your brand concept to generate a logo.');
      return null;
    }

    setIsLoading(true);
    setError(null);
    setImageUrls([]);

    try {
      // Build the final prompt
      const finalPrompt = generateFinalPrompt(userPrompt, style, customColors);

      // Call API to generate logos
      const base64Images = await generateLogos(finalPrompt);

      // Convert base64 to data URLs
      const dataUrls = base64Images.map(base64 => `data:image/png;base64,${base64}`);

      setImageUrls(dataUrls);
      setIsLoading(false);

      return {
        imageUrls: dataUrls,
        prompt: userPrompt,
        style,
        customColors,
      };
    } catch (err) {
      console.error('Logo Generation Error:', err);
      setError(`Failed to generate logo. ${err.message}. Please check your prompt and try again.`);
      setIsLoading(false);
      return null;
    }
  }, []);

  const clearImages = useCallback(() => {
    setImageUrls([]);
    setError(null);
  }, []);

  return {
    generateLogo,
    clearImages,
    isLoading,
    error,
    imageUrls,
  };
}
