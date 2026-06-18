(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === heroIndex);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === heroIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(heroIndex + 1);
    }, 6200);
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-search]'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var activeFilter = 'all';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function runFilter() {
    if (!cards.length) {
      return;
    }

    var query = normalize(searchInputs.map(function (input) {
      return input.value;
    }).join(' '));
    var filter = normalize(activeFilter);
    var visible = 0;

    cards.forEach(function (card) {
      var blob = normalize(card.getAttribute('data-search'));
      var matchesQuery = !query || blob.indexOf(query) !== -1;
      var matchesFilter = filter === 'all' || blob.indexOf(filter) !== -1;
      var ok = matchesQuery && matchesFilter;
      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';
  if (initialQuery && searchInputs.length) {
    searchInputs.forEach(function (input) {
      input.value = initialQuery;
    });
    runFilter();
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', runFilter);
  });

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter-value') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      runFilter();
    });
  });
})();
