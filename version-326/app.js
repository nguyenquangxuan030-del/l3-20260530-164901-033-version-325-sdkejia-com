(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function one(selector, root) {
        return (root || document).querySelector(selector);
    }

    var menuButton = one('[data-menu-toggle]');
    var mobilePanel = one('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    all('[data-global-search]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    });

    function applyLocalSearch(input) {
        var value = input.value.trim().toLowerCase();
        all('[data-movie-card]').forEach(function (card) {
            var haystack = ((card.getAttribute('data-search') || '') + ' ' + card.textContent).toLowerCase();
            card.classList.toggle('is-filtered-out', value && haystack.indexOf(value) === -1);
        });
    }

    all('.local-search').forEach(function (input) {
        input.addEventListener('input', function () {
            applyLocalSearch(input);
        });
    });

    var mainSearch = one('.local-search--main');
    if (mainSearch) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (query) {
            mainSearch.value = query;
            applyLocalSearch(mainSearch);
        }
    }

    all('[data-hero-carousel]').forEach(function (carousel) {
        var slides = all('[data-hero-slide]', carousel);
        var dots = all('[data-hero-dot]', carousel);
        var prev = one('[data-hero-prev]', carousel);
        var next = one('[data-hero-next]', carousel);
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function move(step) {
            show(index + step);
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                move(1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                move(-1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                move(1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    var backTop = one('[data-back-top]');
    if (backTop) {
        window.addEventListener('scroll', function () {
            backTop.classList.toggle('is-visible', window.scrollY > 420);
        });
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
})();

window.initDetailPlayer = function (streamUrl) {
    var video = document.getElementById('movie-player');
    var overlay = document.querySelector('[data-player-overlay]');
    var hlsInstance = null;
    var ready = false;

    function bind() {
        if (ready || !video || !streamUrl) {
            return;
        }
        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = streamUrl;
    }

    function play() {
        if (!video) {
            return;
        }
        bind();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener('click', play);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
            hlsInstance.destroy();
        }
    });
};
