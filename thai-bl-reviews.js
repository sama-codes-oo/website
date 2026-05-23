// ─── CONFIG ──────────────────────────────────────────────────────────────────
// HOW TO CONNECT GOOGLE SHEETS:
// 1. Create a Google Sheet with these column headers in row 1:
//    A: title | B: country | C: episodes | D: genre
//    E: score_overall | F: score_story | G: score_romance
//    H: score_acting | I: score_rewatch | J: writeup | K: image_url | L: tag
//
// 2. For image_url: upload photo to Google Drive, right-click → Share →
//    "Anyone with the link" → copy the link. Paste that full URL here.
//    The site converts it to a direct image automatically.
//
// 3. Share the sheet: Share → "Anyone with the link can view"
//
// 4. Copy the Sheet ID from the URL:
//    https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit
//    Paste it below.

const SHEET_ID = '16tzZWxXKgyJJeYHNCYzlXWhQMGtZLk8wx6t8luShzHE';

// ─── SAMPLE DATA (shown when SHEET_ID is empty or fetch fails) ───────────────
const SAMPLE_REVIEWS = [
  {
    title: 'Bad Buddy',
    country: 'Thailand',
    episodes: '12',
    genre: 'Romance',
    scoreOverall: '9.0',
    scoreStory: '9.0',
    scoreRomance: '9.5',
    scoreActing: '9.0',
    scoreRewatch: '8.5',
    writeup: 'Bad Buddy works because it treats rivalry, friendship, family pressure, and first love with unusual emotional clarity. The leads carry the show with lived-in chemistry, the comedy lands without flattening the characters, and the romance feels earned instead of rushed. An easy recommendation for viewers who want warmth, tension, and a finale that respects the journey.',
    imageUrl: '',
    tag: 'Thai BL review'
  },
  {
    title: 'A Tale of Thousand Stars',
    country: 'Thailand',
    episodes: '10',
    genre: 'Drama',
    scoreOverall: '8.7',
    scoreStory: '8.8',
    scoreRomance: '8.6',
    scoreActing: '8.7',
    scoreRewatch: '8.4',
    writeup: 'A Tale of Thousand Stars is gentler and more reflective, building its romance through service, grief, community, and quiet trust. The rural setting gives the story a distinct atmosphere, while the central relationship grows through small choices rather than loud declarations. Best for viewers who enjoy slow-burn emotional payoff and character healing.',
    imageUrl: '',
    tag: 'Thai BL review'
  },
  {
    title: 'KinnPorsche',
    country: 'Thailand',
    episodes: '14',
    genre: 'Action',
    scoreOverall: '8.8',
    scoreStory: '8.4',
    scoreRomance: '9.2',
    scoreActing: '8.9',
    scoreRewatch: '8.7',
    writeup: 'KinnPorsche leans hard into tension and intensity, pairing a crime-family backdrop with one of the most charged lead dynamics in recent Thai BL. The action sequences add novelty and the chemistry is undeniable. Pacing is uneven across its run but the highs are genuinely thrilling. Best watched for the central relationship rather than plot logic.',
    imageUrl: '',
    tag: 'Thai BL review'
  },
  {
    title: 'Only Friends',
    country: 'Thailand',
    episodes: '12',
    genre: 'Drama',
    scoreOverall: '8.5',
    scoreStory: '8.7',
    scoreRomance: '8.3',
    scoreActing: '8.6',
    scoreRewatch: '7.9',
    writeup: 'Only Friends takes a deliberately messy approach to its ensemble cast, letting relationships unfold without tidy resolutions. It is one of the more emotionally honest Thai BLs in its treatment of communication, jealousy, and friendship drift. Some storylines land stronger than others, but the overall ambition makes it worthwhile for viewers who prefer character complexity over comfort.',
    imageUrl: '',
    tag: 'Thai BL review'
  },
  {
    title: 'Not Me',
    country: 'Thailand',
    episodes: '14',
    genre: 'Thriller',
    scoreOverall: '8.3',
    scoreStory: '8.6',
    scoreRomance: '7.8',
    scoreActing: '8.4',
    scoreRewatch: '7.6',
    writeup: 'Not Me uses an identity-swap premise to explore class inequality, protest, and loyalty with more political intent than most Thai BL. The thriller structure gives it momentum and the dual-role performance is compelling throughout. The romance takes a back seat to the broader themes, which will suit viewers who want BL with a stronger social lens.',
    imageUrl: '',
    tag: 'Thai BL review'
  }
];

// ─── UTILS ───────────────────────────────────────────────────────────────────
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

async function fetchReviews() {
  if (!SHEET_ID) return SAMPLE_REVIEWS;
  try {
    const json = await gvizJsonp(SHEET_ID);
    if (json.status !== 'ok') throw new Error(json.status);
    return parseSheet(json);
  } catch (err) {
    console.warn('Google Sheets fetch failed, showing sample data:', err.message);
    return SAMPLE_REVIEWS;
  }
}

