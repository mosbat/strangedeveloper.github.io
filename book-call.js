// book-call.js
(function () {
  const CONSENT_KEY = 'mousaConsentV1';
  const EVENT_NAME = 'clicked_contact_button_link';
  const SELECTOR = '.book-call';

  function hasConsent() {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return false;
      const c = JSON.parse(raw);
      return c && c.accepted === true;
    } catch (e) {
      return false;
    }
  }

  function fireEventIfAllowed() {
    if (hasConsent() && typeof window.gtag === 'function') {
      try {
        window.gtag('event', EVENT_NAME, { transport_type: 'beacon' });
        //console.log('book call event fired');
      } catch (e) {
        console.warn('gtag error', e);
      }
    }
  }

  function attachListeners() {
    const els = document.querySelectorAll(SELECTOR);
    if (!els || els.length === 0) return;
    els.forEach(function (el) {
      // avoid attaching twice
      if (el.__bookCallAttached) return;
      el.__bookCallAttached = true;
      el.addEventListener('click', function () {
        fireEventIfAllowed();
      });
    });
  }

  // Attach now and also after DOMContentLoaded if needed
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachListeners);
  } else {
    attachListeners();
  }

  // Also re-run if elements are added dynamically (mutation observer)
  try {
    const mo = new MutationObserver(function () {
      attachListeners();
    });
    mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
  } catch (e) {
    // MutationObserver not available — fine to skip
  }

  // Optional: expose for manual re-attach
  window.__bookCall = {
    attach: attachListeners,
    hasConsent: hasConsent
  };
})();