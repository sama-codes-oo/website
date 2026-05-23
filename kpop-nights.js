// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Same setup as watch-parties.js — replace SHEET_ID with your Google Sheet ID
// Sheet columns: title | date (YYYY-MM-DD) | city | venue | status | image_url
//                description | rsvp_link | recap_link | rating | category | featured

const SHEET_ID = '';

// ─── SAMPLE DATA (shown when SHEET_ID is empty or fetch fails) ───────────────
const SAMPLE_EVENTS = [
  {
    title: 'NewJeans Comeback Night',
    date: '2026-06-14',
    city: 'Mumbai',
    venue: 'Café Indie, Bandra',
    status: 'upcoming',
    imageUrl: '',
    description: 'Live reaction screening for the NewJeans comeback with fan games, themed snacks, and a playlist warm-up.',
    rsvpLink: '',
    recapLink: '',
    rating: '',
    category: 'K-pop Crossover Night',
    featured: true
  },
  {
    title: 'SEVENTEEN Fan Playlist Night',
    date: '2026-07-05',
    city: 'Delhi',
    venue: 'TBA',
    status: 'upcoming',
    imageUrl: '',
    description: 'A full evening of Seventeen deep cuts, fan-curated setlists, and photocard trading.',
    rsvpLink: '',
    recapLink: '',
    rating: '',
    category: 'K-pop Crossover Night',
    featured: false
  },
  {
    title: 'Multi-Fandom Game Night',
    date: '2026-07-19',
    city: 'Bangalore',
    venue: 'TBA',
    status: 'upcoming',
    imageUrl: '',
    description: 'Fandom trivia, photocard bingo, cover dance watch-along, and group playlist voting.',
    rsvpLink: '',
    recapLink: '',
    rating: '',
    category: 'K-pop Crossover Night',
    featured: false
  },
  {
    title: 'BTS Anthology Night',
    date: '2026-05-03',
    city: 'Mumbai',
    venue: 'Screen & Sip, Andheri',
    status: 'past',
    imageUrl: '',
    description: 'Celebrating BTS from debut to Muster — full concert film screening with fan games and group sing-along.',
    rsvpLink: '',
    recapLink: '',
    rating: '9.3',
    category: 'K-pop Crossover Night',
    featured: false
  },
  {
    title: 'Aespa Synth Wave Night',
    date: '2026-04-12',
    city: 'Hyderabad',
    venue: 'TBA',
    status: 'past',
    imageUrl: '',
    description: 'Themed night diving into the KWANGYA universe with an MV marathon and fandom art display.',
    rsvpLink: '',
    recapLink: '',
    rating: '8.8',
    category: 'K-pop Crossover Night',
    featured: false
  }
];