function parseSheet(json) {
  return (json?.table?.rows ?? [])
    .map(row => {
      const c = row.c ?? [];
      const str = i => {
        const cell = c[i];
        if (!cell) return '';
        return (cell.f != null ? String(cell.f) : String(cell.v ?? '')).trim();
      };
      return {
        title:        str(0),
        country:      str(1),
        episodes:     str(2),
        genre:        str(3),
        scoreOverall: str(4),
        scoreStory:   str(5),
        scoreRomance: str(6),
        scoreActing:  str(7),
        scoreRewatch: str(8),
        writeup:      str(9),
        imageUrl:     str(10),
        tag:          str(11) || 'BL Review'
      };
    })
    .filter(r => r.title);
}

// ─── RENDER ──────────────────────────────────────────────────────────────────
function renderCard(review) {
  const img = driveUrl(review.imageUrl);
  const genres = review.genre.split(',').map(g => g.trim()).filter(Boolean);
  const pills = [
    review.country,
    ...genres,
    review.episodes ? `${review.episodes} episodes` : ''
  ].filter(Boolean).map(p => `<span class="pill">${esc(p)}</span>`).join('');

  const scores = [
    { label: 'Story',   val: review.scoreStory },
    { label: 'Romance', val: review.scoreRomance },
    { label: 'Acting',  val: review.scoreActing },
    { label: 'Rewatch', val: review.scoreRewatch }
  ].filter(s => s.val);

  const scoreHtml = scores.length
    ? `<div class="score-grid" aria-label="${esc(review.title)} review scores">
        ${scores.map(s => `<div class="score-item"><strong>${esc(s.val)}</strong><span>${s.label}</span></div>`).join('')}
      </div>`
    : '';

  const mediaHtml = img
    ? `<img loading="lazy" src="${esc(img)}" alt="" width="800" height="600" />`
    : '';

  return `
<article class="review-card">
  <figure class="review-media">${mediaHtml}</figure>
  <div class="review-content">
    <div class="review-title-row">
      <div>
        <span class="tag">${esc(review.tag)}</span>
        <h3>${esc(review.title)}</h3>
        <div class="meta-row">${pills}</div>
      </div>
      ${review.scoreOverall ? `<span class="rating-badge">${esc(review.scoreOverall)}</span>` : ''}
    </div>
    ${review.writeup ? `<p class="review-writeup">${esc(review.writeup)}</p>` : ''}
    ${scoreHtml}
  </div>
</article>`;
}

// ─── STATE + FILTER ───────────────────────────────────────────────────────────
let allReviews = [];
let activeFilter = 'all';
let searchQuery = '';

function getVisible() {
  const q = searchQuery.toLowerCase();
  return allReviews.filter(r => {
    const matchSearch = !q
      || r.title.toLowerCase().includes(q)
      || r.country.toLowerCase().includes(q)
      || r.genre.toLowerCase().includes(q)
      || r.writeup.toLowerCase().includes(q);
    const matchFilter =
      activeFilter === 'all'
      || r.country.toLowerCase() === activeFilter;
    return matchSearch && matchFilter;
  });
}

function getCountries(reviews) {
  const seen = new Set();
  const out = [];
  for (const r of reviews) {
    if (r.country && !seen.has(r.country)) { seen.add(r.country); out.push(r.country); }
  }
  return out.length > 1 ? out : [];
}

function renderChips(countries) {
  const el = document.getElementById('review-chips');
  if (!el) return;
  const filters = [{ value: 'all', label: 'All' }, ...countries.map(c => ({ value: c.toLowerCase(), label: c }))];
  el.innerHTML = filters.map(f =>
    `<button class="wp-chip${f.value === activeFilter ? ' wp-chip--active' : ''}" data-filter="${esc(f.value)}">${esc(f.label)}</button>`
  ).join('');
}

function rerender() {
  const listEl  = document.getElementById('review-list');
  const emptyEl = document.getElementById('review-empty');
  if (!listEl || !emptyEl) return;

  const visible = getVisible();
  if (!visible.length) {
    listEl.innerHTML = '';
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;
  listEl.innerHTML = visible.map(renderCard).join('');
}

// ─── INIT ────────────────────────────────────────────────────────────────────
async function init() {
  const listEl = document.getElementById('review-list');
  if (!listEl) return;

  listEl.innerHTML = '<p class="wp-loading">Loading reviews…</p>';

  allReviews = await fetchReviews();

  const countEl = document.getElementById('review-count');
  if (countEl) countEl.textContent = `${allReviews.length} review${allReviews.length !== 1 ? 's' : ''}`;

  const countries = getCountries(allReviews);
  renderChips(countries);
  rerender();

  let debounce;
  document.getElementById('review-search')?.addEventListener('input', e => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      searchQuery = e.target.value;
      rerender();
    }, 200);
  });

  document.getElementById('review-chips')?.addEventListener('click', e => {
    const chip = e.target.closest('.wp-chip');
    if (!chip) return;
    activeFilter = chip.dataset.filter;
    renderChips(getCountries(allReviews));
    rerender();
  });
}

init();
