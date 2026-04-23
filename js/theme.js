/**
 * @description Dark mode and theme persistence service
 * @namespace ElectIQ.Theme
 */
window.ElectIQ = window.ElectIQ || {};

window.ElectIQ.Theme = (function() {
  /**
   * @description Toggle between light and dark mode
   */
  const toggle = () => {
    const body = document.body;
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    updateUI(isDark);
    
    // Track event
    if (window.ElectIQ.Analytics) {
      window.ElectIQ.Analytics.events.darkModeToggled(isDark);
    }
  };

  /**
   * @description Update buttons and ARIA states
   * @param {boolean} isDark - Current theme state
   */
  const updateUI = (isDark) => {
    const darkToggle = document.getElementById('darkToggle');
    const darkToggleMobile = document.getElementById('darkToggleMobile');
    const icon = isDark ? '☀️' : '🌙';
    
    if (darkToggle) {
      darkToggle.textContent = icon;
      darkToggle.setAttribute('aria-pressed', isDark);
      darkToggle.setAttribute('aria-label', isDark ? "Switch to light mode" : "Switch to dark mode");
    }
    
    if (darkToggleMobile) {
      darkToggleMobile.textContent = `${icon} ${isDark ? 'Light' : 'Dark'} Mode`;
      darkToggleMobile.setAttribute('aria-pressed', isDark);
    }
  };

  /**
   * @description Initialize theme from localStorage
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
    
    if (darkToggle) darkToggle.addEventListener('click', toggle);
    if (darkToggleMobile) darkToggleMobile.addEventListener('click', toggle);
  };

  return {
    init,
    toggle
  };
})();
