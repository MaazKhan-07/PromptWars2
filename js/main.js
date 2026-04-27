/**
 * @module main
 * @description Main application controller and page router for ElectIQ.
 * Handles shared UI initialization (navbar, mobile drawer, fade-in observers),
 * Firebase authentication initialization on every page, page-specific module
 * loading, and Google Maps integration for the Steps page.
 * @version 3.0.0
 * @author ElectIQ Team
 */
window.ElectIQ = window.ElectIQ || {};

window.ElectIQ.Main = (function () {
  'use strict';

  /**
   * @description Shared UI logic executed on every page: mobile navigation,
   * intersection observer for fade-in animations, and service initialization.
   * @returns {void}
   * @example
   * ElectIQ.Main.initShared();
   */
  const initShared = () => {
    // Mobile hamburger menu
    const hamburger = document.getElementById('hamburger');
    const mobileDrawer = document.getElementById('mobileDrawer');

    if (hamburger && mobileDrawer) {
      hamburger.addEventListener('click', () => {
        const isActive = hamburger.classList.toggle('active');
        mobileDrawer.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isActive);
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileDrawer.classList.contains('active')) {
          hamburger.classList.remove('active');
          mobileDrawer.classList.remove('active');
          hamburger.focus();
        }
      });
    }

    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // Initialize common utility services
    if (window.ElectIQ.Accessibility) {
      window.ElectIQ.Accessibility.initSkipLink();
    }
    if (window.ElectIQ.Theme) {
      window.ElectIQ.Theme.init();
    }
    if (window.ElectIQ.Analytics) {
      window.ElectIQ.Analytics.init();
    }

    // Track external link clicks
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      link.addEventListener('click', () => {
        if (window.ElectIQ.Analytics) {
          window.ElectIQ.Analytics.events.externalLinkClicked(link.href);
        }
      });
    });
  };

  /**
   * @description Steps page logic: category filter buttons, accordion expand/collapse,
   * and Google Maps polling location finder integration.
   * @returns {void}
   * @example
   * // Called automatically when filter-btn elements are detected on the page
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
              setTimeout(() => { card.style.opacity = '1'; }, 50);
            } else {
              card.style.opacity = '0';
              setTimeout(() => { card.style.display = 'none'; }, 300);
            }
          });
        });
      });

      stepCards.forEach(card => {
        const moreBtn = card.querySelector('.step-more-btn');
        const accordion = card.querySelector('.step-accordion');

        if (moreBtn && accordion) {
          moreBtn.addEventListener('click', () => {
            const isOpen = card.classList.toggle('expanded');
            accordion.style.maxHeight = isOpen ? (accordion.scrollHeight + 'px') : '0';
            moreBtn.querySelector('span:first-child').textContent = isOpen ? 'Show Less' : 'Learn More';
            moreBtn.querySelector('span:last-child').style.transform = isOpen ? 'rotate(90deg)' : 'rotate(0deg)';
            moreBtn.setAttribute('aria-expanded', isOpen);

            if (window.ElectIQ.Analytics) {
              window.ElectIQ.Analytics.events.stepExpanded(
                card.querySelector('h3').textContent,
                isOpen
              );
            }

            if (!isOpen) {
              moreBtn.focus();
            }
          });
        }
      });
    }
  };

  /**
   * @description Application entry point. Initializes shared UI, Firebase Auth,
   * and routes to page-specific initializers based on DOM markers.
   * @returns {Promise<void>}
   * @example
   * // Triggered automatically via DOMContentLoaded
   */
  const init = async () => {
    initShared();

    // Initialize Firebase on ALL pages
    if (window.ElectIQ.Firebase) {
      await window.ElectIQ.Firebase.init();
      await window.ElectIQ.Firebase.initAuth();
    }

    // Page-specific initializers
    if (document.getElementById('timelineTrack') && window.ElectIQ.Timeline) {
      window.ElectIQ.Timeline.init();
    }
    if (document.querySelector('.filter-btn')) {
      initSteps();
    }
    if (document.getElementById('glossaryGrid') && window.ElectIQ.Glossary) {
      window.ElectIQ.Glossary.init();
    }
    if (document.getElementById('chatInput') && window.ElectIQ.Chat) {
      window.ElectIQ.Chat.init();
    }
    if (document.getElementById('questionText') && window.ElectIQ.Quiz) {
      window.ElectIQ.Quiz.init();
    }
  };

  return { init };
})();

document.addEventListener('DOMContentLoaded', window.ElectIQ.Main.init);

/**
 * @description Google Maps initialization callback. Sets up the map instance,
 * Places Autocomplete, and location marker for the Steps page polling finder.
 * @returns {void}
 * @example
 * // Invoked by the Google Maps API script tag callback parameter
 */
window.initMap = function () {
  'use strict';
  const mapEl = document.getElementById('map');
  if (!mapEl) {
    return;
  }

  const defaultLoc = { lat: 38.8977, lng: -77.0365 }; // Washington, DC
  const map = new google.maps.Map(mapEl, {
    zoom: 12,
    center: defaultLoc,
    styles: []
  });

  const input = document.getElementById('mapSearch');
  if (!input) {
    return;
  }

  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);

  const marker = new google.maps.Marker({
    map,
    anchorPoint: new google.maps.Point(0, -29)
  });

  autocomplete.addListener('place_changed', () => {
    marker.setVisible(false);
    const place = autocomplete.getPlace();
    if (!place.geometry || !place.geometry.location) {
      return;
    }

    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);

    const locationInfo = document.getElementById('locationInfo');
    if (locationInfo) {
      locationInfo.style.display = 'block';
    }
  });
};
