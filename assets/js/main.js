window.onload = function() {
    // Check for URLs ending with /index.html
    if (window.location.pathname.endsWith('/index.html')) {
      window.history.replaceState({}, document.title, window.location.pathname.slice(0, -11));
    }
  };