// ─── UTILS ───────────────────────────────────────────────────────────────────
function parseGvizDate(val) {
  // gviz returns dates as "Date(year,0indexed_month,day)"
  const parts = val.slice(5, -1).split(',').map(Number);
  const [y, m, d] = parts;
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return dateStr;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

function driveUrl(raw) {
  if (!raw) return '';
  const match = raw.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://lh3.googleusercontent.com/d/${match[1]}`;
  return raw;
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function statusLabel(s) {
  return { upcoming: 'Upcoming', past: 'Past', full: 'Full', cancelled: 'Cancelled' }[s] || s;
}

// ─── FETCH (JSONP — avoids CORS block on gviz endpoint) ──────────────────────
function gvizJsonp(sheetId) {
  return new Promise((resolve, reject) => {
    if (!window.google) window.google = {};
    if (!window.google.visualization) window.google.visualization = {};
    if (!window.google.visualization.Query) window.google.visualization.Query = {};
    const prev = window.google.visualization.Query.setResponse;
    const timer = setTimeout(function() { reject(new Error('Timeout')); }, 6000);
    window.google.visualization.Query.setResponse = function(data) {
      clearTimeout(timer);
      window.google.visualization.Query.setResponse = prev;
      resolve(data);
    };
    const s = document.createElement('script');
    s.onerror = function() { clearTimeout(timer); reject(new Error('Script load failed')); };
    s.src = 'https://docs.google.com/spreadsheets/d/' + sheetId + '/gviz/tq?tqx=out:json';
    document.head.appendChild(s);
  });
}

async function fetchEvents() {
  if (!SHEET_ID) return SAMPLE_EVENTS;
  try {
    const json = await gvizJsonp(SHEET_ID);
    if (json.status !== 'ok') throw new Error(json.status);
    return parseSheet(json);
  } catch (err) {
    console.warn('Google Sheets fetch failed, showing sample data:', err.message);
    return SAMPLE_EVENTS;
  }
}

function parseSheet(json) {
  return (json?.table?.rows ?? [])
    .map(row => {
      const c = row.c ?? [];
      const str = i => String(c[i]?.v ?? '').trim();
      const dateRaw = c[1]?.v ?? '';
      const dateStr = typeof dateRaw === 'string' && dateRaw.startsWith('Date(')
        ? parseGvizDate(dateRaw)
        : String(dateRaw).trim();
      return {
        title: str(0),
        date: dateStr,
        city: str(2),
        venue: str(3),
        status: str(4).toLowerCase() || 'upcoming',
        imageUrl: str(5),
        description: str(6),
        rsvpLink: str(7),
        recapLink: str(8),
        rating: str(9),
        category: str(10) || 'BL Watch Party',
        featured: str(11).toLowerCase() === 'yes'
      };
    })
    .filter(e => e.title);
}

// ─── RENDER ──────────────────────────────────────────────────────────────────
const placeholderBg = {
  upcoming: 'linear-gradient(135deg,#171943,#2a1a4e)',
  past: 'linear-gradient(135deg,#0b2a2e,#0b3940)',
  full: 'linear-gradient(135deg,#2d1a0e,#3d2200)',
  cancelled: 'linear-gradient(135deg,#1a1a1a,#2a1a1a)'
};

function renderCard(event) {
  const img = driveUrl(event.imageUrl);
  const dateStr = formatDate(event.date);
  const metaStr = [dateStr, event.city].filter(Boolean).join(' · ');
  const cardTag = (event.status === 'upcoming' && event.rsvpLink) || (event.status === 'past' && event.recapLink)
    ? 'a'
    : 'div';
  const href = event.status === 'upcoming' && event.rsvpLink
    ? event.rsvpLink
    : event.recapLink || '';
  const linkAttrs = cardTag === 'a'
    ? ` href="${esc(href)}" target="_blank" rel="noopener"`
    : '';
  const ctaText = event.status === 'upcoming' ? 'RSVP' : event.status === 'past' && event.recapLink ? 'View recap' : '';
  const ctaHtml = ctaText ? `<span class="wp-card-cta">${ctaText} →</span>` : '';
  const ratingHtml = event.rating ? `<span class="wp-rating">${esc(event.rating)}</span>` : '';
  const overlayDesc = event.description.length > 110
    ? esc(event.description.slice(0, 110)) + '…'
    : esc(event.description);

  return `
<${cardTag} class="wp-card"${linkAttrs} role="${cardTag === 'a' ? 'link' : 'group'}" aria-label="${esc(event.title)}">
  <div class="wp-card-thumb" ${img ? '' : `style="background:${placeholderBg[event.status] || placeholderBg.upcoming}"`}>
    ${img ? `<img src="${esc(img)}" alt="" loading="lazy" />` : `<p class="wp-card-ph-title">${esc(event.title)}</p>`}
    <span class="wp-badge wp-badge--${esc(event.status)}">${statusLabel(event.status)}</span>
    ${ratingHtml}
    <div class="wp-card-overlay" aria-hidden="true">
      <strong class="wp-ov-title">${esc(event.title)}</strong>
      <p class="wp-ov-meta">${esc(metaStr)}</p>
      ${event.description ? `<p class="wp-ov-desc">${overlayDesc}</p>` : ''}
    </div>
  </div>
  <div class="wp-card-info">
    <h3 class="wp-card-title">${esc(event.title)}</h3>
    <p class="wp-card-meta">${esc(metaStr)}</p>
    ${ctaHtml}
  </div>
</${cardTag}>`;
}

function renderRow(title, events) {
  if (!events.length) return '';
  const id = `wp-row-${title.replace(/\W+/g, '-').toLowerCase()}`;
  return `
<div class="wp-row" id="${id}">
  <div class="wp-row-header">
    <h2 class="wp-row-title">${esc(title)}</h2>
    <div class="wp-row-arrows" aria-hidden="true">
      <button class="wp-arrow" data-row="${id}" data-dir="-1" tabindex="-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button class="wp-arrow" data-row="${id}" data-dir="1" tabindex="-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  </div>
  <div class="wp-scroll" role="list">
    ${events.map(e => `<div role="listitem">${renderCard(e)}</div>`).join('')}
  </div>
</div>`;
}

function renderHero(event) {
  const heroEl = document.getElementById('wp-hero');
  if (!heroEl) return;

  if (!event) {
    heroEl.innerHTML = `
      <div class="wp-hero-content page-shell">
        <p class="eyebrow">BL Watch Parties</p>
        <h1>Upcoming events will appear here</h1>
        <p class="wp-hero-desc">Check back soon for upcoming screenings and watch party details.</p>
      </div>`;
    return;
  }

  const img = driveUrl(event.imageUrl);
  const dateStr = formatDate(event.date);
  const metaStr = [dateStr, event.city, event.venue].filter(Boolean).join(' · ');
  const rsvpBtn = event.rsvpLink
    ? `<a href="${esc(event.rsvpLink)}" class="btn" target="_blank" rel="noopener">RSVP Now</a>`
    : `<span class="pill">RSVP opening soon</span>`;

  heroEl.classList.toggle('wp-hero--has-image', !!img);
  heroEl.innerHTML = `
    ${img ? `<img class="wp-hero-img" src="${esc(img)}" alt="" />` : ''}
    <div class="wp-hero-gradient"></div>
    <div class="wp-hero-content page-shell">
      <p class="eyebrow wp-hero-eyebrow">Next Up · ${esc(event.category)}</p>
      <h1 class="wp-hero-title">${esc(event.title)}</h1>
      <p class="wp-hero-meta">${esc(metaStr)}</p>
      ${event.description ? `<p class="wp-hero-desc">${esc(event.description)}</p>` : ''}
      <div class="button-row">${rsvpBtn}</div>
    </div>`;
}

function renderChips(activeFilter, cities) {
  const el = document.getElementById('wp-chips');
  if (!el) return;
  const filters = [
    { value: 'all', label: 'All' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'past', label: 'Past' },
    ...cities.map(c => ({ value: `city:${c}`, label: c }))
  ];
  el.innerHTML = filters.map(f =>
    `<button class="wp-chip${f.value === activeFilter ? ' wp-chip--active' : ''}" data-filter="${esc(f.value)}">${esc(f.label)}</button>`
  ).join('');
}

// ─── STATE + FILTER ───────────────────────────────────────────────────────────
let allEvents = [];
let activeFilter = 'all';
let searchQuery = '';

function getVisible() {
  const q = searchQuery.toLowerCase();
  return allEvents.filter(e => {
    const matchSearch = !q
      || e.title.toLowerCase().includes(q)
      || e.city.toLowerCase().includes(q)
      || e.venue.toLowerCase().includes(q)
      || e.description.toLowerCase().includes(q);
    const matchFilter =
      activeFilter === 'all'
      || activeFilter === e.status
      || (activeFilter.startsWith('city:') && e.city === activeFilter.slice(5));
    return matchSearch && matchFilter;
  });
}

function buildRows(events) {
  const upcoming = events
    .filter(e => e.status === 'upcoming' || e.status === 'full')
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = events
    .filter(e => e.status === 'past' || e.status === 'cancelled')
    .sort((a, b) => b.date.localeCompare(a.date));
  const rows = [];
  if (upcoming.length) rows.push(['Coming Up', upcoming]);
  if (past.length) rows.push(['Past Events', past]);
  return rows;
}

function getCities(events) {
  const seen = new Set();
  const out = [];
  for (const e of events) {
    if (e.city && e.city !== 'TBA' && !seen.has(e.city)) {
      seen.add(e.city);
      out.push(e.city);
    }
  }
  return out.length > 1 ? out : [];
}

function rerender() {
  const visible = getVisible();
  const rowsEl = document.getElementById('wp-rows');
  const emptyEl = document.getElementById('wp-empty');
  if (!rowsEl || !emptyEl) return;

  if (!visible.length) {
    rowsEl.innerHTML = '';
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;
  rowsEl.innerHTML = buildRows(visible).map(([t, evts]) => renderRow(t, evts)).join('');
}

// ─── INIT ────────────────────────────────────────────────────────────────────
async function init() {
  if (!document.getElementById('wp-hero')) return;

  const rowsEl = document.getElementById('wp-rows');
  if (rowsEl) rowsEl.innerHTML = '<p class="wp-loading">Loading events…</p>';

  allEvents = await fetchEvents();

  const heroEvent = allEvents.find(e => e.featured) || allEvents.find(e => e.status === 'upcoming');
  renderHero(heroEvent);
  renderChips(activeFilter, getCities(allEvents));
  rerender();

  // Scroll arrows
  document.getElementById('wp-rows')?.addEventListener('click', e => {
    const btn = e.target.closest('.wp-arrow');
    if (!btn) return;
    const scroll = document.querySelector(`#${btn.dataset.row} .wp-scroll`);
    scroll?.scrollBy({ left: Number(btn.dataset.dir) * 290, behavior: 'smooth' });
  });

  // Search
  let debounce;
  document.getElementById('wp-search')?.addEventListener('input', e => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      searchQuery = e.target.value;
      rerender();
    }, 200);
  });

  // Filter chips
  document.getElementById('wp-chips')?.addEventListener('click', e => {
    const chip = e.target.closest('.wp-chip');
    if (!chip) return;
    activeFilter = chip.dataset.filter;
    renderChips(activeFilter, getCities(allEvents));
    rerender();
  });
}

init();
