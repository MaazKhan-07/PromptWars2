/**
 * @description Timeline stage management and interactions
 * @namespace ElectIQ.Timeline
 */
window.ElectIQ = window.ElectIQ || {};

window.ElectIQ.Timeline = (function() {
  const stageData = {
    registration: {
      title: "Voter Registration",
      date: "Ongoing / Varying deadlines",
      desc: "The critical first step in democratic participation. Most states require registration 15–30 days before election day. Millions of new voters join the rolls every cycle, ensuring their voice is ready for the ballot box.",
      facts: ["Must be 18+", "U.S. Citizen", "State Residency"],
      color: "#2196F3"
    },
    primaries: {
      title: "Primary Elections",
      date: "February - June",
      desc: "Parties select their champions. Through caucus or primary voting, selected delegates represent the will of party members at the national conventions, narrowing the field of candidates.",
      facts: ["Open vs Closed", "Delegates", "Caucuses"],
      color: "#9C27B0"
    },
    campaigns: {
      title: "Campaigns & Debates",
      date: "July - October",
      desc: "The battle for hearts and minds. Candidates travel across battleground states, participating in televised debates and town halls to share their visions for the nation's future.",
      facts: ["Policy Platforms", "Public Finance", "Swing States"],
      color: "#FF9800"
    },
    electionday: {
      title: "Election Day",
      date: "Tuesday after first Monday in Nov",
      desc: "The culmination of the process. Millions cast ballots in person, joining the mail-in votes already tallied. The highest authority in the land—the voter—decides the direction of government.",
      facts: ["Poll Hours", "Ballot Measures", "Voter Privacy"],
      color: "#E53935"
    },
    counting: {
      title: "Vote Counting",
      date: "Election Night & Beyond",
      desc: "Ensuring every legal vote counts. Bipartisan observers track the tallying of paper and digital ballots, while audits verify the integrity of the technology and reporting systems.",
      facts: ["Absentee Tally", "Audit Logs", "Bipartisan Review"],
      color: "#00897B"
    },
    certification: {
      title: "Certification",
      date: "Late Nov - December",
      desc: "Making the results official. Local and state boards verify counts and resolve any disputes before formally declaring the winners and appointing electors to the Electoral College.",
      facts: ["Electoral College", "State Boards", "Legal Finality"],
      color: "#43A047"
    },
    inauguration: {
      title: "Inauguration",
      date: "January 20",
      desc: "A peaceful transfer of power. The President-elect takes the oath of office on the Capitol steps, marking the official beginning of a new four-year term of service to the people.",
      facts: ["Oath of Office", "Capitol Ceremony", "Presidential Term"],
      color: "#FFB300"
    }
  };

  /**
   * @description Get stage color from name
   * @param {string} stage - Stage key
   * @returns {string} - Hex color
   */
  const getStageColor = (stage) => stageData[stage]?.color || "#2196F3";

  /**
   * @description Close the timeline detail modal
   */
  const closeTimeline = () => {
    const detail = document.getElementById('timelineDetail');
    const cards = document.querySelectorAll('.timeline-card');
    if (!detail) return;
    
    detail.classList.remove('active');
    setTimeout(() => { detail.innerHTML = ''; }, 300);
    cards.forEach(c => {
      c.classList.remove('active');
      c.setAttribute('aria-expanded', 'false');
    });
  };

  const openStage = (stage, card) => {
    const detail = document.getElementById('timelineDetail');
    const data = stageData[stage];
    if (!detail || !data) return;

    document.querySelectorAll('.timeline-card').forEach(c => {
      c.classList.remove('active');
      c.setAttribute('aria-expanded', 'false');
    });
    
    card.classList.add('active');
    card.setAttribute('aria-expanded', 'true');

    detail.innerHTML = `
      <div class="modal-card" style="border-top: 6px solid ${data.color}" role="dialog" aria-labelledby="modalTitle">
        <button class="modal-close" id="modalClose" aria-label="Close modal">
          <span class="material-symbols-outlined">close</span>
        </button>
        <div class="tl-dates">${window.ElectIQ.Utils.formatDate(data.date)}</div>
        <h3 class="text-h2" id="modalTitle">${data.title}</h3>
        <p class="tl-desc">${data.desc}</p>
        <div class="timeline-facts">
          ${data.facts.map(f => `
            <span class="timeline-fact">
              <span class="material-symbols-outlined" style="font-size:14px;color:${data.color}">check_circle</span> 
              ${f}
            </span>
          `).join('')}
        </div>
      </div>
    `;
    detail.classList.add('active');

    const modalClose = document.getElementById('modalClose');
    if (modalClose) modalClose.addEventListener('click', closeTimeline);
    
    // Focus management
    const modal = detail.querySelector('.modal-card');
    modal.focus();
    modal.addEventListener('keydown', (e) => window.ElectIQ.Accessibility.trapFocus(modal, e));

    window.ElectIQ.Analytics.events.timelineStageClicked(stage);
  };

  const init = () => {
    const timelineTrack = document.getElementById('timelineTrack');
    const timelineDetail = document.getElementById('timelineDetail');
    
    if (timelineTrack) {
      const cards = timelineTrack.querySelectorAll('.timeline-card');
      cards.forEach(card => {
        card.setAttribute('role', 'button');
        card.setAttribute('aria-expanded', 'false');
        card.setAttribute('tabindex', '0');

        card.addEventListener('click', (e) => {
          e.stopPropagation();
          openStage(card.dataset.stage, card);
        });

        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openStage(card.dataset.stage, card);
          }
        });
      });

      if (timelineDetail) {
        timelineDetail.addEventListener('click', (e) => {
          if (e.target === timelineDetail) closeTimeline();
        });
      }
    }
  };

  return { init, getStageColor };
})();
