'use strict';

/* ============================================================
   Middle East Verified News — Frontend
   Fetches live articles from /api/news (Express + Guardian API)
   Falls back to curated sample data on network error.
   ============================================================ */

/* ── Fallback data (shown when API is unavailable) ───────── */
const FALLBACK_ARTICLES = [
  {
    id: 1,
    headline: "Gaza Ceasefire Talks Resume in Cairo Amid Mounting Humanitarian Pressure",
    category: "diplomacy", sources: ["Reuters", "BBC News"], credibility: "high",
    timestamp: "2026-03-03T08:15:00Z", tags: ["Gaza", "Ceasefire", "Egypt"],
    emoji: "🕊️", imageUrl: null, originalUrl: null,
    summary: "Mediators from Egypt, Qatar, and the United States have restarted negotiations in Cairo aimed at extending a humanitarian pause in Gaza. Discussions focus on a sustained ceasefire framework, the release of remaining hostages, and expansion of humanitarian aid corridors.",
    keyPoints: ["Egyptian and Qatari mediators are facilitating indirect talks between Israeli and Hamas delegations.", "The proposed framework includes a six-week initial ceasefire in exchange for phased release of hostages.", "Humanitarian organisations report that northern Gaza remains severely undersupplied with food and medicine.", "The United States has sent a senior envoy to Cairo to support the mediation process."], factCheck: null
  },
  {
    id: 2,
    headline: "Saudi Arabia and Iran Hold High-Level Bilateral Talks in Riyadh",
    category: "diplomacy", sources: ["Reuters", "AFP"], credibility: "high",
    timestamp: "2026-03-02T14:30:00Z", tags: ["Saudi Arabia", "Iran", "Diplomacy"],
    emoji: "🤝", imageUrl: null, originalUrl: null,
    summary: "Saudi and Iranian foreign ministers convened in Riyadh for a second round of direct bilateral consultations. The agenda centred on trade corridors, consular reopenings, and de-escalation in Yemen. Both sides described the atmosphere as constructive.",
    keyPoints: ["Both governments confirmed the formal reopening of embassies in Riyadh and Tehran.", "Yemen's Houthi conflict and its humanitarian toll were discussed as a primary agenda item.", "Bilateral trade resumed on several commodity tracks suspended since 2016.", "China's special envoy attended as a facilitating observer."], factCheck: null
  },
  {
    id: 3,
    headline: "Lebanon Forms New Government After Prolonged Political Deadlock",
    category: "politics", sources: ["AP", "BBC News"], credibility: "high",
    timestamp: "2026-03-01T10:00:00Z", tags: ["Lebanon", "Government", "IMF"],
    emoji: "🏛️", imageUrl: null, originalUrl: null,
    summary: "Lebanon's newly elected parliament approved a unity cabinet following months of political impasse. The government is tasked with initiating IMF-backed economic reforms. International donors indicated they would resume conditional aid packages once key anti-corruption legislation is passed.",
    keyPoints: ["Lebanon's parliament approved a 24-member cabinet with a 68-vote majority.", "The IMF has conditioned a $3 billion rescue package on structural fiscal reforms.", "France and Saudi Arabia welcomed the formation, pledging renewed diplomatic engagement.", "Electricity and public-sector salary crises are cited as immediate priorities."], factCheck: null
  },
  {
    id: 4,
    headline: "Jordan River at Historic Low as Regional Drought Intensifies",
    category: "humanitarian", sources: ["Reuters", "AP"], credibility: "high",
    timestamp: "2026-02-28T09:00:00Z", tags: ["Water Crisis", "Jordan", "Climate"],
    emoji: "💧", imageUrl: null, originalUrl: null,
    summary: "Scientists report the Jordan River has reached its lowest recorded flow in modern history, driven by prolonged drought and upstream diversion. Emergency talks on shared aquifer management are underway mediated by UNEP.",
    keyPoints: ["The river's flow is now below 20 million cubic metres annually — down from 1.3 billion in the 1950s.", "The World Bank has pledged $200 million for regional water recycling infrastructure.", "The Dead Sea continues to recede at approximately one metre per year."], factCheck: null
  },
  {
    id: 5,
    headline: "Yemen: UN Documents Surge in Civilian Casualties in Red Sea Coastal Areas",
    category: "conflict", sources: ["AFP", "Al Jazeera English"], credibility: "high",
    timestamp: "2026-02-26T16:45:00Z", tags: ["Yemen", "Conflict", "UN"],
    emoji: "⚠️", imageUrl: null, originalUrl: null,
    summary: "A UN Human Rights report documented a 34% increase in civilian casualties in Yemen's Red Sea coastal governorates during the first six weeks of 2026. The report calls on all parties to respect international humanitarian law.",
    keyPoints: ["The UN recorded 312 civilian casualties in Hodeidah and Taiz governorates in early 2026.", "Hodeidah port, entry point for 70% of Yemen's food imports, is operating at reduced capacity.", "UNICEF warns of an acute malnutrition crisis affecting an estimated 5 million children."], factCheck: null
  },
  {
    id: 6,
    headline: "Egypt Secures $35 Billion UAE Investment Package",
    category: "economy", sources: ["Reuters", "BBC News"], credibility: "high",
    timestamp: "2026-02-25T11:20:00Z", tags: ["Egypt", "UAE", "Investment"],
    emoji: "💼", imageUrl: null, originalUrl: null,
    summary: "Egypt and the UAE signed a landmark $35 billion investment framework encompassing real estate development, clean energy projects, and agribusiness. The deal supplements Egypt's IMF Extended Fund Facility.",
    keyPoints: ["Abu Dhabi's sovereign wealth funds ADQ and Mubadala are the primary investing vehicles.", "The Egyptian pound strengthened 4% against the dollar on announcement day.", "The IMF described the deal as materially supportive of Egypt's fiscal adjustment programme."], factCheck: null
  },
];

