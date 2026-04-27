/**
 * @module constants
 * @description Single source of truth for all application constants.
 * Centralizes magic numbers, strings, collection names, analytics events,
 * and stage colors to eliminate duplication across the codebase.
 * @version 3.0.0
 * @author ElectIQ Team
 */
window.ElectIQ = window.ElectIQ || {};

window.ElectIQ.Constants = (function () {
  'use strict';

  /**
   * @description Total number of questions in the quiz
   * @type {number}
   * @example
   * const total = ElectIQ.Constants.QUIZ_TOTAL_QUESTIONS; // 5
   */
  const QUIZ_TOTAL_QUESTIONS = 5;

  /**
   * @description Maximum API requests allowed within the rate limit window
   * @type {number}
   */
  const RATE_LIMIT_MAX = 10;

  /**
   * @description Rate limit window duration in milliseconds (1 minute)
   * @type {number}
   */
  const RATE_LIMIT_WINDOW_MS = 60000;

  /**
   * @description Maximum allowed length for user text input
   * @type {number}
   */
  const MAX_INPUT_LENGTH = 500;

  /**
   * @description Maximum entries displayed on the leaderboard
   * @type {number}
   */
  const LEADERBOARD_SIZE = 10;

  /**
   * @description Current application version string
   * @type {string}
   */
  const APP_VERSION = '3.0.0';

  /**
   * @description Firestore collection name constants
   * @type {Object<string, string>}
   * @example
   * const col = ElectIQ.Constants.FIREBASE_COLLECTIONS.QUIZ_SCORES;
   */
  const FIREBASE_COLLECTIONS = {
    QUIZ_SCORES: 'quiz_scores',
    USER_PREFERENCES: 'user_preferences',
    FEEDBACK: 'feedback'
  };

  /**
   * @description Standardized analytics event name constants
   * @type {Object<string, string>}
   * @example
   * trackEvent(ElectIQ.Constants.ANALYTICS_EVENTS.PAGE_VIEW, {page: '/'});
   */
  const ANALYTICS_EVENTS = {
    PAGE_VIEW: 'page_view',
    QUIZ_STARTED: 'quiz_started',
    QUIZ_ANSWER_SELECTED: 'quiz_answer_selected',
    QUIZ_COMPLETED: 'quiz_completed',
    QUIZ_RETAKEN: 'quiz_retaken',
    AI_MESSAGE_SENT: 'ai_message_sent',
    AI_RESPONSE_RECEIVED: 'ai_response_received',
    GLOSSARY_SEARCHED: 'glossary_term_searched',
    GLOSSARY_LETTER_FILTER: 'glossary_letter_filter',
    TIMELINE_EXPANDED: 'timeline_stage_expanded',
    STEP_ACCORDION_TOGGLED: 'step_accordion_toggled',
    AUTH_INITIALIZED: 'auth_initialized',
    DARK_MODE_TOGGLED: 'dark_mode_toggled',
    LEADERBOARD_VIEWED: 'leaderboard_viewed',
    EXTERNAL_LINK_CLICKED: 'external_link_clicked'
  };

  /**
   * @description Color palette for each election timeline stage
   * @type {Object<string, string>}
   */
  const STAGE_COLORS = {
    registration: '#1565C0',
    primary: '#6A1B9A',
    campaign: '#E65100',
    voting: '#B71C1C',
    counting: '#00695C',
    certification: '#1B5E20',
    inauguration: '#F57F17'
  };

  return {
    QUIZ_TOTAL_QUESTIONS,
    RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS,
    MAX_INPUT_LENGTH,
    LEADERBOARD_SIZE,
    APP_VERSION,
    FIREBASE_COLLECTIONS,
    ANALYTICS_EVENTS,
    STAGE_COLORS
  };
})();
