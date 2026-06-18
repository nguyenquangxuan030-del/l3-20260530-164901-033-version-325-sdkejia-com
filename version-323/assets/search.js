(function () {
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var title = document.querySelector('[data-search-title]');

  if (!form || !input || !results || !Array.isArray(searchItems)) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var preset = params.get('q') || '';
  input.value = preset;

  var makeCard = function (item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-wrap" href="' + escapeHtml(item.url) + '">',
      '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '    <span class="score">' + escapeHtml(item.rating) + '</span>',
      '  </a>',
      '  <div class="card-content">',
      '    <div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
      '    <h2><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>',
      '    <p>' + escapeHtml(item.oneLine || item.summary) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  };

  var render = function (query) {
    var value = (query || '').trim().toLowerCase();
    var matched = searchItems.filter(function (item) {
      if (!value) {
        return true;
      }
      return [
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        item.summary,
        item.oneLine,
        (item.tags || []).join(' ')
      ].join(' ').toLowerCase().indexOf(value) !== -1;
    }).slice(0, 96);

    title.textContent = value ? '搜索结果' : '精选影片';
    results.innerHTML = matched.map(makeCard).join('');
  };

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var value = input.value.trim();
    var nextUrl = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
    window.history.replaceState(null, '', nextUrl);
    render(value);
  });

  input.addEventListener('input', function () {
    render(input.value);
  });

  render(preset);

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
