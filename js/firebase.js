/**
 * @module firebase
 * @description Firebase service integration hub. Initializes and manages
 * Firebase Authentication (anonymous), Firestore (data persistence),
 * and Analytics (event tracking) services. Provides graceful degradation
 * when Firebase is unavailable (demo/offline mode).
 * @version 3.0.0
 * @author ElectIQ Team
 */
window.ElectIQ = window.ElectIQ || {};

window.ElectIQ.Firebase = (function () {
  'use strict';

  /** @type {Object|null} Firestore database instance */
  let db = null;
  /** @type {Object|null} Firebase Auth instance */
  let authInstance = null;
  /** @type {Object|null} Firebase Analytics instance */
  let analyticsInstance = null;
  /** @type {boolean} Whether Firebase has been successfully initialized */
  let initialized = false;

  /**
   * @description Firebase project configuration. Reads from window.ENV
   * with safe demo-mode fallbacks for offline/preview deployments.
   * @type {Object}
   */
  const firebaseConfig = {
    apiKey: window.ENV?.FIREBASE_API_KEY || 'demo-mode',
    authDomain: window.ENV?.FIREBASE_AUTH_DOMAIN || 'electiq.firebaseapp.com',
    projectId: window.ENV?.FIREBASE_PROJECT_ID || 'electiq-demo',
    storageBucket: window.ENV?.FIREBASE_STORAGE || 'electiq-demo.appspot.com',
    messagingSenderId: window.ENV?.FIREBASE_MSG_ID || '000000000000',
    appId: window.ENV?.FIREBASE_APP_ID || '1:000:web:000',
    measurementId: window.ENV?.GA_MEASUREMENT_ID || 'G-DEMO12345'
  };

  /**
   * @description Initializes all Firebase services (App, Auth, Firestore, Analytics).
   * Sets up connection indicators and prepares services for use.
   * @returns {Promise<boolean>} True if initialization succeeded
   * @example
   * const success = await ElectIQ.Firebase.init();
   */
  const init = async () => {
    if (initialized) {
      return true;
    }

    if (typeof window.firebase === 'undefined') {
      console.warn('[ElectIQ Firebase] Firebase SDK not loaded — running in demo mode.');
      return false;
    }

    try {
      // Initialize Firebase App
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(firebaseConfig);
      }

      // Initialize Firestore
      db = window.firebase.firestore();

      // Initialize Firebase Auth
      if (window.firebase.auth) {
        authInstance = window.firebase.auth();
      }

      // Initialize Firebase Analytics
      if (window.firebase.analytics) {
        try {
          analyticsInstance = window.firebase.analytics();
        } catch (analyticsErr) {
          console.debug('[ElectIQ Firebase] Analytics init skipped:', analyticsErr.message);
        }
      }

      // Update connection indicator
      const indicator = document.getElementById('firebaseStatus');
      if (indicator) {
        indicator.style.backgroundColor = '#4CAF50';
        indicator.title = 'Connected to Firebase';
      }

      initialized = true;
      return true;
    } catch (error) {
      console.error('[ElectIQ Firebase] Initialization error:', error.message);
      return false;
    }
  };

  /**
   * @description Performs anonymous sign-in via Firebase Authentication.
   * Persists userId in sessionStorage for cross-page continuity.
   * Falls back to a crypto-generated demo ID when Firebase is unavailable.
   * @returns {Promise<string>} Firebase UID or demo fallback ID
   * @example
   * const uid = await ElectIQ.Firebase.initAuth();
   * console.log('User ID:', uid);
   */
  const initAuth = async () => {
    try {
      if (authInstance) {
        const credential = await authInstance.signInAnonymously();
        const uid = credential.user.uid;
        sessionStorage.setItem('electiq_uid', uid);
        sessionStorage.setItem('electiq_auth_time', Date.now().toString());

        // Update auth UI badge
        updateAuthBadge('Session Active', true);

        // Track auth event
        if (window.ElectIQ.Analytics) {
          window.ElectIQ.Analytics.trackEvent(
            window.ElectIQ.Constants.ANALYTICS_EVENTS.AUTH_INITIALIZED,
            { method: 'anonymous' }
          );
        }

        return uid;
      }
    } catch (err) {
      console.warn('[ElectIQ Auth] Anonymous sign-in failed, using demo mode:', err.message);
    }

    // Fallback: generate demo session ID
    const fallbackId = 'demo-' + crypto.randomUUID();
    sessionStorage.setItem('electiq_uid', fallbackId);
    sessionStorage.setItem('electiq_auth_time', Date.now().toString());
    updateAuthBadge('Session Active', true);
    return fallbackId;
  };

  /**
   * @description Updates the auth status badge in the navbar.
   * @param {string} text - Display text for the badge
   * @param {boolean} active - Whether the session is active
   * @returns {void}
   * @example
   * updateAuthBadge('Session Active', true);
   */
  const updateAuthBadge = (text, active) => {
    const badge = document.getElementById('auth-status');
    if (badge) {
      badge.textContent = text;
      badge.className = active ? 'auth-badge auth-active' : 'auth-badge';
      badge.setAttribute('aria-label', active ? 'Authenticated session active' : 'Session connecting');
    }
  };

  /**
   * @description Saves a quiz result document to the Firestore quiz_scores collection.
   * Includes user ID, score, total, percentage, and server timestamp.
   * @param {Object} result - Quiz result data
   * @param {number} result.score - Raw score achieved
   * @param {number} result.totalQuestions - Total questions in quiz
   * @param {number} result.percentage - Score as percentage (0-100)
   * @returns {Promise<void>}
   * @example
   * await ElectIQ.Firebase.saveQuizScore({ score: 4, totalQuestions: 5, percentage: 80 });
   */
  const saveQuizScore = async (result) => {
    if (!db) {
      return;
    }
    try {
      const uid = sessionStorage.getItem('electiq_uid') || 'anon-' + crypto.randomUUID();
      const collectionName = window.ElectIQ.Constants.FIREBASE_COLLECTIONS.QUIZ_SCORES;
      await db.collection(collectionName).add({
        ...result,
        uid: uid,
        timestamp: window.firebase.firestore.FieldValue.serverTimestamp(),
        sessionId: uid
      });
    } catch (error) {
      console.warn('[ElectIQ Firestore] Error saving score:', error.message);
    }
  };

  /**
   * @description Retrieves the top scores from Firestore for leaderboard display.
   * Returns up to LEADERBOARD_SIZE entries sorted by percentage descending.
   * @returns {Promise<Array<Object>>} Array of score document data objects
   * @example
   * const scores = await ElectIQ.Firebase.getLeaderboard();
   * scores.forEach(s => console.log(s.percentage));
   */
  const getLeaderboard = async () => {
    if (!db) {
      return [];
    }
    try {
      const collectionName = window.ElectIQ.Constants.FIREBASE_COLLECTIONS.QUIZ_SCORES;
      const size = window.ElectIQ.Constants.LEADERBOARD_SIZE;
      const snapshot = await db.collection(collectionName)
        .orderBy('percentage', 'desc')
        .limit(size)
        .get();

      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.warn('[ElectIQ Firestore] Error fetching leaderboard:', error.message);
      return [];
    }
  };

  /**
   * @description Returns the Firestore database instance for direct access.
   * Used by the Storage module for user preference persistence.
   * @returns {Object|null} Firestore db instance or null
   * @example
   * const db = ElectIQ.Firebase.getFirestore();
   */
  const getFirestore = () => db;

  /**
   * @description Returns the Firebase Analytics instance for event logging.
   * @returns {Object|null} Analytics instance or null
   * @example
   * const analytics = ElectIQ.Firebase.getAnalytics();
   */
  const getAnalytics = () => analyticsInstance;

  /**
   * @description Returns the Firebase Auth instance.
   * @returns {Object|null} Auth instance or null
   * @example
   * const auth = ElectIQ.Firebase.getAuth();
   */
  const getAuth = () => authInstance;

  return {
    init,
    initAuth,
    saveQuizScore,
    getLeaderboard,
    getFirestore,
    getAnalytics,
    getAuth,
    updateAuthBadge
  };
})();
