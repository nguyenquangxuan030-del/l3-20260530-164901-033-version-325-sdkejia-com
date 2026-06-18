import { H as Hls } from './video-player-dru42stk.js';

const menuButton = document.querySelector('[data-menu-button]');
const mobileNav = document.querySelector('[data-mobile-nav]');

if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
        mobileNav.classList.toggle('is-open');
    });
}

const slider = document.querySelector('[data-hero-slider]');

if (slider) {
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    const previous = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    let index = 0;

    const showSlide = (nextIndex) => {
        if (!slides.length) {
            return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === index);
        });
    };

    previous?.addEventListener('click', () => showSlide(index - 1));
    next?.addEventListener('click', () => showSlide(index + 1));
    dots.forEach((dot) => {
        dot.addEventListener('click', () => showSlide(Number(dot.dataset.heroDot || 0)));
    });
    window.setInterval(() => showSlide(index + 1), 5000);
}

const getText = (element, name) => (element.dataset[name] || '').toLowerCase();
const searchParams = new URLSearchParams(window.location.search);
const initialQuery = searchParams.get('q') || '';

const filterInput = document.querySelector('[data-filter-input]');
const filterYear = document.querySelector('[data-filter-year]');
const filterType = document.querySelector('[data-filter-type]');
const filterRegion = document.querySelector('[data-filter-region]');
const filterCount = document.querySelector('[data-filter-count]');
const cards = Array.from(document.querySelectorAll('.searchable-card'));

if (filterInput && initialQuery) {
    filterInput.value = initialQuery;
}

const applyFilters = () => {
    const query = (filterInput?.value || '').trim().toLowerCase();
    const year = filterYear?.value || '全部年份';
    const type = filterType?.value || '全部类型';
    const region = filterRegion?.value || '全部地区';
    let visible = 0;

    cards.forEach((card) => {
        const haystack = [
            getText(card, 'title'),
            getText(card, 'region'),
            getText(card, 'type'),
            getText(card, 'tags'),
            getText(card, 'year')
        ].join(' ');
        const matchesQuery = !query || haystack.includes(query);
        const matchesYear = year === '全部年份' || getText(card, 'year') === year.toLowerCase();
        const matchesType = type === '全部类型' || getText(card, 'type').includes(type.toLowerCase());
        const matchesRegion = region === '全部地区' || getText(card, 'region').includes(region.toLowerCase());
        const matched = matchesQuery && matchesYear && matchesType && matchesRegion;
        card.classList.toggle('is-hidden', !matched);
        if (matched) {
            visible += 1;
        }
    });

    if (filterCount) {
        filterCount.textContent = cards.length ? `当前显示 ${visible} / ${cards.length} 部影片` : '';
    }
};

[filterInput, filterYear, filterType, filterRegion].forEach((control) => {
    control?.addEventListener('input', applyFilters);
    control?.addEventListener('change', applyFilters);
});

if (cards.length) {
    applyFilters();
}

const players = Array.from(document.querySelectorAll('.js-player'));

players.forEach((root) => {
    const video = root.querySelector('video');
    const url = root.dataset.play;
    const cover = root.querySelector('.player-cover');
    const toggle = root.querySelector('[data-player-toggle]');
    const mute = root.querySelector('[data-player-mute]');
    const fullscreen = root.querySelector('[data-player-fullscreen]');
    let ready = false;
    let hls = null;

    const load = () => {
        if (ready || !video || !url) {
            return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        } else if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
        } else {
            video.src = url;
        }
    };

    const play = async () => {
        load();
        root.classList.add('is-playing');
        try {
            await video.play();
        } catch (error) {
            root.classList.remove('is-playing');
        }
    };

    const togglePlay = () => {
        if (!video) {
            return;
        }
        if (video.paused) {
            play();
        } else {
            video.pause();
        }
    };

    cover?.addEventListener('click', play);
    video?.addEventListener('click', togglePlay);
    toggle?.addEventListener('click', togglePlay);
    mute?.addEventListener('click', () => {
        if (!video) {
            return;
        }
        video.muted = !video.muted;
        mute.textContent = video.muted ? '取消静音' : '静音';
    });
    fullscreen?.addEventListener('click', () => {
        if (!video) {
            return;
        }
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            video.requestFullscreen?.();
        }
    });
    video?.addEventListener('play', () => {
        root.classList.add('is-playing');
        if (toggle) {
            toggle.textContent = '暂停';
        }
    });
    video?.addEventListener('pause', () => {
        if (toggle) {
            toggle.textContent = '播放';
        }
    });
    window.addEventListener('beforeunload', () => {
        if (hls) {
            hls.destroy();
        }
    });
});
