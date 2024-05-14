  window.addEventListener('scroll', function() {
    const footer = document.querySelector('footer');
    const body = document.body;
    const scrollHeight = body.scrollHeight;
    const windowHeight = window.innerHeight;
    const scrollTop = window.scrollY;

    if (scrollTop + windowHeight >= scrollHeight) {
      footer.style.visibility = 'visible';
    } else {
      footer.style.visibility = 'hidden';
    }
  });