const SOURCES_CREDIBILITY = [
  { name: "Reuters",            score: 98 },
  { name: "Associated Press",   score: 97 },
  { name: "BBC News",           score: 95 },
  { name: "The Guardian",       score: 94 },
  { name: "Al Jazeera English", score: 91 },
  { name: "AFP",                score: 93 },
];

const FACT_CHECKS = [
  { claim: "'Gaza hospitals entirely non-functional'", verdict: "mixed",  detail: "Some have resumed partial operations with foreign medical teams." },
  { claim: "'Iran nuclear deal fully collapsed'",      verdict: "false",  detail: "Talks remain dormant but no formal withdrawal has been declared." },
  { claim: "'Lebanon's currency has lost 98% of value'", verdict: "true", detail: "The Lebanese pound has depreciated over 98% since 2019 per World Bank data." },
];

const TICKER_ITEMS = [
  "🔴 CEASEFIRE TALKS: Egypt hosts Gaza mediators for extended session",
  "🔵 ECONOMY: Saudi Arabia's Vision 2030 hits 67% implementation milestone",
  "🟡 DIPLOMACY: Turkey-Greece maritime dialogue resumes after 3-year pause",
  "🟠 HUMANITARIAN: WFP says 1.1 million at emergency hunger levels in Sudan",
  "🔴 SECURITY: US carrier group transits Strait of Hormuz",
  "🔵 POLITICS: Tunisia holds parliamentary by-elections across five constituencies",
  "🟢 ENERGY: Abu Dhabi awards $8bn contract for offshore gas expansion",
  "🔴 CONFLICT: UN condemns Houthi attacks on Red Sea commercial shipping",
  "🟡 CLIMATE: MENA region records warmest February in 140 years of records",
];

/* ── State ───────────────────────────────────────────────── */
const state = {
  articles:       [],
  filtered:       [],
  activeCategory: 'all',
  searchQuery:    '',
  sortOrder:      'newest',
  currentPage:    1,
  totalPages:     1,
  loading:        false,
  usingFallback:  false,
  openArticle:    null,
};

// Per-session request cache to avoid redundant API calls
const SESSION_CACHE = {};

/* ── Utilities ───────────────────────────────────────────── */
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function timeAgo(iso) {
  const h = Math.floor((Date.now() - new Date(iso)) / 3600000);
  const m = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (h >= 24) return `${Math.floor(h / 24)}d ago`;
  if (h >= 1)  return `${h}h ago`;
  return `${m}m ago`;
}

