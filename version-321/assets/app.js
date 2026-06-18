function setupMobileMenu() {
    const button = document.querySelector('[data-menu-toggle]');
    const links = document.querySelector('[data-nav-links]');
    if (!button || !links) {
        return;
    }
    button.addEventListener('click', function () {
        links.classList.toggle('open');
    });
}

function setupHeroSlider() {
    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    const prev = document.querySelector('[data-hero-prev]');
    const next = document.querySelector('[data-hero-next]');
    if (slides.length === 0) {
        return;
    }
    let current = 0;
    let timer = null;
    const activate = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    };
    const start = function () {
        stop();
        timer = window.setInterval(function () {
            activate(current + 1);
        }, 5200);
    };
    const stop = function () {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    };
    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            activate(index);
            start();
        });
    });
    if (prev) {
        prev.addEventListener('click', function () {
            activate(current - 1);
            start();
        });
    }
    if (next) {
        next.addEventListener('click', function () {
            activate(current + 1);
            start();
        });
    }
    const slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
    }
    activate(0);
    start();
}

function setupSearch() {
    const input = document.querySelector('[data-search-input]');
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const status = document.querySelector('[data-search-status]');
    if (!input || cards.length === 0) {
        return;
    }
    const filterCards = function () {
        const query = input.value.trim().toLowerCase();
        let visible = 0;
        cards.forEach(function (card) {
            const text = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-category') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-tags') || '',
                card.textContent || ''
            ].join(' ').toLowerCase();
            const matched = query === '' || text.indexOf(query) !== -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });
        if (status) {
            status.textContent = query ? '匹配到 ' + visible + ' 部影片' : '';
        }
    };
    input.addEventListener('input', filterCards);
    filterCards();
}

function initMoviePlayer(videoUrl) {
    const video = document.getElementById('movie-video');
    const overlay = document.getElementById('play-overlay');
    if (!video || !videoUrl) {
        return;
    }
    let hlsInstance = null;
    const canUseNative = video.canPlayType('application/vnd.apple.mpegurl');
    if (canUseNative) {
        video.src = videoUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
    } else {
        video.src = videoUrl;
    }
    const playVideo = function () {
        if (overlay) {
            overlay.classList.add('hidden');
        }
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    };
    if (overlay) {
        overlay.addEventListener('click', playVideo);
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    });
    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('hidden');
        }
    });
    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

setupMobileMenu();
setupHeroSlider();
setupSearch();
