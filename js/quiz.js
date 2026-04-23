/**
 * @description Quiz state machine and scoring logic
 * @namespace ElectIQ.Quiz
 */
window.ElectIQ = window.ElectIQ || {};

window.ElectIQ.Quiz = (function() {
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

  let state = {
    currentIdx: 0,
    score: 0,
    answers: new Array(questions.length).fill(null)
  };

  /**
   * @description Get score label based on score
   * @param {number} score - The score
   * @returns {string} - Badge text
   */
  const getScoreLabel = (score) => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return "🏆 Expert";
    if (percentage >= 50) return "🎓 Learner";
    return "📚 Beginner";
  };

  /**
   * @description Reset quiz state
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
   * @description Render the current question
   */
  const render = () => {
    const questionText = document.getElementById('questionText');
    const quizOptions = document.getElementById('quizOptions');
    if (!questionText || !quizOptions) return;

    const q = questions[state.currentIdx];
    questionText.textContent = q.q;
    
    // Accessibility: set description
    quizOptions.setAttribute('aria-describedby', 'questionText');

    document.getElementById('currentIdx').textContent = state.currentIdx + 1;
    document.getElementById('totalQuestions').textContent = questions.length;
    document.getElementById('progressBar').style.width = `${((state.currentIdx + 1) / questions.length) * 100}%`;

    quizOptions.innerHTML = '';
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      if (state.answers[state.currentIdx] === i) btn.classList.add('selected');
      
      btn.innerHTML = `
        <span class="opt-letter">${String.fromCharCode(65 + i)}</span>
        <span class="opt-text">${opt}</span>
      `;
      
      btn.setAttribute('aria-label', `Option ${String.fromCharCode(65 + i)}: ${opt}`);
      
      btn.addEventListener('click', () => {
        state.answers[state.currentIdx] = i;
        document.querySelectorAll('.quiz-option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        document.getElementById('nextBtn').disabled = false;
        
        // Auto-move focus to next button
        document.getElementById('nextBtn').focus();
      });
      quizOptions.appendChild(btn);
    });

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.style.visibility = state.currentIdx === 0 ? 'hidden' : 'visible';
    nextBtn.textContent = state.currentIdx === questions.length - 1 ? "Finish Test" : "Next Question";
    nextBtn.disabled = state.answers[state.currentIdx] === null;
  };

  /**
   * @description Finish quiz and show results
   */
  const finish = async () => {
    state.score = state.answers.reduce((acc, ans, i) => acc + (ans === questions[i].correct ? 1 : 0), 0);
    const percentage = (state.score / questions.length) * 100;
    
    document.getElementById('quizCard').style.display = 'none';
    document.querySelector('.quiz-actions').style.display = 'none';
    document.querySelector('.quiz-header').style.display = 'none';
    document.querySelector('.progress-container').style.display = 'none';
    
    const results = document.getElementById('quizResults');
    results.style.display = 'block';
    document.getElementById('finalScore').textContent = `${state.score} / ${questions.length}`;
    
    const label = getScoreLabel(state.score);
    const announcement = `You scored ${state.score} out of ${questions.length}, ${percentage}%, ${label} level`;
    window.ElectIQ.Accessibility.announceToScreenReader(announcement);

    // Track event
    window.ElectIQ.Analytics.events.quizCompleted(state.score, percentage);

    // Save to Firebase
    if (window.ElectIQ.Firebase) {
      await window.ElectIQ.Firebase.saveQuizScore({
        score: state.score,
        totalQuestions: questions.length,
        percentage: percentage
      });
      loadLeaderboard();
    }
  };

  const loadLeaderboard = async () => {
    const list = document.getElementById('leaderboardList');
    if (!list) return;

    const scores = await window.ElectIQ.Firebase.getLeaderboard();
    list.innerHTML = scores.map((s, i) => `
      <div class="leaderboard-item">
        <span>#${i + 1}</span>
        <span>${s.percentage}%</span>
        <span>${getScoreLabel(s.score)}</span>
      </div>
    `).join('');
  };

  /**
   * @description Initializer
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
      window.ElectIQ.Analytics.events.quizStarted();
      render();
    }
  };

  return {
    init,
    getScoreLabel,
    reset,
    questions
  };
})();