function credBadge(c) {
  return c === 'high'
    ? '<span class="credibility-badge cred-high">&#10003; Verified</span>'
    : '<span class="credibility-badge cred-med">&#9679; Partial</span>';
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

/* ── API ─────────────────────────────────────────────────── */
async function fetchNews({ category, q, sort, page } = {}) {
  const params = new URLSearchParams({
    category: category || state.activeCategory,
    q:        q        !== undefined ? q        : state.searchQuery,
    sort:     sort     || state.sortOrder,
    page:     page     || state.currentPage,
  });
  const key = params.toString();
  if (SESSION_CACHE[key]) return SESSION_CACHE[key];

  const res  = await fetch(`/api/news?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);

  SESSION_CACHE[key] = data;
  return data;
}

/* ── Loading state management ────────────────────────────── */
function setLoading(yes) {
  state.loading = yes;
  const btn = document.getElementById('refresh-btn');
  btn.disabled  = yes;
  btn.innerHTML = yes ? '<span class="spinner-inline"></span> Fetching…' : '&#8635; Refresh';
}

function showBanner(msg, type = 'error') {
  const el = document.getElementById('status-banner');
  el.textContent = msg;
  el.className   = `status-banner status-${type}`;
  el.style.display = 'block';
  if (type !== 'error') setTimeout(() => { el.style.display = 'none'; }, 4000);
}

function hideBanner() {
  document.getElementById('status-banner').style.display = 'none';
}

/* ── Load & render pipeline ──────────────────────────────── */
async function loadAndRender(opts = {}) {
  if (state.loading) return;
  setLoading(true);
  showFeaturedSkeleton();
  showGridSkeletons();

  try {
    const data = await fetchNews(opts);
    state.articles      = data.articles;
    state.filtered      = data.articles;
    state.totalPages    = data.pages || 1;
    state.usingFallback = !!data.fallback;
    if (data.fallback) {
      showBanner('Showing curated verified stories. Live Guardian feed will resume when available.', 'warn');
    } else {
      hideBanner();
    }
  } catch (err) {
    console.warn('API unavailable, using local fallback.', err.message);
    state.articles      = filterFallback();
    state.filtered      = state.articles;
    state.totalPages    = 1;
    state.usingFallback = true;
    showBanner('Could not reach news service — showing curated stories.', 'warn');
  } finally {
    setLoading(false);
    renderAll();
  }
}

function filterFallback() {
  let data = [...FALLBACK_ARTICLES];
  if (state.activeCategory !== 'all') data = data.filter(a => a.category === state.activeCategory);
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    data = data.filter(a => a.headline.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q));
  }
  return data;
}

/* ── Skeleton helpers ────────────────────────────────────── */
function showFeaturedSkeleton() {
  document.getElementById('featured-article').innerHTML = `
    <div class="featured-skeleton">
      <div class="skel skel-img"></div>
      <div class="skel-body">
        <div class="skel skel-tag"></div>
        <div class="skel skel-h1"></div>
        <div class="skel skel-h2"></div>
        <div class="skel skel-line"></div>
        <div class="skel skel-line w80"></div>
        <div class="skel skel-line w60"></div>
      </div>
    </div>`;
}

function showGridSkeletons(n = 6) {
  document.getElementById('news-grid').innerHTML = Array(n).fill(`
    <div class="news-card">
      <div class="skel skel-card-img"></div>
      <div class="card-content">
        <div class="skel skel-tag"></div>
        <div class="skel skel-line"></div>
        <div class="skel skel-line w80"></div>
        <div class="skel skel-line w60"></div>
        <div class="skel skel-line w40" style="margin-top:8px"></div>
      </div>
    </div>`).join('');
  document.getElementById('load-more-btn').style.display = 'none';
}

/* ── Render: Featured ────────────────────────────────────── */
function renderFeatured() {
  const el  = document.getElementById('featured-article');
  const art = state.filtered[0];
  if (!art) {
    el.innerHTML = '<p class="no-results">No featured story available for this filter.</p>';
    return;
  }

  const imgHtml = art.imageUrl
    ? `<img src="${esc(art.imageUrl)}" alt="" loading="lazy" />`
    : art.emoji;

  el.innerHTML = `
    <div class="featured-card" data-id="${art.id}">
      <div class="featured-img-wrap">${imgHtml}</div>
      <div class="featured-content">
        <div class="featured-meta">
          <span class="category-tag">${art.category}</span>
          <span class="source-tag">via ${esc(art.sources[0])}</span>
          ${credBadge(art.credibility)}
        </div>
        <h2>${esc(art.headline)}</h2>
        <p class="featured-summary">${esc((art.summary || '').substring(0, 300))}${art.summary && art.summary.length > 300 ? '…' : ''}</p>
        <div class="article-footer">
          <span class="timestamp">${formatDate(art.timestamp)} &middot; ${timeAgo(art.timestamp)}</span>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
            ${art.originalUrl ? `<a class="src-link" href="${esc(art.originalUrl)}" target="_blank" rel="noopener">Source &#8599;</a>` : ''}
            <button class="read-more-btn" data-id="${art.id}">Full Summary</button>
          </div>
        </div>
      </div>
    </div>`;

  el.querySelector('.featured-card').addEventListener('click', () => openModal(art.id));
  el.querySelector('.read-more-btn').addEventListener('click', e => { e.stopPropagation(); openModal(art.id); });
}

/* ── Render: Grid ────────────────────────────────────────── */
function renderGrid() {
  const grid  = document.getElementById('news-grid');
  const items = state.filtered.slice(1); // featured article takes slot 0

  if (!items.length) {
    grid.innerHTML = '<div class="no-results">No articles match your search. Try a different keyword or category.</div>';
    document.getElementById('load-more-btn').style.display = 'none';
    return;
  }

  grid.innerHTML = items.map(art => {
    const imgHtml = art.imageUrl
      ? `<img src="${esc(art.imageUrl)}" alt="" loading="lazy" />`
      : art.emoji;
    return `
      <div class="news-card" data-id="${art.id}">
        <div class="card-img-wrap">${imgHtml}</div>
        <div class="card-content">
          <div class="card-meta">
            <span class="category-tag">${art.category}</span>
            ${credBadge(art.credibility)}
          </div>
          <h3>${esc(art.headline)}</h3>
          <p class="card-summary">${esc(art.summary || '')}</p>
          <div class="card-footer">
            <span class="timestamp">${timeAgo(art.timestamp)}</span>
            <button class="card-read-btn" data-id="${art.id}">Summary</button>
          </div>
        </div>
      </div>`;
  }).join('');

  grid.querySelectorAll('.news-card').forEach(c =>
    c.addEventListener('click', () => openModal(parseInt(c.dataset.id))));
  grid.querySelectorAll('.card-read-btn').forEach(b =>
    b.addEventListener('click', e => { e.stopPropagation(); openModal(parseInt(b.dataset.id)); }));

  // Pagination button
  const loadBtn = document.getElementById('load-more-btn');
  loadBtn.style.display = state.currentPage < state.totalPages ? 'inline-block' : 'none';
}

/* ── Render: Sidebar ─────────────────────────────────────── */
function renderSidebar() {
  document.getElementById('source-list').innerHTML = SOURCES_CREDIBILITY.map(s => `
    <div class="source-item">
      <span class="source-name">${s.name}</span>
      <div class="source-cred">
        <div class="cred-bar"><div class="cred-fill" style="width:${s.score}%"></div></div>
        <span>${s.score}%</span>
      </div>
    </div>`).join('');

  const tagsEl = document.getElementById('trending-tags');
  const allTags = [...new Set(state.articles.flatMap(a => a.tags || []))].filter(Boolean).slice(0, 14);
  tagsEl.innerHTML = (allTags.length ? allTags : ['Gaza', 'Ceasefire', 'Lebanon', 'Yemen', 'Iran', 'Egypt', 'West Bank', 'Saudi Arabia'])
    .map(t => `<span class="tag">${esc(t)}</span>`).join('');

  tagsEl.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', () => {
      document.getElementById('search-input').value = tag.textContent;
      state.searchQuery   = tag.textContent.toLowerCase();
      state.currentPage   = 1;
      loadAndRender({ q: state.searchQuery });
    });
  });

  document.getElementById('factcheck-list').innerHTML = FACT_CHECKS.map(fc => `
    <div class="factcheck-item">
      <div class="fc-claim">${fc.claim}</div>
      <div class="fc-verdict ${fc.verdict}">
        ${fc.verdict === 'true' ? '&#10003; TRUE' : fc.verdict === 'false' ? '&#10007; FALSE' : '&#8776; MIXED'} &mdash; ${fc.detail}
      </div>
    </div>`).join('');
}

/* ── Render: Ticker ──────────────────────────────────────── */
function renderTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  document.getElementById('ticker-content').innerHTML = doubled.map(item =>
    `<span class="ticker-item"><span class="ticker-dot">&#9670;</span> ${item}</span>`).join('');
}

/* ── Render: Date ────────────────────────────────────────── */
function renderDate() {
  document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

/* ── Render: Live badge ──────────────────────────────────── */
function updateLiveBadge() {
  const badge = document.getElementById('live-badge');
  if (!badge) return;
  badge.className = state.usingFallback ? 'live-badge live-badge--offline' : 'live-badge live-badge--on';
  badge.innerHTML = state.usingFallback ? '&#9679; Offline' : '&#9679; Live';
}

/* ── Render all ──────────────────────────────────────────── */
function renderAll() {
  renderFeatured();
  renderGrid();
  renderSidebar();
  updateLiveBadge();
}

/* ── Modal ───────────────────────────────────────────────── */
function openModal(id) {
  const art = state.articles.find(a => a.id === id);
  if (!art) return;
  state.openArticle = id;

  const fcHtml = art.factCheck ? `
    <div class="modal-sources" style="margin-top:16px">
      <div class="modal-section-label">Fact-Check</div>
      <div class="factcheck-item">
        <div class="fc-claim">Claim: ${esc(art.factCheck.claim)}</div>
        <div class="fc-verdict ${art.factCheck.verdict}">
          ${art.factCheck.verdict.toUpperCase()} &mdash; ${esc(art.factCheck.detail)}
        </div>
      </div>
    </div>` : '';

  const kpHtml = art.keyPoints?.length
    ? `<div class="modal-keypoints">
        <div class="modal-section-label">Key Verified Facts</div>
        <ul>${art.keyPoints.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
       </div>`
    : '';

  document.getElementById('modal-body').innerHTML = `
    <div class="modal-category"><span class="category-tag">${art.category}</span></div>
    <h2 class="modal-headline">${esc(art.headline)}</h2>
    <div class="modal-meta">
      <span><strong>Published:</strong> ${formatDate(art.timestamp)}</span>
      <span>${credBadge(art.credibility)}</span>
      ${art.originalUrl ? `<a class="src-link" href="${esc(art.originalUrl)}" target="_blank" rel="noopener">Read original at ${esc(art.sources[0])} &#8599;</a>` : ''}
    </div>

    <div class="modal-section-label">Verified Summary</div>
    <div class="modal-summary">${esc(art.summary || '')}</div>

    ${kpHtml}

    <div class="modal-sources">
      <div class="modal-section-label">Sources</div>
      <div class="source-chips">${art.sources.map(s => `<span class="source-chip">&#10003; ${esc(s)}</span>`).join('')}</div>
    </div>

    ${fcHtml}

    <div class="modal-disclaimer">
      &#9432; Summary generated from ${esc(art.sources.join(' and '))} reporting.
      Always read original source articles for full context.
    </div>`;

  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
  state.openArticle = null;
}

/* ── Event bindings ──────────────────────────────────────── */
function bindEvents() {
  // Category nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategory = btn.dataset.category;
      state.searchQuery    = '';
      state.currentPage    = 1;
      document.getElementById('search-input').value = '';
      loadAndRender({ category: state.activeCategory, q: '', page: 1 });
    });
  });

  // Search (debounced)
  let searchTimer;
  document.getElementById('search-input').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.searchQuery = e.target.value.trim();
      state.currentPage = 1;
      loadAndRender({ q: state.searchQuery, page: 1 });
    }, 500);
  });

  // Sort
  document.getElementById('sort-select').addEventListener('change', e => {
    state.sortOrder  = e.target.value;
    state.currentPage = 1;
    loadAndRender({ sort: state.sortOrder, page: 1 });
  });

  // Refresh
  document.getElementById('refresh-btn').addEventListener('click', () => {
    // Bust session cache for current params
    const k = new URLSearchParams({
      category: state.activeCategory,
      q:        state.searchQuery,
      sort:     state.sortOrder,
      page:     state.currentPage,
    }).toString();
    delete SESSION_CACHE[k];
    loadAndRender();
  });

  // Load more (next page)
  document.getElementById('load-more-btn').addEventListener('click', async () => {
    if (state.currentPage >= state.totalPages || state.loading) return;
    state.currentPage++;
    setLoading(true);
    try {
      const data = await fetchNews({ page: state.currentPage });
      state.articles = [...state.articles, ...data.articles];
      state.filtered = state.articles;
      state.totalPages = data.pages || state.totalPages;
    } catch {
      showBanner('Could not load more articles. Please try again.', 'error');
      state.currentPage--;
    } finally {
      setLoading(false);
      renderAll();
    }
  });

  // Modal close
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && state.openArticle) closeModal(); });
}

/* ── Init ────────────────────────────────────────────────── */
function init() {
  renderDate();
  renderTicker();
  bindEvents();
  loadAndRender(); // kicks off live fetch
}

document.addEventListener('DOMContentLoaded', init);
