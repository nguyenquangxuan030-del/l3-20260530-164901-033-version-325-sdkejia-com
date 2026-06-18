(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initPlayer(root) {
    var video = root.querySelector('video');
    var overlay = root.querySelector('[data-play-overlay]');
    if (!video) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var hls = null;

    function showError() {
      if (overlay) {
        overlay.classList.remove('is-hidden');
        overlay.querySelector('strong').textContent = '重新播放';
      }
    }

    if (stream && window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          showError();
        }
      });
    } else if (stream && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    }

    function playVideo() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          showError();
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 && overlay) {
        overlay.classList.remove('is-hidden');
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
  });
})();
