/**
 * @description Glossary term management and filtering
 * @namespace ElectIQ.Glossary
 */
window.ElectIQ = window.ElectIQ || {};

window.ElectIQ.Glossary = (function() {
  /**
   * @description Filter terms by query
   * @param {string} query - Search query
   * @param {NodeList} groups - Glossary group elements
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
   * @description Initialize alphabetic navigation
   */
  const initAlphaBar = () => {
    const alphaBar = document.getElementById('alphaBar');
    const glossaryGrid = document.getElementById('glossaryGrid');
    if (!alphaBar || !glossaryGrid) return;

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    alphaBar.innerHTML = '';
    
    letters.forEach(l => {
      const btn = document.createElement('button');
      btn.className = 'alpha-btn';
      btn.textContent = l;
      btn.dataset.letter = l;
      btn.setAttribute('aria-label', `Filter by letter ${l}`);
      
      const group = glossaryGrid.querySelector(`.glossary-group[data-letter="${l}"]`);
      if (!group) btn.disabled = true;

      btn.addEventListener('click', () => {
        if (group) {
          // Calculate offset to account for sticky navbar
          const navHeight = document.querySelector('.navbar').offsetHeight + 40;
          const elementPosition = group.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - navHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          document.querySelectorAll('.alpha-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }
      });
      
      // Keyboard navigation
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
          const next = btn.nextElementSibling;
          if (next) next.focus();
        } else if (e.key === 'ArrowLeft') {
          const prev = btn.previousElementSibling;
          if (prev) prev.focus();
        }
      });
      
      alphaBar.appendChild(btn);
    });
  };

  const init = () => {
    const glossarySearch = document.getElementById('glossarySearch');
    const glossaryGrid = document.getElementById('glossaryGrid');
    
    if (glossarySearch && glossaryGrid) {
      initAlphaBar();
      
      const searchHandler = window.ElectIQ.Utils.debounce((e) => {
        const query = e.target.value;
        const groups = glossaryGrid.querySelectorAll('.glossary-group');
        filterTerms(query, groups);
        window.ElectIQ.Analytics.events.glossarySearched(query);
      }, 300);

      glossarySearch.addEventListener('input', searchHandler);
    }
  };

  return { init, filterTerms };
})();
