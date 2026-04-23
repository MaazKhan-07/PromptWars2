/**
 * @description Main application controller and router
 * @namespace ElectIQ.Main
 */
window.ElectIQ = window.ElectIQ || {};

window.ElectIQ.Main = (function() {
  /**
   * @description Shared UI logic (navigation, observers)
   */
  const initShared = () => {
    const hamburger = document.getElementById('hamburger');
    const mobileDrawer = document.getElementById('mobileDrawer');
    
    if (hamburger && mobileDrawer) {
      hamburger.addEventListener('click', () => {
        const isActive = hamburger.classList.toggle('active');
        mobileDrawer.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isActive);
      });
      
      // Close on Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileDrawer.classList.contains('active')) {
          hamburger.classList.remove('active');
          mobileDrawer.classList.remove('active');
          hamburger.focus();
        }
      });
    }

    // Intersection Observer for fade-ins
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    
    // Initialize common utilities
    window.ElectIQ.Accessibility.initSkipLink();
    window.ElectIQ.Theme.init();
    window.ElectIQ.Analytics.init();
  };

  /**
   * @description Steps page logic (Filter + Accordion + Maps)
   */
  const initSteps = () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const stepCards = document.querySelectorAll('.step-card');
    
    if (filterBtns.length > 0) {
      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const filter = btn.dataset.filter;
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          stepCards.forEach(card => {
            const cats = card.dataset.category.split(' ');
            if (filter === 'all' || cats.includes(filter)) {
              card.style.display = 'block';
              setTimeout(() => card.style.opacity = '1', 50);
            } else {
              card.style.opacity = '0';
              setTimeout(() => card.style.display = 'none', 300);
            }
          });
        });
      });

      stepCards.forEach(card => {
        const moreBtn = card.querySelector('.step-more-btn');
        const accordion = card.querySelector('.step-accordion');
        
        moreBtn.addEventListener('click', () => {
          const isOpen = card.classList.toggle('expanded');
          accordion.style.maxHeight = isOpen ? (accordion.scrollHeight + "px") : "0";
          moreBtn.querySelector('span:first-child').textContent = isOpen ? "Show Less" : "Learn More";
          moreBtn.querySelector('span:last-child').style.transform = isOpen ? "rotate(90deg)" : "rotate(0deg)";
          moreBtn.setAttribute('aria-expanded', isOpen);
          
          window.ElectIQ.Analytics.events.stepExpanded(card.querySelector('h3').textContent);
          
          if (!isOpen) {
            moreBtn.focus();
          }
        });
      });
    }

    // Google Maps logic would go here, initialized by script tag callback
  };

  /**
   * @description Entry point
   */
  const init = async () => {
    initShared();

    // Page-specific initializers
    if (document.getElementById('timelineTrack')) window.ElectIQ.Timeline.init();
    if (document.querySelector('.filter-btn')) initSteps();
    if (document.getElementById('glossaryGrid')) window.ElectIQ.Glossary.init();
    if (document.getElementById('chatInput')) window.ElectIQ.Chat.init();
    if (document.getElementById('questionText')) {
      await window.ElectIQ.Firebase.init();
      window.ElectIQ.Quiz.init();
    }
  };

  return { init };
})();

document.addEventListener('DOMContentLoaded', window.ElectIQ.Main.init);

/**
 * @description Google Maps callback
 */
window.initMap = function() {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  const defaultLoc = { lat: 38.8977, lng: -77.0365 }; // DC
  const map = new google.maps.Map(mapEl, {
    zoom: 12,
    center: defaultLoc,
    styles: [/* styling */]
  });

  const input = document.getElementById('mapSearch');
  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);

  const marker = new google.maps.Marker({
    map,
    anchorPoint: new google.maps.Point(0, -29),
  });

  autocomplete.addListener('place_changed', () => {
    marker.setVisible(false);
    const place = autocomplete.getPlace();
    if (!place.geometry || !place.geometry.location) return;

    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);
    
    document.getElementById('locationInfo').style.display = 'block';
  });
};
