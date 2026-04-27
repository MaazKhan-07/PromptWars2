/**
 * @module config
 * @description Configuration service for the ElectIQ application.
 * Reads environment variables from window.ENV and provides safe defaults.
 * Centralizes all API keys, Firebase config, and feature flag settings.
 * @version 3.0.0
 * @author ElectIQ Team
 */
window.ElectIQ = window.ElectIQ || {};

window.ElectIQ.Config = (function () {
  'use strict';

  return {
    /**
     * @description API keys and service configuration from environment variables.
     * All values fall back to safe demo defaults when ENV is not configured.
     * @type {Object}
     * @example
     * const apiKey = ElectIQ.Config.api.anthropic;
     */
    api: {
      anthropic: window.ENV?.ANTHROPIC_API_KEY || '',
      firebase: {
        apiKey: window.ENV?.FIREBASE_API_KEY || 'demo-key',
        authDomain: window.ENV?.FIREBASE_AUTH_DOMAIN || 'electiq.firebaseapp.com',
        projectId: window.ENV?.FIREBASE_PROJECT_ID || 'electiq-demo',
        storageBucket: window.ENV?.FIREBASE_STORAGE || 'electiq-demo.appspot.com',
        messagingSenderId: window.ENV?.FIREBASE_MSG_ID || '000000000000',
        appId: window.ENV?.FIREBASE_APP_ID || '1:000:web:000',
        measurementId: window.ENV?.GA_MEASUREMENT_ID || 'G-DEMO12345'
      },
      googleMaps: window.ENV?.GOOGLE_MAPS_API_KEY || '',
      gaId: window.ENV?.GA_MEASUREMENT_ID || 'G-DEMO12345'
    },

    /**
     * @description Feature flags, rate limits, and application settings.
     * @type {Object}
     * @example
     * const maxLen = ElectIQ.Config.settings.maxInputLength; // 500
     */
    settings: {
      chatRateLimit: 10,
      chatRateLimitWindow: 60000,
      maxInputLength: 500,
      leaderboardSize: 10,
      appVersion: '3.0.0'
    }
  };
})();
