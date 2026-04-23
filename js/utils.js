/**
 * @description Utility functions for the application
 * @namespace ElectIQ.Utils
 */
window.ElectIQ = window.ElectIQ || {};

window.ElectIQ.Utils = (function() {
  /**
   * @description Sanitize user input to prevent XSS
   * @param {string} input - The string to sanitize
   * @returns {string|null} - The sanitized string or null if empty
   * @example
   * Utils.sanitize("<script>alert(1)</script>") // => "alert(1)"
   */
  const sanitize = (input) => {
    if (!input || typeof input !== 'string') return null;
    const trimmed = input.trim();
    if (!trimmed) return null;
    
    // Limit length
    const limited = trimmed.substring(0, 500);
    
    // Use DOMParser to strip HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(limited, 'text/html');
    const clean = doc.body.textContent || "";
    
    return clean.replace(/[<>]/g, ''); // Extra safety
  };

  /**
   * @description Format a date string into a human-readable format
   * @param {string} dateStr - ISO date string
   * @returns {string} - Formatted date
   * @example
   * Utils.formatDate("2024-11-05") // => "November 5, 2024"
   */
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    try {
      // Handle special cases in timeline like "Tuesday after first Monday in Nov"
      if (isNaN(Date.parse(dateStr))) return dateStr;
      return new Date(dateStr).toLocaleDateString('en-US', options);
    } catch (e) {
      return dateStr;
    }
  };

  /**
   * @description Generate a random UUID
   * @returns {string} - Random UUID
   */
  const uuid = () => {
    return crypto.randomUUID();
  };

  /**
   * @description Debounce a function call
   * @param {Function} func - The function to debounce
   * @param {number} wait - Wait time in ms
   * @returns {Function} - Debounced function
   */
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  return {
    sanitize,
    formatDate,
    uuid,
    debounce
  };
})();
