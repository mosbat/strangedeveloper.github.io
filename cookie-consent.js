// cookie-consent.js

(function () {
  const CONSENT_KEY = 'mousaConsentV1';

  function getConsent() {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
    } catch (e) {
      // localStorage might be blocked; fail quietly
    }
  }

  function loadNonEssentialTags() {
    // GOOGLE TAG (Ads / conversions)
    (function loadGoogleTag() {
      if (window.__mousaGoogleLoaded) return;
      window.__mousaGoogleLoaded = true;

      const gtagScript = document.createElement('script');
      gtagScript.async = true;
      gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=AW-17948694584';
      document.head.appendChild(gtagScript);

      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', 'AW-17948694584');
    })();

    // TIKTOK PIXEL
    (function loadTikTokPixel(w, d, t, id) {
      if (w.__mousaTikTokLoaded) return;
      w.__mousaTikTokLoaded = true;

      w.TiktokAnalyticsObject = t;
      var ttq = w[t] = w[t] || [];
      ttq.methods = [
        'page', 'track', 'identify', 'instances', 'debug',
        'on', 'off', 'once', 'ready', 'alias', 'group',
        'enableCookie', 'disableCookie', 'holdConsent',
        'revokeConsent', 'grantConsent'
      ];
      ttq.setAndDefer = function (obj, method) {
        obj[method] = function () {
          obj.push([method].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (var i = 0; i < ttq.methods.length; i++) {
        ttq.setAndDefer(ttq, ttq.methods[i]);
      }

      ttq.load = function (pixelId, opts) {
        var url = 'https://analytics.tiktok.com/i18n/pixel/events.js';
        ttq._i = ttq._i || {};
        ttq._i[pixelId] = [];
        ttq._i[pixelId]._u = url;
        ttq._t = ttq._t || {};
        ttq._t[pixelId] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[pixelId] = opts || {};

        var script = d.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = url + '?sdkid=' + pixelId + '&lib=' + t;
        var firstScript = d.getElementsByTagName('script')[0];
        firstScript.parentNode.insertBefore(script, firstScript);
      };

      ttq.load(id);
      ttq.page();
    })(window, document, 'ttq', 'D6ON94BC77U7PMTO33SG');

    // LEAD / OTHER NON‑ESSENTIAL TAGS
    (function loadLeadTag() {
      if (window.__mousaLeadTagLoaded) return;
      window.__mousaLeadTagLoaded = true;

      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://r2.leadsy.ai/tag.js';
      s.id = 'vtag-ai-js';
      s.dataset.pid = '13svyJ0aec5qHxzuY';
      s.dataset.version = '062024';
      document.head.appendChild(s);
    })();

    // NOTE: Tally is loaded when the user reaches the form; keep as‑is.
  }

  function hideBanner() {
    var banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'none';
  }

  function showBanner() {
    var banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'block';
  }

  function applyConsent() {
    const consent = getConsent();
    if (consent && consent.accepted === true) {
      loadNonEssentialTags();
      hideBanner();
    } else if (consent && consent.accepted === false) {
      hideBanner();
      // Non‑essential tags stay disabled.
    } else {
      // No choice yet
      showBanner();
    }
  }

  function wireButtons() {
    var acceptBtn = document.getElementById('cookie-accept');
    var rejectBtn = document.getElementById('cookie-reject');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        setConsent({ accepted: true, ts: new Date().toISOString() });
        loadNonEssentialTags();
        hideBanner();
      });
    }

    if (rejectBtn) {
      rejectBtn.addEventListener('click', function () {
        setConsent({ accepted: false, ts: new Date().toISOString() });
        hideBanner();
      });
    }
  }

  function init() {
    wireButtons();
    applyConsent();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Optional: expose a small API so you can link \"Change cookie settings\" in the footer
  window.mousaCookieConsent = {
    reset: function () {
      localStorage.removeItem(CONSENT_KEY);
      showBanner();
    },
    get: getConsent
  };
})();
