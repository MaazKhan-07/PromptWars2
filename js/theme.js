/**
 * @module theme
 * @description Dark mode and theme persistence service for ElectIQ.
 * Manages toggle state, updates UI elements (buttons, ARIA attributes),
 * persists preference to localStorage and Firestore via Storage module.
 * @version 3.0.0
 * @author ElectIQ Team
 */
window.ElectIQ = window.ElectIQ || {};

window.ElectIQ.Theme = (function () {
  'use strict';

  /**
   * @description Toggles between light and dark mode. Updates the DOM,
   * persists preference, fires analytics event, and saves to Firestore.
   * @returns {void}
   * @example
   * ElectIQ.Theme.toggle();
   */
  const toggle = () => {
    const body = document.body;
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    updateUI(isDark);

    // Track analytics event
    if (window.ElectIQ.Analytics) {
      window.ElectIQ.Analytics.events.darkModeToggled(isDark);
    }

    // Save to Firestore user preferences
    if (window.ElectIQ.Storage) {
      window.ElectIQ.Storage.saveDarkMode(isDark);
    }
  };

  /**
   * @description Updates all toggle buttons and their ARIA states
   * to reflect the current theme mode.
   * @param {boolean} isDark - Whether dark mode is currently active
   * @returns {void}
   * @example
   * updateUI(true); // Sets icons to sun and labels to "Switch to light mode"
   */
  const updateUI = (isDark) => {
    const darkToggle = document.getElementById('darkToggle');
    const darkToggleMobile = document.getElementById('darkToggleMobile');
    const icon = isDark ? '☀️' : '🌙';

    if (darkToggle) {
      darkToggle.textContent = icon;
      darkToggle.setAttribute('aria-pressed', isDark);
      darkToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }

    if (darkToggleMobile) {
      darkToggleMobile.textContent = `${icon} ${isDark ? 'Light' : 'Dark'} Mode`;
      darkToggleMobile.setAttribute('aria-pressed', isDark);
    }
  };

  /**
   * @description Initializes theme from localStorage on page load.
   * Attaches click handlers to both desktop and mobile toggle buttons.
   * @returns {void}
   * @example
   * ElectIQ.Theme.init();
   */
  const init = () => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark';

    if (isDark) {
      document.body.classList.add('dark-mode');
    }

    updateUI(isDark);

    const darkToggle = document.getElementById('darkToggle');
    const darkToggleMobile = document.getElementById('darkToggleMobile');

    if (darkToggle) {
      darkToggle.addEventListener('click', toggle);
    }
    if (darkToggleMobile) {
      darkToggleMobile.addEventListener('click', toggle);
    }
  };

  return {
    init,
    toggle
  };
})();
