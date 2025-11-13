/**
 * Generate final prompt for logo generation
 * @param {string} userPrompt - User's brand concept description
 * @param {string} style - Selected logo style
 * @param {string[]} customColors - Optional custom color palette (hex codes)
 * @returns {string} - Complete prompt for API
 */
export const generateFinalPrompt = (userPrompt, style, customColors = null) => {
  let prompt = `A professional logo design for: ${userPrompt}. The style must be strictly ${style}. The final output must be a clean, scalable logo on a transparent or simple single-color background. Focus on icon and typography balance, and use solid colors. No photographic elements.`;

  if (customColors && customColors.length > 0) {
    prompt += ` Use these colors in the design: ${customColors.join(', ')}.`;
  }

  return prompt;
};
