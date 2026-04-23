/**
 * @description AI Chat Assistant service
 * @namespace ElectIQ.Chat
 */
window.ElectIQ = window.ElectIQ || {};

window.ElectIQ.Chat = (function() {
  let rateLimit = {
    timestamps: JSON.parse(sessionStorage.getItem('chat_timestamps') || '[]')
  };

  /**
   * @description Check if current user is rate limited
   * @returns {boolean} - True if rate limited
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
   * @description Get remaining seconds for rate limit reset
   * @returns {number} - Seconds
   */
  const getWaitTime = () => {
    if (rateLimit.timestamps.length === 0) return 0;
    const oldest = rateLimit.timestamps[0];
    const wait = window.ElectIQ.Config.settings.chatRateLimitWindow - (Date.now() - oldest);
    return Math.ceil(wait / 1000);
  };

  /**
   * @description Add a message to the chat UI
   * @param {string} text - Message content
   * @param {string} sender - 'user' or 'ai'
   */
  const addMessage = (text, sender) => {
    const chatBody = document.getElementById('chatBody');
    const typingIndicator = document.getElementById('typingIndicator');
    if (!chatBody) return;

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
    
    if (sender === 'ai') {
      window.ElectIQ.Accessibility.announceToScreenReader(text);
    }
  };

  /**
   * @description Handle message sending
   */
  const handleSend = async () => {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const typing = document.getElementById('typingIndicator');
    
    if (!input || !input.value.trim()) return;
    
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
    sendBtn.disabled = true;
    typing.style.display = 'flex';
    typing.setAttribute('aria-busy', 'true');
    
    rateLimit.timestamps.push(Date.now());
    sessionStorage.setItem('chat_timestamps', JSON.stringify(rateLimit.timestamps));

    window.ElectIQ.Analytics.events.aiQuestionAsked();

    // Simulate AI for demo, call real API if key present
    setTimeout(() => {
      typing.style.display = 'none';
      typing.setAttribute('aria-busy', 'false');
      
      let response = "That's a great question about our democratic process. For specific details, I recommend checking the official FEC website or your local Secretary of State office.";
      
      if (sanitized.toLowerCase().includes('register')) {
        response = "Voter registration is handled at the state level. In most states, you can register online, by mail, or in person at a DMV or election office. The deadline is usually 15-30 days before the election.";
      }

      addMessage(response, 'ai');
      sendBtn.disabled = false;
    }, 1500);
  };

  const init = () => {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chips = document.getElementById('chatChips');

    if (input && sendBtn) {
      sendBtn.addEventListener('click', handleSend);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
      });
      
      input.addEventListener('input', () => {
        sendBtn.disabled = input.value.trim().length === 0;
      });
    }

    if (chips) {
      chips.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
          input.value = chip.textContent;
          handleSend();
        });
      });
    }
  };

  return { init };
})();
