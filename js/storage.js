/**
 * @module storage
 * @description User preferences persistence layer using Firebase Firestore
 * with automatic localStorage fallback. Provides cross-session learning
 * progress tracking, quiz history, and UI preference storage.
 * @version 3.0.0
 * @author ElectIQ Team
 */
window.ElectIQ = window.ElectIQ || {};

window.ElectIQ.Storage = (function () {
  'use strict';

  const STORAGE_KEY = 'electiq_prefs';

  /**
   * @description Saves user preferences to Firestore with localStorage fallback.
   * Uses merge mode so partial updates don't overwrite existing fields.
   * @param {string} uid - Firebase anonymous user ID
   * @param {Object} preferences - User settings and history to persist
   * @returns {Promise<void>}
   * @example
   * await ElectIQ.Storage.savePreferences('uid-123', { darkMode: true });
   */
  const savePreferences = async (uid, preferences) => {
    try {
      if (window.ElectIQ.Firebase && window.ElectIQ.Firebase.getFirestore) {
        const db = window.ElectIQ.Firebase.getFirestore();
        if (db && typeof db.collection === 'function') {
          const collectionName = window.ElectIQ.Constants.FIREBASE_COLLECTIONS.USER_PREFERENCES;
          await db.collection(collectionName).doc(uid).set({
            ...preferences,
            lastUpdated: window.firebase && window.firebase.firestore
              ? window.firebase.firestore.FieldValue.serverTimestamp()
              : new Date().toISOString()
          }, { merge: true });
          return;
        }
      }
    } catch (err) {
      console.debug('[ElectIQ Storage] Firestore write fallback:', err.message);
    }

    // Fallback to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const merged = { ...existing, ...preferences, lastUpdated: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch (localErr) {
      console.debug('[ElectIQ Storage] localStorage fallback failed:', localErr.message);
    }
  };

  /**
   * @description Loads user preferences from Firestore with localStorage fallback.
   * Returns an empty object if no preferences are found anywhere.
   * @param {string} uid - Firebase anonymous user ID
   * @returns {Promise<Object>} User preferences object
   * @example
   * const prefs = await ElectIQ.Storage.loadPreferences('uid-123');
   * console.log(prefs.darkMode); // true
   */
  const loadPreferences = async (uid) => {
    try {
      if (window.ElectIQ.Firebase && window.ElectIQ.Firebase.getFirestore) {
        const db = window.ElectIQ.Firebase.getFirestore();
        if (db && typeof db.collection === 'function') {
          const collectionName = window.ElectIQ.Constants.FIREBASE_COLLECTIONS.USER_PREFERENCES;
          const docSnap = await db.collection(collectionName).doc(uid).get();
          if (docSnap.exists) {
            return docSnap.data();
          }
        }
      }
    } catch (err) {
      console.debug('[ElectIQ Storage] Firestore read fallback:', err.message);
    }

    // Fallback to localStorage
    try {
      const local = localStorage.getItem(STORAGE_KEY);
      return local ? JSON.parse(local) : {};
    } catch (localErr) {
      return {};
    }
  };

  /**
   * @description Saves the dark mode toggle state for the current user.
   * @param {boolean} isDark - Whether dark mode is enabled
   * @returns {Promise<void>}
   * @example
   * await ElectIQ.Storage.saveDarkMode(true);
   */
  const saveDarkMode = async (isDark) => {
    const uid = sessionStorage.getItem('electiq_uid') || 'anon';
    await savePreferences(uid, { darkMode: isDark });
  };

  /**
   * @description Saves the quiz completion result for the current user.
   * Increments total attempts and stores the latest score and date.
   * @param {number} score - Raw score achieved
   * @param {number} total - Total possible score
   * @param {number} percentage - Score as a percentage
   * @returns {Promise<void>}
   * @example
   * await ElectIQ.Storage.saveQuizResult(4, 5, 80);
   */
  const saveQuizResult = async (score, total, percentage) => {
    const uid = sessionStorage.getItem('electiq_uid') || 'anon';
    const existing = await loadPreferences(uid);
    const attempts = (existing.totalAttempts || 0) + 1;

    await savePreferences(uid, {
      lastQuizScore: score,
      lastQuizTotal: total,
      lastQuizPercentage: percentage,
      lastQuizDate: new Date().toISOString(),
      totalAttempts: attempts
    });
  };

  /**
   * @description Saves recent glossary search queries for the current user.
   * Keeps only the last 5 unique search terms.
   * @param {string} query - The search term entered by the user
   * @returns {Promise<void>}
   * @example
   * await ElectIQ.Storage.saveGlossarySearch('gerrymandering');
   */
  const saveGlossarySearch = async (query) => {
    if (!query || query.trim().length === 0) {
      return;
    }
    const uid = sessionStorage.getItem('electiq_uid') || 'anon';
    const existing = await loadPreferences(uid);
    const searches = existing.recentSearches || [];

    // Avoid duplicates and keep last 5
    const filtered = searches.filter(s => s !== query.trim());
    filtered.unshift(query.trim());
    const trimmed = filtered.slice(0, 5);

    await savePreferences(uid, { recentSearches: trimmed });
  };

  return {
    savePreferences,
    loadPreferences,
    saveDarkMode,
    saveQuizResult,
    saveGlossarySearch
  };
})();
