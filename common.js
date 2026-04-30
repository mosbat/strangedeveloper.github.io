// common.js - Delayed Tawk.to load to avoid i18next error
(function() {
  if (window.Tawk_API && window.Tawk_LoadStart) return;

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();

  // Delay 500ms to fix i18next race condition
  setTimeout(() => {
    var s1 = document.createElement("script");
    var s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/69ca6af5ecf7021c366807d6/1jkvb3jop';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    if (s0 && s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    }
  }, 500);
})();