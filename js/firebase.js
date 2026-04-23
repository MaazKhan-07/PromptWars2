/**
 * @description Firebase Firestore service for quiz leaderboard
 * @namespace ElectIQ.Firebase
 */
window.ElectIQ = window.ElectIQ || {};

window.ElectIQ.Firebase = (function() {
  let db = null;

  /**
   * @description Initialize Firebase if scripts are loaded
   * @returns {Promise<boolean>} - Success status
   */
  const init = async () => {
    const config = window.ElectIQ.Config.api.firebase;
    
    if (typeof window.firebase === 'undefined') {
      console.warn("Firebase scripts not loaded yet.");
      return false;
    }

    try {
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(config);
      }
      db = window.firebase.firestore();
      
      // Connection indicator if element exists
      const indicator = document.getElementById('firebaseStatus');
      if (indicator) {
        indicator.style.backgroundColor = '#4CAF50';
        indicator.title = "Connected to Firebase";
      }
      
      return true;
    } catch (error) {
      console.error("Firebase init error:", error);
      return false;
    }
  };

  /**
   * @description Save quiz result to Firestore
   * @param {Object} result - Quiz result data
   */
  const saveQuizScore = async (result) => {
    if (!db) return;
    try {
      await db.collection("quiz_scores").add({
        ...result,
        timestamp: window.firebase.firestore.FieldValue.serverTimestamp(),
        sessionId: window.ElectIQ.Utils.uuid()
      });
    } catch (error) {
      console.error("Error saving score:", error);
    }
  };

  /**
   * @description Get top 10 scores from Firestore
   * @returns {Promise<Array>} - List of top scores
   */
  const getLeaderboard = async () => {
    if (!db) return [];
    try {
      const snapshot = await db.collection("quiz_scores")
        .orderBy("percentage", "desc")
        .limit(10)
        .get();
      
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return [];
    }
  };

  return {
    init,
    saveQuizScore,
    getLeaderboard
  };
})();
