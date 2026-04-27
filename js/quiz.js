/**
 * @module quiz
 * @description Quiz state machine, scoring logic, and Firestore leaderboard
 * integration. Manages question rendering, answer selection, score calculation,
 * and real-time community leaderboard with demo fallback.
 * @version 3.0.0
 * @author ElectIQ Team
 */
window.ElectIQ = window.ElectIQ || {};

window.ElectIQ.Quiz = (function () {
  'use strict';

  /**
   * @description Array of quiz question objects with question text,
   * options array, and correct answer index.
   * @type {Array<{q: string, options: string[], correct: number}>}
   */
  const questions = [
    {
      q: "Which of the following best describes the role of the Electoral College in U.S. Presidential elections?",
      options: [
        "A direct popular vote where the candidate with the most individual votes wins.",
        "A body of electors chosen by each state to formally cast votes for President and Vice President.",
        "A committee appointed by Congress to verify the eligibility of candidates.",
        "A group of supreme court justices who decide the election in case of a tie."
      ],
      correct: 1
    },
    {
      q: "What is the primary purpose of a 'Primary' election?",
      options: [
        "To elect the President directly.",
        "To allow parties to choose their final candidates for the general election.",
        "To vote on local tax measures.",
        "To decide which laws should be repealed."
      ],
      correct: 1
    },
    {
      q: "How many electoral votes are needed to win the U.S. Presidency?",
      options: ["100", "538", "270", "435"],
      correct: 2
    },
    {
      q: "What is 'Gerrymandering'?",
      options: [
        "A type of voting machine.",
        "The process of counting mail-in ballots.",
        "Manipulating district boundaries to favor one party.",
        "A ceremony held after inauguration."
      ],
      correct: 2
    },
    {
      q: "Who is responsible for overseeing elections in most U.S. states?",
      options: [
        "The President",
        "The Secretary of State",
        "The Chief Justice",
        "The Attorney General"
      ],
      correct: 1
    }
  ];

  /**
   * @description Current quiz state object tracking position, score, and answers.
   * @type {{currentIdx: number, score: number, answers: (number|null)[]}}
   */
  let state = {
    currentIdx: 0,
    score: 0,
    answers: new Array(questions.length).fill(null)
  };

  /**
   * @description Returns a label and emoji badge based on the user's score percentage.
   * @param {number} score - The raw score achieved
   * @returns {string} Badge text with emoji prefix
   * @example
   * getScoreLabel(5); // "🏆 Expert"
   * getScoreLabel(2); // "📚 Beginner"
   */
  const getScoreLabel = (score) => {
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) {
      return '🏆 Perfect';
    }
    if (percentage >= 75) {
      return '🎓 Expert';
    }
    if (percentage >= 50) {
      return '📚 Learner';
    }
    return '🌱 Beginner';
  };

  /**
   * @description Resets the quiz to its initial state for retaking.
   * @returns {{currentIdx: number, score: number, answers: (number|null)[]}} Fresh state
   * @example
   * const freshState = ElectIQ.Quiz.reset();
   */
  const reset = () => {
    state = {
      currentIdx: 0,
      score: 0,
      answers: new Array(questions.length).fill(null)
    };
    return state;
  };

  /**
   * @description Renders the current question, options, progress bar,
   * and navigation button states to the DOM.
   * @returns {void}
   * @example
   * render(); // Updates the quiz UI to show the current question
   */
  const render = () => {
    const questionText = document.getElementById('questionText');
    const quizOptions = document.getElementById('quizOptions');
    if (!questionText || !quizOptions) {
      return;
    }

    const q = questions[state.currentIdx];
    questionText.textContent = q.q;

    quizOptions.setAttribute('aria-describedby', 'questionText');

    const currentIdxEl = document.getElementById('currentIdx');
    const totalEl = document.getElementById('totalQuestions');
    const progressBar = document.getElementById('progressBar');

    if (currentIdxEl) {
      currentIdxEl.textContent = state.currentIdx + 1;
    }
    if (totalEl) {
      totalEl.textContent = questions.length;
    }
    if (progressBar) {
      progressBar.style.width = ((state.currentIdx + 1) / questions.length * 100) + '%';
    }

    quizOptions.innerHTML = '';
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      if (state.answers[state.currentIdx] === i) {
        btn.classList.add('selected');
      }

      btn.innerHTML = `
        <span class="opt-letter">${String.fromCharCode(65 + i)}</span>
        <span class="opt-text">${opt}</span>
      `;

      btn.setAttribute('aria-label', `Option ${String.fromCharCode(65 + i)}: ${opt}`);

      btn.addEventListener('click', () => {
        state.answers[state.currentIdx] = i;
        document.querySelectorAll('.quiz-option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
          nextBtn.disabled = false;
          nextBtn.focus();
        }

        // Track answer selection
        if (window.ElectIQ.Analytics) {
          window.ElectIQ.Analytics.events.quizAnswerSelected(
            q.q.substring(0, 50),
            opt.substring(0, 50),
            i === q.correct
          );
        }
      });
      quizOptions.appendChild(btn);
    });

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) {
      prevBtn.style.visibility = state.currentIdx === 0 ? 'hidden' : 'visible';
    }
    if (nextBtn) {
      nextBtn.textContent = state.currentIdx === questions.length - 1 ? 'Finish Test' : 'Next Question';
      nextBtn.disabled = state.answers[state.currentIdx] === null;
    }
  };

  /**
   * @description Renders a demo leaderboard when Firestore is unavailable.
   * Displays a static set of scores including the user's current result.
   * @param {number} userScore - User's raw score
   * @param {number} userPercentage - User's percentage score
   * @returns {void}
   * @example
   * renderDemoLeaderboard(4, 80);
   */
  const renderDemoLeaderboard = (userScore, userPercentage) => {
    const demoData = [
      { percentage: 100, uid: 'demo-1' },
      { percentage: 95, uid: 'demo-2' },
      { percentage: 90, uid: 'demo-3' },
      { percentage: 85, uid: 'demo-4' },
      { percentage: 80, uid: 'demo-5' },
      { percentage: 75, uid: 'demo-6' },
      { percentage: userPercentage, uid: 'me' }
    ].sort((a, b) => b.percentage - a.percentage).slice(0, 7);

    const leaderboardEl = document.getElementById('leaderboard-list');
    if (!leaderboardEl) {
      return;
    }

    leaderboardEl.innerHTML = demoData.map((d, i) => `
      <li class="lb-row ${d.uid === 'me' ? 'lb-me' : ''}"
          aria-label="Rank ${i + 1}: ${d.percentage}% score">
        <span class="lb-rank">${i < 3 ? ['🥇', '🥈', '🥉'][i] : '#' + (i + 1)}</span>
        <span class="lb-score">${d.percentage}%</span>
        <span class="lb-label">${d.uid === 'me' ? '← You' : 'Player'}</span>
      </li>
    `).join('');
  };

  /**
   * @description Saves the quiz score to Firestore and loads the leaderboard.
   * Falls back to a demo leaderboard if Firestore is unavailable.
   * @param {number} score - User's raw score
   * @param {number} total - Total questions
   * @returns {Promise<void>}
   * @example
   * await saveScoreAndLoadLeaderboard(4, 5);
   */
  const saveScoreAndLoadLeaderboard = async (score, total) => {
    const uid = sessionStorage.getItem('electiq_uid') || 'anon-' + crypto.randomUUID();
    const percentage = Math.round((score / total) * 100);

    try {
      // Save to Firebase
      if (window.ElectIQ.Firebase) {
        await window.ElectIQ.Firebase.saveQuizScore({
          score: score,
          totalQuestions: total,
          percentage: percentage
        });
      }

      // Track analytics
      if (window.ElectIQ.Analytics) {
        window.ElectIQ.Analytics.events.quizCompleted(score, percentage);
        window.ElectIQ.Analytics.events.leaderboardViewed();
      }

      // Save to user preferences
      if (window.ElectIQ.Storage) {
        await window.ElectIQ.Storage.saveQuizResult(score, total, percentage);
      }

      // Load leaderboard from Firestore
      if (window.ElectIQ.Firebase) {
        const scores = await window.ElectIQ.Firebase.getLeaderboard();

        const leaderboardEl = document.getElementById('leaderboard-list');
        if (!leaderboardEl) {
          return;
        }

        if (!scores || scores.length === 0) {
          renderDemoLeaderboard(score, percentage);
          return;
        }

        leaderboardEl.innerHTML = '';
        let rank = 1;
        scores.forEach(d => {
          const isMe = d.uid === uid;
          const li = document.createElement('li');
          li.className = 'lb-row' + (isMe ? ' lb-me' : '');
          li.setAttribute('aria-label', `Rank ${rank}: ${d.percentage}% score`);
          li.innerHTML = `
            <span class="lb-rank">${rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : '#' + rank}</span>
            <span class="lb-score">${d.percentage}%</span>
            <span class="lb-label">${isMe ? '← You' : 'Player'}</span>
          `;
          leaderboardEl.appendChild(li);
          rank++;
        });
      } else {
        renderDemoLeaderboard(score, percentage);
      }
    } catch (err) {
      console.warn('[ElectIQ Quiz] Leaderboard fallback:', err.message);
      renderDemoLeaderboard(score, percentage);
    }
  };

  /**
   * @description Calculates final score, hides the quiz UI, shows results card
   * with score and leaderboard. Announces result to screen readers.
   * @returns {Promise<void>}
   * @example
   * await finish();
   */
  const finish = async () => {
    state.score = state.answers.reduce((acc, ans, i) => acc + (ans === questions[i].correct ? 1 : 0), 0);
    const percentage = Math.round((state.score / questions.length) * 100);

    const quizCard = document.getElementById('quizCard');
    const quizActions = document.querySelector('.quiz-actions');
    const quizHeader = document.querySelector('.quiz-header');
    const progressContainer = document.querySelector('.progress-container');

    if (quizCard) {
      quizCard.style.display = 'none';
    }
    if (quizActions) {
      quizActions.style.display = 'none';
    }
    if (quizHeader) {
      quizHeader.style.display = 'none';
    }
    if (progressContainer) {
      progressContainer.style.display = 'none';
    }

    const results = document.getElementById('quizResults');
    if (results) {
      results.style.display = 'block';
    }

    const finalScore = document.getElementById('finalScore');
    if (finalScore) {
      finalScore.textContent = `${state.score} / ${questions.length}`;
    }

    const label = getScoreLabel(state.score);
    const announcement = `You scored ${state.score} out of ${questions.length}, ${percentage} percent, ${label} level`;

    if (window.ElectIQ.Accessibility) {
      window.ElectIQ.Accessibility.announceToScreenReader(announcement);
    }

    // Save score and load leaderboard
    await saveScoreAndLoadLeaderboard(state.score, questions.length);
  };

  /**
   * @description Initializes the quiz module: attaches event listeners to
   * navigation buttons, tracks quiz start, and renders the first question.
   * @returns {void}
   * @example
   * ElectIQ.Quiz.init();
   */
  const init = () => {
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (state.currentIdx < questions.length - 1) {
          state.currentIdx++;
          render();
        } else {
          finish();
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (state.currentIdx > 0) {
          state.currentIdx--;
          render();
        }
      });
    }

    if (document.getElementById('questionText')) {
      if (window.ElectIQ.Analytics) {
        window.ElectIQ.Analytics.events.quizStarted();
      }
      render();
    }
  };

  return {
    init,
    getScoreLabel,
    reset,
    questions,
    renderDemoLeaderboard
  };
})();
