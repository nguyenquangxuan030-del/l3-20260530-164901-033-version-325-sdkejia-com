(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var backTop = document.querySelector('.back-top');
  if (backTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 360) {
        backTop.classList.add('is-visible');
      } else {
        backTop.classList.remove('is-visible');
      }
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;
  var heroTimer = null;
  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === heroIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === heroIndex);
    });
  }
  function startHero() {
    if (slides.length < 2) {
      return;
    }
    clearInterval(heroTimer);
    heroTimer = setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  if (prev) {
    prev.addEventListener('click', function () {
      showHero(heroIndex - 1);
      startHero();
    });
  }
  if (next) {
    next.addEventListener('click', function () {
      showHero(heroIndex + 1);
      startHero();
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showHero(i);
      startHero();
    });
  });
  showHero(0);
  startHero();

  document.querySelectorAll('[data-filter-list]').forEach(function (bar) {
    var section = bar.parentElement;
    var queryInput = bar.querySelector('.local-filter');
    var yearSelect = bar.querySelector('.year-filter');
    var regionSelect = bar.querySelector('.region-filter');
    var cards = Array.prototype.slice.call(section.querySelectorAll('[data-title]'));
    var years = [];
    var regions = [];
    cards.forEach(function (card) {
      var year = card.getAttribute('data-year') || '';
      var region = card.getAttribute('data-region') || '';
      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }
      if (region && regions.indexOf(region) === -1) {
        regions.push(region);
      }
    });
    years.sort(function (a, b) { return Number(b) - Number(a); });
    regions.sort();
    years.forEach(function (year) {
      var option = document.createElement('option');
      option.value = year;
      option.textContent = year + '年';
      yearSelect.appendChild(option);
    });
    regions.forEach(function (region) {
      var option = document.createElement('option');
      option.value = region;
      option.textContent = region;
      regionSelect.appendChild(option);
    });
    function applyFilter() {
      var q = (queryInput.value || '').trim().toLowerCase();
      var y = yearSelect.value;
      var r = regionSelect.value;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var visible = true;
        if (q && haystack.indexOf(q) === -1) {
          visible = false;
        }
        if (y && card.getAttribute('data-year') !== y) {
          visible = false;
        }
        if (r && card.getAttribute('data-region') !== r) {
          visible = false;
        }
        card.hidden = !visible;
      });
    }
    queryInput.addEventListener('input', applyFilter);
    yearSelect.addEventListener('change', applyFilter);
    regionSelect.addEventListener('change', applyFilter);
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.play-overlay');
    var src = player.getAttribute('data-src');
    var ready = false;
    function prepare() {
      if (ready || !video || !src) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }
    function playVideo() {
      prepare();
      if (overlay) {
        overlay.classList.add('hidden');
      }
      video.setAttribute('controls', 'controls');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove('hidden');
          }
        });
      }
    }
    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('hidden');
        }
      });
    }
  });

  var searchResults = document.getElementById('searchResults');
  var searchInput = document.getElementById('searchInput');
  if (searchResults && window.SEARCH_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (searchInput) {
      searchInput.value = initial;
      searchInput.addEventListener('input', function () {
        renderSearch(searchInput.value);
      });
    }
    renderSearch(initial);
  }

  function renderSearch(query) {
    var q = (query || '').trim().toLowerCase();
    searchResults.innerHTML = '';
    if (!q) {
      return;
    }
    var results = window.SEARCH_INDEX.filter(function (item) {
      return item.search.indexOf(q) !== -1;
    }).slice(0, 80);
    results.forEach(function (item) {
      var article = document.createElement('article');
      article.className = 'movie-card';
      article.setAttribute('data-title', item.title);
      article.setAttribute('data-year', item.year);
      article.setAttribute('data-region', item.region);
      article.setAttribute('data-type', item.type);
      article.innerHTML = [
        '<a class="card-cover" href="' + item.url + '">',
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '<span class="card-play">▶</span>',
        '<span class="card-badge">' + item.year + '</span>',
        '</a>',
        '<div class="card-body">',
        '<div class="card-tags"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
        '<h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>',
        '<p>' + escapeHtml(item.oneLine) + '</p>',
        '<div class="card-foot"><a href="' + item.categoryUrl + '">' + escapeHtml(item.category) + '</a><a href="' + item.url + '">播放</a></div>',
        '</div>'
      ].join('');
      searchResults.appendChild(article);
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
