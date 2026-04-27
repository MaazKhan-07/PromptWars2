/**
 * @module glossary
 * @description Glossary term management, search filtering, and alphabetic
 * navigation for the ElectIQ civic education dictionary. Integrates with
 * analytics tracking and user preference persistence for recent searches.
 * @version 3.0.0
 * @author ElectIQ Team
 */
window.ElectIQ = window.ElectIQ || {};

window.ElectIQ.Glossary = (function () {
  'use strict';

  /**
   * @description Filters glossary term cards by a text query. Shows/hides
   * individual cards and their parent letter groups based on matches.
   * @param {string} query - The search text to filter by
   * @param {NodeList} groups - Collection of .glossary-group DOM elements
   * @returns {void}
   * @example
   * filterTerms('ballot', document.querySelectorAll('.glossary-group'));
   */
  const filterTerms = (query, groups) => {
    const val = query.toLowerCase();
    groups.forEach(group => {
      const cards = group.querySelectorAll('.glossary-card');
      let groupHasMatch = false;

      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(val)) {
          card.style.display = 'block';
          groupHasMatch = true;
        } else {
          card.style.display = 'none';
        }
      });

      group.style.display = groupHasMatch ? 'block' : 'none';
      group.setAttribute('aria-hidden', !groupHasMatch);
    });
  };

  /**
   * @description Initializes the A-Z alphabetic navigation bar.
   * Creates buttons for each letter, disables letters with no matching
   * glossary groups, and handles smooth scroll on click.
   * @returns {void}
   * @example
   * initAlphaBar();
   */
  const initAlphaBar = () => {
    const alphaBar = document.getElementById('alphaBar');
    const glossaryGrid = document.getElementById('glossaryGrid');
    if (!alphaBar || !glossaryGrid) {
      return;
    }

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    alphaBar.innerHTML = '';

    letters.forEach(l => {
      const btn = document.createElement('button');
      btn.className = 'alpha-btn';
      btn.textContent = l;
      btn.dataset.letter = l;
      btn.setAttribute('aria-label', `Filter by letter ${l}`);

      const group = glossaryGrid.querySelector(`.glossary-group[data-letter="${l}"]`);
      if (!group) {
        btn.disabled = true;
      }

      btn.addEventListener('click', () => {
        if (group) {
          const navHeight = document.querySelector('.navbar').offsetHeight + 40;
          const elementPosition = group.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - navHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          document.querySelectorAll('.alpha-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          // Track letter filter analytics
          if (window.ElectIQ.Analytics) {
            window.ElectIQ.Analytics.events.glossaryLetterFilter(l);
          }
        }
      });

      // Arrow key navigation between letter buttons
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
          const next = btn.nextElementSibling;
          if (next) {
            next.focus();
          }
        } else if (e.key === 'ArrowLeft') {
          const prev = btn.previousElementSibling;
          if (prev) {
            prev.focus();
          }
        }
      });

      alphaBar.appendChild(btn);
    });
  };

  /**
   * @description Initializes the glossary module: sets up the alpha bar,
   * attaches debounced search input handler, and connects analytics/storage.
   * @returns {void}
   * @example
   * ElectIQ.Glossary.init();
   */
  const init = () => {
    const glossarySearch = document.getElementById('glossarySearch');
    const glossaryGrid = document.getElementById('glossaryGrid');

    if (glossarySearch && glossaryGrid) {
      initAlphaBar();

      const searchHandler = window.ElectIQ.Utils.debounce((e) => {
        const query = e.target.value;
        const groups = glossaryGrid.querySelectorAll('.glossary-group');
        filterTerms(query, groups);

        // Track search analytics
        if (window.ElectIQ.Analytics) {
          window.ElectIQ.Analytics.events.glossarySearched(query);
        }

        // Save recent search to user preferences
        if (query.trim().length > 2 && window.ElectIQ.Storage) {
          window.ElectIQ.Storage.saveGlossarySearch(query.trim());
        }
      }, 300);

      glossarySearch.addEventListener('input', searchHandler);
    }
  };

  return { init, filterTerms };
})();
