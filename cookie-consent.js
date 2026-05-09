// cookie-consent.js

(function () {
  const CONSENT_KEY = 'mousaConsentV1';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag('consent', 'default', {
    'ad_storage': 'granted',
    'analytics_storage': 'granted',
    'ad_user_data': 'granted',
    'ad_personalization': 'granted',
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

  function appendScript(scriptEl) {
    if (document.head) {
      document.head.appendChild(scriptEl);
    } else if (document.body) {
      document.body.appendChild(scriptEl);
    } else {
      document.documentElement.appendChild(scriptEl);
    }
  }

  function loadNonEssentialTags() {
    // GOOGLE TAG (Ads / conversions)
    (function loadGoogleTag() {
      if (window.__mousaGoogleLoaded) return;
      window.__mousaGoogleLoaded = true;

      const gtagScript = document.createElement('script');
      gtagScript.async = true;
      gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=AW-18022556253';
      appendScript(gtagScript);

      window.gtag('js', new Date());
      window.gtag('config', 'AW-18022556253');
    })();

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

    (function loadTrafficGuard() {
      if (window.__mousaTrafficGuardLoaded) return;
      window.__mousaTrafficGuardLoaded = true;

      var dataTrafficGuard = window.dataTrafficGuard = window.dataTrafficGuard || [];
      dataTrafficGuard.push(['property_group_id', 'tg-g-024494-001']);
      dataTrafficGuard.push(['event', 'pageview']);

      var tg = document.createElement('script');
      tg.type = 'text/javascript';
      tg.async = true;
      tg.src = '//tgtag.io/tg.js?pid=tg-g-024494-001';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(tg, s);

      // Noscript fallback (always create for JS-disabled browsers)
      var noscriptImg = document.createElement('img');
      noscriptImg.src = '//p.tgtag.io/event?property_group_id=tg-g-024494-001&event=pageview&no_script=1';
      noscriptImg.width = 1;
      noscriptImg.height = 1;
      noscriptImg.border = 0;
      noscriptImg.style.display = 'none';
      (document.body || document.documentElement).appendChild(noscriptImg);
    })();

  }

  function hideBanner() {
    var banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'none';
  }

  function showBanner() {
    var banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'block';
    wireButtons();  // FIXED: Re-attach listeners
  }

  function applyConsent() {
    const consent = getConsent();
    if (consent?.accepted === true) {
      loadNonEssentialTags(); hideBanner();
    } else if (consent?.accepted === false) {
      unloadNonEssentialTags(); hideBanner();
    } else {
      loadNonEssentialTags();  // CHANGED: Default load
      showBanner();
    }
  }

  function unloadTrafficGuard() {
    // Remove main script
    const tgEl = document.querySelector('script[src*="tgtag.io/tg.js"]');
    if (tgEl) tgEl.remove();

    // Clear data array & loaded flag to prevent reload
    window.dataTrafficGuard = [];
    window.__mousaTrafficGuardLoaded = false;

    // Remove noscript fallback img
    const noscriptImg = document.querySelector('img[src*="p.tgtag.io/event"]');
    if (noscriptImg) noscriptImg.remove();
  }

  function wireButtons() {
    var acceptBtn = document.getElementById('cookie-accept');
    var rejectBtn = document.getElementById('cookie-reject');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        setConsent({ accepted: true, ts: new Date().toISOString() });
        updateConsentSignals(true);
        loadNonEssentialTags();
        hideBanner();
      });
    }

    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => {
        setConsent({ accepted: false, ts: new Date().toISOString() });
        updateConsentSignals(false);
        unloadNonEssentialTags();  // Immediate stop
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
    if (gtagEl) gtagEl.remove(); delete window.gtag; window.mousaGoogleLoaded = false;

    // TikTok  
    const ttqEl = document.querySelector('script[src*="tiktok.com/i18n/pixel"]');
    if (ttqEl) ttqEl.remove(); delete window.ttq; window.mousaTikTokLoaded = false;

    // TrafficGuard (NEW)
    unloadTrafficGuard();

    window.dataLayer = [];  // Clear events

    const commonDomain = window.location.hostname.replace(/^www\./, '');
    const cookieExpire = 'Thu, 01 Jan 1970 00:00:00 GMT';

    // Google Analytics/Ads (all variants)
    ['_ga', '_gid', '_gat', '_gcl_au', '_gcl_aw'].forEach(name => {
      document.cookie = `${name}=; expires=${cookieExpire}; path=/; domain=${commonDomain}`;
      document.cookie = `${name}=; expires=${cookieExpire}; path=/; domain=.${commonDomain}`;
      document.cookie = `${name}=; expires=${cookieExpire}; path=/`;
    });

    // TikTok Pixel
    ['_tt_enable_cookie', '_ttp', 'tt_webid', 'tt_webid_v2', '_tth_s'].forEach(name => {
      document.cookie = `${name}=; expires=${cookieExpire}; path=/; domain=${commonDomain}`;
      document.cookie = `${name}=; expires=${cookieExpire}; path=/; domain=.${commonDomain}`;
      document.cookie = `${name}=; expires=${cookieExpire}; path=/`;
    });

    // TrafficGuard (common patterns; verify in your Network tab)
    ['tg_session', 'tg_visitor', '__tg'].forEach(name => {
      document.cookie = `${name}=; expires=${cookieExpire}; path=/; domain=${commonDomain}`;
      document.cookie = `${name}=; expires=${cookieExpire}; path=/; domain=.${commonDomain}`;
      document.cookie = `${name}=; expires=${cookieExpire}; path=/`;
    });
  }
})();