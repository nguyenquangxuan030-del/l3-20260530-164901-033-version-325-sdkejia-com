(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    var showSlide = function (index) {
      active = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide((active + 1) % slides.length);
      }, 5000);
    }
  }

  var filterInput = document.querySelector('.js-filter-input');
  var filterScope = document.querySelector('[data-filter-scope]');

  if (filterInput && filterScope) {
    var cards = Array.prototype.slice.call(filterScope.querySelectorAll('.movie-card'));
    filterInput.addEventListener('input', function () {
      var value = filterInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        card.hidden = value && haystack.indexOf(value) === -1;
      });
    });
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));

  players.forEach(function (frame) {
    var video = frame.querySelector('video');
    var button = frame.querySelector('.play-layer');
    var source = frame.getAttribute('data-source');

    if (!video || !source) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      video.src = source;
    }

    var playVideo = function () {
      var request = video.play();
      frame.classList.add('playing');
      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          frame.classList.remove('playing');
        });
      }
    };

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
      frame.classList.add('playing');
    });

    video.addEventListener('pause', function () {
      frame.classList.remove('playing');
    });
  });
})();
