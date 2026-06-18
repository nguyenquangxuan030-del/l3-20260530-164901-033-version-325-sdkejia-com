(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    show(0);
    restart();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initCardFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]'));
    panels.forEach(function (panel) {
      var container = panel.parentElement.querySelector('[data-card-container]');
      if (!container) {
        return;
      }
      var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));
      var keyword = panel.querySelector('[data-filter-keyword]');
      var year = panel.querySelector('[data-filter-year]');
      var region = panel.querySelector('[data-filter-region]');
      var years = Array.from(new Set(cards.map(function (card) { return card.dataset.year; }).filter(Boolean))).sort(function (a, b) { return Number(b) - Number(a); });
      var regions = Array.from(new Set(cards.map(function (card) { return card.dataset.region; }).filter(Boolean))).sort();
      fillSelect(year, years);
      fillSelect(region, regions);

      function apply() {
        var q = keyword ? keyword.value.trim().toLowerCase() : '';
        var y = year ? year.value : '';
        var r = region ? region.value : '';
        cards.forEach(function (card) {
          var haystack = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.genre].join(' ').toLowerCase();
          var visible = (!q || haystack.indexOf(q) !== -1) && (!y || card.dataset.year === y) && (!r || card.dataset.region === r);
          card.style.display = visible ? '' : 'none';
        });
      }

      [keyword, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function cardHtml(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="movie-card__poster" href="' + escapeHtml(movie.file) + '" aria-label="' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="movie-card__badge">' + escapeHtml(movie.type) + '</span>',
      '  </a>',
      '  <div class="movie-card__body">',
      '    <a class="movie-card__title" href="' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a>',
      '    <div class="movie-card__meta">',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.year) + '年</span>',
      '    </div>',
      '    <p class="movie-card__desc">' + escapeHtml(movie.oneLine) + '</p>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');
    var form = document.querySelector('[data-search-page-form]');
    if (!results || !summary || typeof MOVIE_SEARCH_INDEX === 'undefined') {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    var input = form ? form.querySelector('input[name="q"]') : null;
    if (input) {
      input.value = q;
    }
    if (!q) {
      return;
    }
    var lower = q.toLowerCase();
    var matched = MOVIE_SEARCH_INDEX.filter(function (movie) {
      return movie.searchText.toLowerCase().indexOf(lower) !== -1;
    });
    summary.textContent = '关键词“' + q + '”找到 ' + matched.length + ' 个结果';
    results.innerHTML = matched.slice(0, 240).map(cardHtml).join('\n');
    if (matched.length > 240) {
      summary.textContent += '，当前显示前 240 个结果';
    }
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initCardFilters();
    initSearchPage();
  });
})();
