/**
 * @description Configuration service for the application
 * @namespace ElectIQ.Config
 */
window.ElectIQ = window.ElectIQ || {};

window.ElectIQ.Config = (function() {
  return {
    /**
     * @description API keys and service IDs from environment
     */
    api: {
      anthropic: window.ENV?.ANTHROPIC_API_KEY || "",
      firebase: {
        apiKey: window.ENV?.FIREBASE_API_KEY || "demo-key",
        authDomain: window.ENV?.FIREBASE_AUTH_DOMAIN || "electiq.firebaseapp.com",
        projectId: window.ENV?.FIREBASE_PROJECT_ID || "electiq-demo",
      },
      googleMaps: window.ENV?.GOOGLE_MAPS_API_KEY || "",
      gaId: window.ENV?.GA_MEASUREMENT_ID || "G-DEMO12345"
    },
    
    /**
     * @description Feature flags and limits
     */
    settings: {
      chatRateLimit: 10,
      chatRateLimitWindow: 60000, // 1 minute
      maxInputLength: 500
    }
  };
})();
