/* ============================================================
   Navigation toggle
   ============================================================ */
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
})();

/* ============================================================
   Publications page — tabs, filtering, sort, BibTeX export
   ============================================================ */
(function () {
  var tabs = document.querySelectorAll('.pub-tab-btn');
  var items = document.querySelectorAll('.pub-list-item');
  var countEl = document.querySelector('.pub-count');
  var searchEl = document.getElementById('pub-search');
  var sortEl = document.getElementById('pub-sort');
  var yearContainer = document.getElementById('year-filter-list');
  var bibtexBtn = document.getElementById('btn-bibtex');
  var resetBtn = document.getElementById('btn-reset');

  if (!tabs.length) return;

  var state = { tab: 'all', search: '', years: [], sort: 'newest' };

  /* ---------- helpers ---------- */
  function activeTab() {
    var hash = location.hash.replace('#', '');
    return hash || 'all';
  }

  function getText(el) {
    return (el.dataset.text || el.textContent || '').toLowerCase();
  }

  function applyFilters() {
    var visibleCount = 0;
    items.forEach(function (item) {
      var tabMatch = state.tab === 'all' || item.dataset.tab === state.tab;
      var textMatch = !state.search || getText(item).includes(state.search);
      var year = item.dataset.year;
      var yearMatch = !state.years.length || state.years.includes(year);
      var show = tabMatch && textMatch && yearMatch;
      item.classList.toggle('hidden', !show);
      if (show) visibleCount++;
    });
    if (countEl) countEl.textContent = visibleCount + ' of ' + items.length + ' results';
    applySort();
  }

  function applySort() {
    var list = document.querySelector('.pub-list');
    if (!list) return;
    var visible = Array.from(items).filter(function (i) { return !i.classList.contains('hidden'); });
    visible.sort(function (a, b) {
      var ya = parseInt(a.dataset.year) || 0;
      var yb = parseInt(b.dataset.year) || 0;
      var ta = (a.dataset.sortTitle || '').toLowerCase();
      var tb = (b.dataset.sortTitle || '').toLowerCase();
      if (state.sort === 'newest') return yb - ya;
      if (state.sort === 'oldest') return ya - yb;
      if (state.sort === 'title-az') return ta < tb ? -1 : ta > tb ? 1 : 0;
      if (state.sort === 'title-za') return tb < ta ? -1 : tb > ta ? 1 : 0;
      return 0;
    });
    visible.forEach(function (el) { list.appendChild(el); });
  }

  /* ---------- tab clicks ---------- */
  tabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.tab = btn.dataset.tab;
      tabs.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      history.replaceState(null, '', '#' + state.tab);
      applyFilters();
    });
  });

  /* ---------- search ---------- */
  if (searchEl) {
    searchEl.addEventListener('input', function () {
      state.search = searchEl.value.toLowerCase().trim();
      applyFilters();
    });
  }

  /* ---------- year checkboxes ---------- */
  if (yearContainer) {
    yearContainer.addEventListener('change', function () {
      state.years = Array.from(yearContainer.querySelectorAll('input:checked')).map(function (cb) { return cb.value; });
      applyFilters();
    });
  }

  /* ---------- sort ---------- */
  if (sortEl) {
    sortEl.addEventListener('change', function () {
      state.sort = sortEl.value;
      applyFilters();
    });
  }

  /* ---------- bibtex export ---------- */
  if (bibtexBtn) {
    bibtexBtn.addEventListener('click', function () {
      var bibtex = [];
      items.forEach(function (item) {
        if (!item.classList.contains('hidden')) {
          var bib = item.dataset.bibtex;
          if (bib) bibtex.push(decodeURIComponent(bib));
        }
      });
      var blob = new Blob([bibtex.join('\n\n')], { type: 'text/plain' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'abott-publications.bib';
      a.click();
    });
  }

  /* ---------- reset ---------- */
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      state.search = ''; state.years = []; state.sort = 'newest';
      if (searchEl) searchEl.value = '';
      if (yearContainer) yearContainer.querySelectorAll('input').forEach(function (cb) { cb.checked = false; });
      if (sortEl) sortEl.value = 'newest';
      applyFilters();
    });
  }

  /* ---------- init from hash ---------- */
  var initTab = activeTab();
  tabs.forEach(function (btn) {
    if (btn.dataset.tab === initTab) {
      btn.classList.add('active');
      state.tab = initTab;
    } else {
      btn.classList.remove('active');
    }
  });
  applyFilters();
})();
