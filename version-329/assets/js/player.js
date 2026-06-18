(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-player]'));

  function startPlayer(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play-button]');
    var stream = player.getAttribute('data-stream');

    if (!video || !stream) {
      return;
    }

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    if (video.getAttribute('data-ready') === 'true') {
      video.play().catch(function () {});
      return;
    }

    video.setAttribute('data-ready', 'true');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      video.hlsPlayer = hls;
      return;
    }

    video.src = stream;
    video.play().catch(function () {});
  }

  players.forEach(function (player) {
    var overlay = player.querySelector('[data-play-button]');
    var video = player.querySelector('video');

    if (overlay) {
      overlay.addEventListener('click', function () {
        startPlayer(player);
      });
    }

    player.addEventListener('click', function (event) {
      if (event.target === video || event.target === player) {
        startPlayer(player);
      }
    });
  });
})();
