// cookie-consent.js

(function () {
  const CONSENT_KEY = 'mousaConsentV1';

  // Ensure dataLayer and gtag are defined
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  // Set default consent (non‑personalized, no cookies)
  window.gtag('consent', 'default', {
    'ad_storage': 'denied',           // ← should be denied by default
    'analytics_storage': 'denied',    // ← should be denied by default
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'wait_for_update': 500
  });

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

  function updateConsentSignals(accepted) {
    if (!window.gtag) return;
    const status = accepted ? 'granted' : 'denied';
    window.gtag('consent', 'update', {
      'ad_storage': status,
      'analytics_storage': status,
      'ad_user_data': status,
      'ad_personalization': status
    });
  }

  function appendScript(src) {
    const script = document.createElement('script');
    script.async = true;
    script.src = src;
    document.documentElement.appendChild(script);
  }

  function loadNonEssentialTags() {
    // GOOGLE TAG (Ads / conversions)
    (function loadGoogleTag() {
      if (window.__mousaGoogleLoaded) return;
      window.__mousaGoogleLoaded = true;

      const gtagScript = document.createElement('script');
      gtagScript.async = true;
      gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=AW-18022556253';
      appendScript(gtagScript.src);     // ← bug: this should be gtagScript, not its .src

      window.gtag('js', new Date());
      window.gtag('config', 'AW-18022556253');
    })();

    // REDDIT PIXEL
    (function loadRedditPixel(w, d) {
      if (w.__mousaRedditLoaded) return;
      w.__mousaRedditLoaded = true;

      !function (w, d) {
        if (!w.rdt) {
          var p = w.rdt = function () {
            p.sendEvent ? p.sendEvent.apply(p, arguments) : p.callQueue.push(arguments);
          };
          p.callQueue = [];
          var t = d.createElement("script");
          t.src = "https://www.redditstatic.com/ads/pixel.js?pixel_id=a2_j5ffqn1rq630";
          t.async = true;
          var s = d.getElementsByTagName("script")[0];
          if (s && s.parentNode) {
            s.parentNode.insertBefore(t, s);
          } else {
            (d.head || d.documentElement).appendChild(t);
          }
        }
      }(w, d);

      w.rdt('init', 'a2_j5ffqn1rq630');
      w.rdt('track', 'PageVisit');
    })(window, document);

    // TIKTOK PIXEL
    (function loadTikTokPixel(w, d, t, id) {
      if (w.__mousaTikTokLoaded) return;
      w.__mousaTikTokLoaded = true;

      w.TiktokAnalyticsObject = t;
      var ttq = (w[t] = w[t] || []);

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
        ttq._i[pixelId] = ttq._i[pixelId] || [];
        ttq._i[pixelId]._u = url;
        ttq._t = ttq._t || {};
        ttq._t[pixelId] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[pixelId] = opts || {};

        var script = d.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = url + '?sdkid=' + pixelId + '&lib=' + t;
        script.onerror = function () {
          console.warn('TikTok Pixel script failed to load:', script.src);
        };

        var firstScript = d.getElementsByTagName('script')[0];
        if (firstScript && firstScript.parentNode) {
          firstScript.parentNode.insertBefore(script, firstScript);
        } else if (d.head) {
          d.head.appendChild(script);
        } else if (d.body) {
          d.body.appendChild(script);
        } else {
          d.documentElement.appendChild(script);
        }
      };

      try {
        ttq.load(id);
        ttq.page();
      } catch (e) {
        console.warn('TikTok Pixel failed to initialize:', e);
      }
    })(window, document, 'ttq', 'D6ON94BC77U7PMTO33SG');
  }

  function hideBanner() {
    var banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'none';
  }

  function showBanner() {
    var banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'block';
    wireButtons(); // Re‑attach listeners
  }

  function applyConsent() {
    const consent = getConsent();
    if (consent?.accepted === true) {
      loadNonEssentialTags();
      hideBanner();
    } else if (consent?.accepted === false) {
      hideBanner();
    } else {
      showBanner();
    }
  }

  function wireButtons() {
    var acceptBtn = document.getElementById('cookie-accept');
    var rejectBtn = document.getElementById('cookie-reject');

    if (acceptBtn) {
      // Remove any existing listeners to avoid duplicates
      acceptBtn.removeEventListener('click', acceptClickHandler);
      acceptBtn.addEventListener('click', acceptClickHandler);
    }

    if (rejectBtn) {
      // Remove any existing listeners
      rejectBtn.removeEventListener('click', rejectClickHandler);
      rejectBtn.addEventListener('click', rejectClickHandler);
    }

    function acceptClickHandler() {
      setConsent({ accepted: true, ts: new Date().toISOString() });
      updateConsentSignals(true);
      loadNonEssentialTags();
      hideBanner();
    }

    function rejectClickHandler() {
      setConsent({ accepted: false, ts: new Date().toISOString() });
      updateConsentSignals(false);
      unloadNonEssentialTags(); // Immediate stop
      hideBanner();
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

  window.mousaCookieConsent = {
    reset: function () {
      try {
        localStorage.removeItem(CONSENT_KEY);
      } catch (e) {
        // localStorage might be blocked; fail quietly
      }
      showBanner();
    },
    get: getConsent
  };

  function unloadNonEssentialTags() {
    // Google
    const gtagEl = document.querySelector('script[src*="googletagmanager.com/gtag"]');
    if (gtagEl) gtagEl.remove();

    // Remove any global gtag‑related flags
    window.__mousaGoogleLoaded = false;

    // TikTok
    const ttqEl = document.querySelector('script[src*="tiktok.com/i18n/pixel"]');
    if (ttqEl) ttqEl.remove();

    // Remove TikTok global setup
    delete window.TiktokAnalyticsObject;
    delete window.ttq;
    window.__mousaTikTokLoaded = false;

    // Clear events queue
    window.dataLayer = [];

    const commonDomain = window.location.hostname.replace(/^www\./, '');
    const cookieExpire = 'Thu, 01 Jan 1970 00:00:00 GMT';

    // Google Analytics/Ads (all variants)
    ['_ga', '_gid', '_gat', '_gcl_au', '_gcl_aw'].forEach(name => {
      document.cookie = `${name}=; expires=${cookieExpire}; path=/; domain=${commonDomain}; secure; samesite=strict`;
      document.cookie = `${name}=; expires=${cookieExpire}; path=/; domain=.${commonDomain}; secure; samesite=strict`;
      document.cookie = `${name}=; expires=${cookieExpire}; path=/; secure; samesite=strict`;
    });

    // TikTok Pixel
    ['_tt_enable_cookie', '_ttp', 'tt_webid', 'tt_webid_v2', '_tth_s'].forEach(name => {
      document.cookie = `${name}=; expires=${cookieExpire}; path=/; domain=${commonDomain}; secure; samesite=strict`;
      document.cookie = `${name}=; expires=${cookieExpire}; path=/; domain=.${commonDomain}; secure; samesite=strict`;
      document.cookie = `${name}=; expires=${cookieExpire}; path=/; secure; samesite=strict`;
    });

    // Reddit
    const redditEl = document.querySelector('script[src*="redditstatic.com/ads/pixel.js"]');
    if (redditEl) redditEl.remove();

    delete window.rdt;
    window.__mousaRedditLoaded = false;
  }
})();