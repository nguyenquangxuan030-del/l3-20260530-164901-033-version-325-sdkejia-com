
(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.textContent = isOpen ? '×' : '☰';
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 6200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        play();
      });
    });

    show(0);
    play();
  }

  const searchPage = document.querySelector('[data-search-page]');

  if (searchPage) {
    const input = searchPage.querySelector('[data-search-input]');
    const region = searchPage.querySelector('[data-region-filter]');
    const category = searchPage.querySelector('[data-category-filter]');
    const cards = Array.from(searchPage.querySelectorAll('.search-item'));
    const visibleCount = searchPage.querySelector('[data-visible-count]');
    const empty = searchPage.querySelector('.empty-state');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      const query = normalize(input ? input.value : '');
      const selectedRegion = region ? region.value : 'all';
      const selectedCategory = category ? category.value : 'all';
      let count = 0;

      cards.forEach(function (card) {
        const text = normalize(card.getAttribute('data-search'));
        const regionValue = card.getAttribute('data-region');
        const categoryValue = card.getAttribute('data-category');
        const matchesQuery = !query || text.includes(query);
        const matchesRegion = selectedRegion === 'all' || regionValue === selectedRegion;
        const matchesCategory = selectedCategory === 'all' || categoryValue === selectedCategory;
        const isVisible = matchesQuery && matchesRegion && matchesCategory;

        card.style.display = isVisible ? '' : 'none';

        if (isVisible) {
          count += 1;
        }
      });

      if (visibleCount) {
        visibleCount.textContent = String(count);
      }

      if (empty) {
        empty.classList.toggle('is-visible', count === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    if (region) {
      region.addEventListener('change', apply);
    }

    if (category) {
      category.addEventListener('change', apply);
    }

    apply();
  }
})();
