/**
 * @description Google Analytics 4 event tracking service
 * @namespace ElectIQ.Analytics
 */
window.ElectIQ = window.ElectIQ || {};

window.ElectIQ.Analytics = (function() {
  /**
   * @description Safe wrapper for gtag that no-ops if GA is blocked
   * @param {string} type - Event type (e.g., 'event')
   * @param {string} name - Event name
   * @param {Object} [params] - Event parameters
   */
  const track = (type, name, params = {}) => {
    if (typeof window.gtag === 'function') {
      window.gtag(type, name, params);
    }
  };

  /**
   * @description Initialize GA4
   */
  const init = () => {
    const gaId = window.ElectIQ.Config.api.gaId;
    if (!gaId || gaId === "G-DEMO12345") return;

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', gaId);
  };

  return {
    init,
    /**
     * @description Track custom events
     */
    events: {
      quizStarted: () => track('event', 'quiz_started'),
      quizCompleted: (score, percentage) => track('event', 'quiz_completed', { score, percentage }),
      aiQuestionAsked: () => track('event', 'ai_question_asked'),
      glossarySearched: (query) => track('event', 'glossary_searched', { query }),
      timelineStageClicked: (stageName) => track('event', 'timeline_stage_clicked', { stage_name: stageName }),
      stepExpanded: (stepTitle) => track('event', 'step_expanded', { step_title: stepTitle }),
      darkModeToggled: (enabled) => track('event', 'dark_mode_toggled', { enabled })
    }
  };
})();
