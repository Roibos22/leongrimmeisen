window.onload = function() {
    if (window.location.pathname.endsWith('/index.html')) {
      window.history.replaceState({}, document.title, window.location.pathname.slice(0, -11));
  