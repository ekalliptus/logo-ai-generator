import { API_CONFIG } from '../config/api';

// Backend API URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Fetch with exponential backoff retry logic
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @param {number} retries - Number of retry attempts
 * @returns {Promise<Response>}
 */
export async function fetchWithRetry(url, options, retries = API_CONFIG.retryAttempts) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);

      // If not rate limited and response is ok, return it
      if (response.status !== 429 && response.ok) {
        return response;
      }

      // Handle rate limiting with exponential backoff
      if (response.status === 429) {
        const delay = Math.pow(2, i) * API_CONFIG.retryDelay + (Math.random() * 1000);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Return for non-429 errors (will be handled by caller)
      return response;
    } catch (error) {
      // If this is the last retry, throw the error
      if (i === retries - 1) throw error;

      // Wait with exponential backoff before retrying
      const delay = Math.pow(2, i) * API_CONFIG.retryDelay + (Math.random() * 500);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Call backend API to generate logos
 * @param {string} prompt - The generated prompt
 * @param {number} sampleCount - Number of logo variations to generate
 * @returns {Promise<string[]>} - Array of base64 encoded images
 */
export async function generateLogos(prompt, sampleCount = API_CONFIG.sampleCount) {
  const url = `${BACKEND_URL}/api/generate-logos`;

  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, sampleCount }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `API call failed with status: ${response.status}`);
  }

  const result = await response.json();
  const images = result?.images || [];

  if (images.length === 0) {
    throw new Error("Generation failed: No image data returned from the API.");
  }

  return images;
}
