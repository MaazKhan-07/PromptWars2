/**
 * @module chat
 * @description AI Chat Assistant service for ElectIQ. Handles user message
 * submission, input sanitization, rate limiting, typing indicator management,
 * and dual analytics tracking (message sent + response received).
 * @version 3.0.0
 * @author ElectIQ Team
 */
window.ElectIQ = window.ElectIQ || {};

window.ElectIQ.Chat = (function () {
  'use strict';

  /**
   * @description Rate limit tracker using sessionStorage persistence.
   * @type {{timestamps: number[]}}
   */
  let rateLimit = {
    timestamps: JSON.parse(sessionStorage.getItem('chat_timestamps') || '[]')
  };

  /**
   * @description Checks whether the user has exceeded the message rate limit.
   * Cleans expired timestamps and updates sessionStorage.
   * @returns {boolean} True if the user is currently rate limited
   * @example
   * if (isRateLimited()) { showWarning(); }
   */
  const isRateLimited = () => {
    const now = Date.now();
    const windowMs = window.ElectIQ.Config.settings.chatRateLimitWindow;
    const limit = window.ElectIQ.Config.settings.chatRateLimit;

    rateLimit.timestamps = rateLimit.timestamps.filter(t => now - t < windowMs);
    sessionStorage.setItem('chat_timestamps', JSON.stringify(rateLimit.timestamps));

    return rateLimit.timestamps.length >= limit;
  };

  /**
   * @description Calculates the remaining seconds until the rate limit resets.
   * @returns {number} Seconds remaining before next message is allowed
   * @example
   * const wait = getWaitTime(); // e.g. 45
   */
  const getWaitTime = () => {
    if (rateLimit.timestamps.length === 0) {
      return 0;
    }
    const oldest = rateLimit.timestamps[0];
    const wait = window.ElectIQ.Config.settings.chatRateLimitWindow - (Date.now() - oldest);
    return Math.ceil(wait / 1000);
  };

  /**
   * @description Adds a message bubble to the chat UI. Handles both user
   * and AI message styling with avatar, sources, and screen reader announcement.
   * @param {string} text - Message content to display
   * @param {string} sender - Either 'user' or 'ai'
   * @returns {void}
   * @example
   * addMessage('How do I register to vote?', 'user');
   */
  const addMessage = (text, sender) => {
    const chatBody = document.getElementById('chatBody');
    const typingIndicator = document.getElementById('typingIndicator');
    if (!chatBody) {
      return;
    }

    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender}`;

    if (sender === 'ai') {
      msg.innerHTML = `
        <div class="msg-avatar">
          <span class="material-symbols-outlined">smart_toy</span>
        </div>
        <div class="msg-bubble-wrapper">
          <div class="msg-ai">${text}</div>
          <div class="msg-sources">
            <span class="material-symbols-outlined">verified</span>
            Sources: Federal Election Commission, USA.gov
          </div>
        </div>
      `;
    } else {
      msg.innerHTML = `
        <div class="msg-avatar" style="visibility: hidden"></div>
        <div class="msg-bubble-wrapper">
          <div class="msg-user">${text}</div>
        </div>
      `;
    }

    chatBody.insertBefore(msg, typingIndicator);
    chatBody.scrollTop = chatBody.scrollHeight;

    if (sender === 'ai' && window.ElectIQ.Accessibility) {
      window.ElectIQ.Accessibility.announceToScreenReader(text);
    }
  };

  /**
   * @description Handles the complete message send workflow: validation,
   * sanitization, rate-limit check, AI response simulation, and analytics.
   * @returns {Promise<void>}
   * @example
   * await handleSend();
   */
  const handleSend = async () => {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const typing = document.getElementById('typingIndicator');

    if (!input || !input.value.trim()) {
      return;
    }

    if (isRateLimited()) {
      const wait = getWaitTime();
      addMessage(`Please wait ${wait} seconds before asking another question.`, 'ai');
      return;
    }

    const rawText = input.value;
    const sanitized = window.ElectIQ.Utils.sanitize(rawText);

    if (!sanitized) {
      input.value = '';
      return;
    }

    addMessage(sanitized, 'user');
    input.value = '';
    if (sendBtn) {
      sendBtn.disabled = true;
    }
    if (typing) {
      typing.style.display = 'flex';
      typing.setAttribute('aria-busy', 'true');
    }

    rateLimit.timestamps.push(Date.now());
    sessionStorage.setItem('chat_timestamps', JSON.stringify(rateLimit.timestamps));

    // Track message sent analytics
    if (window.ElectIQ.Analytics) {
      window.ElectIQ.Analytics.events.aiMessageSent(sanitized.length);
    }

    // Simulate AI response (demo mode)
    setTimeout(() => {
      if (typing) {
        typing.style.display = 'none';
        typing.setAttribute('aria-busy', 'false');
      }

      let response = "That's a great question about our democratic process. For specific details, I recommend checking the official FEC website or your local Secretary of State office.";

      if (sanitized.toLowerCase().includes('register')) {
        response = "Voter registration is handled at the state level. In most states, you can register online, by mail, or in person at a DMV or election office. The deadline is usually 15-30 days before the election.";
      } else if (sanitized.toLowerCase().includes('electoral')) {
        response = "The Electoral College is a body of 538 electors who formally elect the President and Vice President. A candidate needs 270 electoral votes to win. Each state gets electors equal to its total congressional representation.";
      } else if (sanitized.toLowerCase().includes('vote') && sanitized.toLowerCase().includes('count')) {
        response = "After polls close, election officials count ballots using a combination of optical scanners and hand counting. Results are verified by bipartisan observers and undergo audits before certification.";
      }

      addMessage(response, 'ai');

      // Track response received analytics
      if (window.ElectIQ.Analytics) {
        window.ElectIQ.Analytics.events.aiResponseReceived(response.length);
      }

      if (sendBtn) {
        sendBtn.disabled = false;
      }
    }, 1500);
  };

  /**
   * @description Initializes the chat module: attaches send button handler,
   * Enter key handler, input validation, and suggestion chip listeners.
   * @returns {void}
   * @example
   * ElectIQ.Chat.init();
   */
  const init = () => {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chips = document.getElementById('chatChips');

    if (input && sendBtn) {
      sendBtn.addEventListener('click', handleSend);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleSend();
        }
      });

      input.addEventListener('input', () => {
        sendBtn.disabled = input.value.trim().length === 0;
      });
    }

    if (chips) {
      chips.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
          if (input) {
            input.value = chip.textContent;
          }
          handleSend();
        });
      });
    }
  };

  return { init };
})();
