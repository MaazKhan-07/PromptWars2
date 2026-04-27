/**
 * @module analytics
 * @description Central analytics dispatcher for ElectIQ. Uses Firebase Analytics
 * as the primary tracking layer with gtag (GA4) as a fallback. Provides a
 * unified trackEvent API and pre-built event helpers for all user interactions.
 * Never throws — analytics failures are always silently caught.
 * @version 3.0.0
 * @author ElectIQ Team
 */
window.ElectIQ = window.ElectIQ || {};

window.ElectIQ.Analytics = (function () {
  'use strict';

  /**
   * @description Central analytics event dispatcher. Fires to Firebase Analytics
   * (primary) and gtag (fallback). Attaches app_version and timestamp to every event.
   * @param {string} eventName - Snake_case event identifier (e.g. 'quiz_completed')
   * @param {Object} [params={}] - Event parameters (key-value pairs)
   * @returns {void}
   * @example
   * ElectIQ.Analytics.trackEvent('quiz_completed', { score: 4, total: 5 });
   */
  const trackEvent = (eventName, params = {}) => {
    try {
      const enrichedParams = {
        ...params,
        app_version: window.ElectIQ.Constants
          ? window.ElectIQ.Constants.APP_VERSION
          : '3.0.0',
        timestamp: Date.now()
      };

      // Firebase Analytics (primary)
      if (window.ElectIQ.Firebase && window.ElectIQ.Firebase.getAnalytics) {
        const fbAnalytics = window.ElectIQ.Firebase.getAnalytics();
        if (fbAnalytics && typeof fbAnalytics.logEvent === 'function') {
          fbAnalytics.logEvent(eventName, enrichedParams);
        }
      }

      // gtag fallback (GA4)
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, enrichedParams);
      }
    } catch (err) {
      console.debug('[ElectIQ Analytics] Skipped:', eventName);
    }
  };

  /**
   * @description Initializes GA4 tracking and fires the initial page_view event.
   * Also configures the gtag global if a measurement ID is available.
   * @returns {void}
   * @example
   * ElectIQ.Analytics.init();
   */
  const init = () => {
    try {
      const gaId = window.ElectIQ.Config?.api?.gaId || 'G-DEMO12345';

      window.dataLayer = window.dataLayer || [];
      if (typeof window.gtag !== 'function') {
        window.gtag = function () { window.dataLayer.push(arguments); };
      }
      window.gtag('js', new Date());
      window.gtag('config', gaId);

      // Fire page_view on every page load
      trackEvent('page_view', {
        page_title: document.title,
        page_path: window.location.pathname
      });
    } catch (err) {
      console.debug('[ElectIQ Analytics] Init skipped:', err.message);
    }
  };

  /**
   * @description Pre-built event helper methods for common user interactions.
   * Each method calls trackEvent with the appropriate event name and parameters.
   * @namespace
   */
  const events = {
    /**
     * @description Tracks quiz starting event
     * @returns {void}
     */
    quizStarted: () => trackEvent('quiz_started'),

    /**
     * @description Tracks quiz answer selection
     * @param {string} question - Question text
     * @param {string} answer - Selected answer
     * @param {boolean} correct - Whether the answer was correct
     * @returns {void}
     */
    quizAnswerSelected: (question, answer, correct) =>
      trackEvent('quiz_answer_selected', { question, answer, correct }),

    /**
     * @description Tracks quiz completion with score details
     * @param {number} score - Raw score
     * @param {number} percentage - Percentage score
     * @returns {void}
     */
    quizCompleted: (score, percentage) =>
      trackEvent('quiz_completed', { score, percentage }),

    /**
     * @description Tracks quiz retake action
     * @returns {void}
     */
    quizRetaken: () => trackEvent('quiz_retaken'),

    /**
     * @description Tracks AI chat message sent by user
     * @param {number} messageLength - Character count of the message
     * @returns {void}
     */
    aiMessageSent: (messageLength) =>
      trackEvent('ai_message_sent', { message_length: messageLength }),

    /**
     * @description Tracks AI response received
     * @param {number} responseLength - Character count of the response
     * @returns {void}
     */
    aiResponseReceived: (responseLength) =>
      trackEvent('ai_response_received', { response_length: responseLength }),

    /**
     * @description Tracks glossary search action
     * @param {string} query - Search query text
     * @returns {void}
     */
    glossarySearched: (query) =>
      trackEvent('glossary_term_searched', { query_length: query.length }),

    /**
     * @description Tracks glossary alphabetical filter
     * @param {string} letter - Filtered letter
     * @returns {void}
     */
    glossaryLetterFilter: (letter) =>
      trackEvent('glossary_letter_filter', { letter }),

    /**
     * @description Tracks timeline stage expansion
     * @param {string} stageName - Name of the expanded stage
     * @param {number} [stageIndex] - Numeric index of the stage
     * @returns {void}
     */
    timelineStageClicked: (stageName, stageIndex) =>
      trackEvent('timeline_stage_expanded', { stage_name: stageName, stage_index: stageIndex }),

    /**
     * @description Tracks step accordion toggle
     * @param {string} stepTitle - Title of the toggled step
     * @param {boolean} expanded - Whether the step was expanded
     * @returns {void}
     */
    stepExpanded: (stepTitle, expanded) =>
      trackEvent('step_accordion_toggled', { step_title: stepTitle, expanded }),

    /**
     * @description Tracks dark mode toggle
     * @param {boolean} enabled - Whether dark mode is now enabled
     * @returns {void}
     */
    darkModeToggled: (enabled) =>
      trackEvent('dark_mode_toggled', { enabled }),

    /**
     * @description Tracks auth initialization
     * @param {string} method - Authentication method used
     * @returns {void}
     */
    authInitialized: (method) =>
      trackEvent('auth_initialized', { method }),

    /**
     * @description Tracks leaderboard being viewed
     * @returns {void}
     */
    leaderboardViewed: () => trackEvent('leaderboard_viewed'),

    /**
     * @description Tracks external link click
     * @param {string} destination - The URL being navigated to
     * @returns {void}
     */
    externalLinkClicked: (destination) =>
      trackEvent('external_link_clicked', { destination })
  };

  return {
    init,
    trackEvent,
    events
  };
})();
