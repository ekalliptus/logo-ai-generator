const HISTORY_KEY = 'logo_generator_history';
const MAX_HISTORY_ITEMS = 10;

/**
 * Save logo to history
 * @param {object} logoData - Logo data to save
 * @param {string} logoData.imageUrl - Base64 data URL
 * @param {string} logoData.prompt - User prompt
 * @param {string} logoData.style - Selected style
 * @param {string[]} logoData.customColors - Custom colors (optional)
 * @param {number} logoData.timestamp - Unix timestamp
 */
export function saveToHistory(logoData) {
  try {
    const history = getHistory();
    const newItem = {
      ...logoData,
      timestamp: Date.now(),
      id: `logo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Add to beginning of array and limit to MAX_HISTORY_ITEMS
    const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));

    return newItem;
  } catch (error) {
    console.error('Failed to save to history:', error);
    return null;
  }
}

/**
 * Get logo history
 * @returns {Array} - Array of logo history items
 */
export function getHistory() {
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Failed to get history:', error);
    return [];
  }
}

/**
 * Delete item from history
 * @param {string} id - Item ID to delete
 */
export function deleteFromHistory(id) {
  try {
    const history = getHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    return true;
  } catch (error) {
    console.error('Failed to delete from history:', error);
    return false;
  }
}

/**
 * Clear all history
 */
export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear history:', error);
    return false;
  }
}
