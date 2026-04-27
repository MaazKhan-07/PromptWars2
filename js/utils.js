/**
 * @module utils
 * @description Utility functions for input sanitization, date formatting,
 * UUID generation, and function debouncing. Used across all ElectIQ modules.
 * @version 3.0.0
 * @author ElectIQ Team
 */
window.ElectIQ = window.ElectIQ || {};

window.ElectIQ.Utils = (function () {
  'use strict';

  /**
   * @description Sanitizes user input to prevent XSS attacks.
   * Trims whitespace, strips HTML tags via DOMParser, limits length,
   * and removes any remaining angle brackets.
   * @param {string} input - The raw string to sanitize
   * @returns {string|null} The cleaned string, or null if empty/invalid
   * @example
   * Utils.sanitize('<script>alert(1)</script>'); // => 'alert(1)'
   * Utils.sanitize('  hello world  ');           // => 'hello world'
   * Utils.sanitize('');                           // => null
   */
  const sanitize = (input) => {
    if (!input || typeof input !== 'string') {
      return null;
    }
    const trimmed = input.trim();
    if (!trimmed) {
      return null;
    }

    // Limit length
    const limited = trimmed.substring(0, 500);

    // Use DOMParser to strip HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(limited, 'text/html');
    const clean = doc.body.textContent || '';

    return clean.replace(/[<>]/g, ''); // Extra safety
  };

  /**
   * @description Formats an ISO date string into a human-readable US locale format.
   * Returns the original string if the input is not a valid parseable date.
   * @param {string} dateStr - ISO date string or descriptive date text
   * @returns {string} Formatted date string (e.g. 'November 5, 2024')
   * @example
   * Utils.formatDate('2024-11-05');           // => 'November 5, 2024'
   * Utils.formatDate('January 20');           // => 'January 20'
   */
  const formatDate = (dateStr) => {
    if (!dateStr) {
      return '';
    }
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    try {
      if (isNaN(Date.parse(dateStr))) {
        return dateStr;
      }
      return new Date(dateStr).toLocaleDateString('en-US', options);
    } catch (e) {
      return dateStr;
    }
  };

  /**
   * @description Generates a cryptographically random UUID v4.
   * @returns {string} UUID string (e.g. '550e8400-e29b-41d4-a716-446655440000')
   * @example
   * const id = Utils.uuid(); // '7c7b05f1-...'
   */
  const uuid = () => {
    return crypto.randomUUID();
  };

  /**
   * @description Creates a debounced version of a function that delays invocation
   * until after the specified wait period has elapsed since the last call.
   * @param {Function} func - The function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced wrapper function
   * @example
   * const debouncedSearch = Utils.debounce(search, 300);
   * inputEl.addEventListener('input', debouncedSearch);
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
