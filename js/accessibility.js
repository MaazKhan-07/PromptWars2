/**
 * @module accessibility
 * @description Accessibility helper service for focus management, screen reader
 * announcements, and keyboard navigation support. Ensures WCAG 2.1 AA compliance
 * across all interactive components in the ElectIQ application.
 * @version 3.0.0
 * @author ElectIQ Team
 */
window.ElectIQ = window.ElectIQ || {};

window.ElectIQ.Accessibility = (function () {
  'use strict';

  /**
   * @description Queries all focusable elements within a given container.
   * Includes buttons, links, inputs, selects, textareas, and custom tabindex elements.
   * @param {HTMLElement} container - The DOM container to search within
   * @returns {NodeList} List of focusable child elements
   * @example
   * const focusable = getFocusableElements(modalEl);
   * focusable[0].focus();
   */
  const getFocusableElements = (container) => {
    return container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  };

  /**
   * @description Traps keyboard focus within a modal or dialog component.
   * When Tab reaches the last focusable element, it wraps to the first,
   * and vice versa with Shift+Tab.
   * @param {HTMLElement} container - The container to trap focus within
   * @param {KeyboardEvent} event - The keydown event to intercept
   * @returns {void}
   * @example
   * modal.addEventListener('keydown', (e) => trapFocus(modal, e));
   */
  const trapFocus = (container, event) => {
    if (event.key !== 'Tab') {
      return;
    }

    const focusable = getFocusableElements(container);
    if (focusable.length === 0) {
      return;
    }

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
   * @description Announces text content to screen readers via an aria-live region.
   * Creates the announcer element on first use and resets it between announcements.
   * @param {string} text - The message to announce
   * @param {string} [priority='polite'] - aria-live priority ('polite' or 'assertive')
   * @returns {void}
   * @example
   * announceToScreenReader('Quiz completed! You scored 4 out of 5.');
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
   * @description Initializes the skip-to-content link for keyboard navigation.
   * Intercepts the click to programmatically focus the main content area.
   * @returns {void}
   * @example
   * ElectIQ.Accessibility.initSkipLink();
   */
  const initSkipLink = () => {
    const skipLink = document.querySelector('.skip-link');
    if (!skipLink) {
      return;
    }

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
