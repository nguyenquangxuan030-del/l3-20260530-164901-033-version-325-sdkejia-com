(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
            return;
        }
        fn();
    }

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var open = menu.classList.toggle("open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var next = hero.querySelector("[data-hero-next]");
        var prev = hero.querySelector("[data-hero-prev]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        start();
    }

    function initFilters() {
        var input = document.querySelector("[data-filter-input]");
        var year = document.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
        if (!input || !cards.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q");
        if (initial) {
            input.value = initial;
        }

        function apply() {
            var query = input.value.trim().toLowerCase();
            var selectedYear = year ? year.value : "";
            cards.forEach(function (card) {
                var haystack = card.getAttribute("data-search") || "";
                var cardYear = card.getAttribute("data-year") || "";
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchYear = !selectedYear || cardYear === selectedYear;
                card.classList.toggle("is-filter-hidden", !(matchQuery && matchYear));
            });
        }

        input.addEventListener("input", apply);
        if (year) {
            year.addEventListener("change", apply);
        }
        apply();
    }

    window.initMoviePlayer = function (url) {
        var video = document.querySelector("[data-player]");
        var overlay = document.querySelector("[data-player-overlay]");
        if (!video || !url) {
            return;
        }
        var hlsInstance = null;
        var loaded = false;

        function playVideo() {
            var playRequest = video.play();
            if (playRequest && typeof playRequest.catch === "function") {
                playRequest.catch(function () {});
            }
        }

        function load() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            if (loaded) {
                playVideo();
                return;
            }
            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                video.load();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                return;
            }

            video.src = url;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
            video.load();
        }

        if (overlay) {
            overlay.addEventListener("click", load);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                load();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
