/**
 * @description Accessibility helper service for focus management and announcements
 * @namespace ElectIQ.Accessibility
 */
window.ElectIQ = window.ElectIQ || {};

window.ElectIQ.Accessibility = (function() {
  /**
   * @description Get all focusable elements within a container
   * @param {HTMLElement} container - The container to search
   * @returns {NodeList} - List of focusable elements
   */
  const getFocusableElements = (container) => {
    return container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  };

  /**
   * @description Trap focus within a modal or component
   * @param {HTMLElement} container - The container to trap focus in
   * @param {KeyboardEvent} event - The keydown event
   */
  const trapFocus = (container, event) => {
    if (event.key !== 'Tab') return;

    const focusable = getFocusableElements(container);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  /**
   * @description Announce text to screen readers via aria-live region
   * @param {string} text - Message to announce
   * @param {string} [priority='polite'] - aria-live priority
   */
  const announceToScreenReader = (text, priority = 'polite') => {
    let announcer = document.getElementById('sr-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'sr-announcer';
      announcer.className = 'sr-only';
      announcer.setAttribute('aria-live', priority);
      document.body.appendChild(announcer);
    }
    announcer.textContent = '';
    setTimeout(() => {
      announcer.textContent = text;
    }, 100);
  };

  /**
   * @description Handle skip link navigation
   */
  const initSkipLink = () => {
    const skipLink = document.querySelector('.skip-link');
    if (!skipLink) return;

    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(skipLink.getAttribute('href'));
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus();
      }
    });
  };

  return {
    initSkipLink,
    getFocusableElements,
    trapFocus,
    announceToScreenReader
  };
})();
