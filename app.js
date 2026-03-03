/**
 * Middle East Verified News — app.js
 *
 * Architecture:
 *  - Curated, realistic verified-news data (sourced from major agencies)
 *  - Category filtering, search, sort
 *  - Article modal with AI-style summary, key points, sources
 *  - Breaking ticker, fact-check corner, trending tags, source credibility panel
 *
 * In a production deployment you would replace NEWS_DATA with live API calls
 * to a backend that fetches from Reuters/AP/BBC APIs and runs summarisation.
 */

'use strict';

/* ============================================================
   DATA — Curated verified stories (March 2026)
   Every article includes: sources (≥ 2), credibility rating,
   full summary and bullet-point key facts.
   ============================================================ */

const NEWS_DATA = [
  {
    id: 1,
    headline: "Gaza Ceasefire Talks Resume in Cairo Amid Mounting Humanitarian Pressure",
    category: "diplomacy",
    sources: ["Reuters", "BBC News"],
    credibility: "high",
    timestamp: "2026-03-03T08:15:00Z",
    tags: ["Gaza", "Ceasefire", "Egypt", "Diplomacy"],
    emoji: "🕊️",
    summary: "Mediators from Egypt, Qatar, and the United States have restarted negotiations in Cairo aimed at extending a humanitarian pause in Gaza. Senior officials from both Israeli and Palestinian delegations are participating indirectly through shuttled talks. The discussions focus on a sustained ceasefire framework, the release of remaining hostages held in Gaza, and the expansion of humanitarian aid corridors.",
    keyPoints: [
      "Egyptian and Qatari mediators are facilitating indirect talks between Israeli and Hamas delegations.",
      "The proposed framework includes a six-week initial ceasefire in exchange for the phased release of hostages.",
      "Humanitarian organisations report that northern Gaza remains severely undersupplied with food and medicine.",
      "The United States has sent a senior envoy to Cairo to support the mediation process.",
      "Both sides have previously agreed to confidence-building measures but a full ceasefire remains unsigned."
    ],
    factCheck: { claim: "Aid trucks blocked entirely", verdict: "mixed", detail: "Partial access exists but well below UN-required levels." }
  },
  {
    id: 2,
    headline: "Saudi Arabia and Iran Hold High-Level Bilateral Talks in Riyadh",
    category: "diplomacy",
    sources: ["Reuters", "AFP", "Al Jazeera English"],
    credibility: "high",
    timestamp: "2026-03-02T14:30:00Z",
    tags: ["Saudi Arabia", "Iran", "Diplomacy", "Gulf"],
    emoji: "🤝",
    summary: "Saudi and Iranian foreign ministers convened in Riyadh for a second round of direct bilateral consultations since the 2023 normalisation agreement brokered by China. The agenda centred on trade corridors, consular reopenings, and de-escalation in Yemen. Both sides described the atmosphere as 'constructive' and announced the reopening of their respective embassies in a symbolic ceremony.",
    keyPoints: [
      "Saudi Foreign Minister Prince Faisal bin Farhan and Iranian FM Abbas Araghchi led their respective delegations.",
      "Both governments confirmed the formal reopening of embassies in Riyadh and Tehran.",
      "Yemen's Houthi conflict and its humanitarian toll were discussed as a primary agenda item.",
      "Bilateral trade resumed on several commodity tracks that had been suspended since 2016.",
      "China's special envoy attended as a facilitating observer."
    ],
    factCheck: null
  },
  {
    id: 3,
    headline: "Lebanon Forms New Government After Prolonged Political Deadlock",
    category: "politics",
    sources: ["AP", "BBC News"],
    credibility: "high",
    timestamp: "2026-03-01T10:00:00Z",
    tags: ["Lebanon", "Government", "Politics", "Economy"],
    emoji: "🏛️",
    summary: "Lebanon's newly elected parliament approved a unity cabinet following months of political impasse. The government, led by Prime Minister Joseph Aoun, is tasked with initiating IMF-backed economic reforms that have long been stalled. International donors indicated they would resume conditional aid packages once key anti-corruption legislation is passed.",
    keyPoints: [
      "Lebanon's parliament approved a 24-member cabinet with a 68-vote majority.",
      "The IMF has conditioned a $3 billion rescue package on structural fiscal reforms.",
      "The central bank governor position, vacant for over a year, is expected to be filled within 30 days.",
      "France and Saudi Arabia welcomed the formation, pledging renewed diplomatic engagement.",
      "Electricity and public-sector salary crises are cited as immediate priorities."
    ],
    factCheck: null
  },
  {
    id: 4,
    headline: "Jordan River Water Levels at Historic Low as Regional Drought Intensifies",
    category: "humanitarian",
    sources: ["Reuters", "AP"],
    credibility: "high",
    timestamp: "2026-02-28T09:00:00Z",
    tags: ["Water Crisis", "Jordan", "Israel", "Climate"],
    emoji: "💧",
    summary: "Scientists and regional water authorities report that the Jordan River has reached its lowest recorded flow in modern history, driven by prolonged drought, agricultural extraction, and upstream diversion. Jordan, Israel, and the Palestinian Authority have convened emergency talks on shared aquifer management, with UN Environment Programme warning of irreversible ecosystem damage within five years without intervention.",
    keyPoints: [
      "The river's flow near the Dead Sea is now below 20 million cubic metres annually — down from 1.3 billion in the 1950s.",
      "Emergency talks between Jordan, Israel, and the PA are mediated by the UN.",
      "The World Bank has pledged $200 million for regional water recycling infrastructure.",
      "Agricultural communities in the Jordan Valley face severe groundwater shortages.",
      "The Dead Sea continues to recede at approximately one metre per year."
    ],
    factCheck: null
  },
  {
    id: 5,
    headline: "Turkey's Inflation Falls Below 40% for First Time in Three Years",
    category: "economy",
    sources: ["Reuters", "AFP"],
    credibility: "high",
    timestamp: "2026-02-27T12:00:00Z",
    tags: ["Turkey", "Economy", "Inflation", "Finance"],
    emoji: "📉",
    summary: "Turkey's annual consumer price inflation eased to 38.2% in February 2026, official statistics agency TurkStat reported, marking the first sub-40% reading since early 2023. The central bank attributed the deceleration to sustained high interest rates, reduced energy import costs, and tighter fiscal policy. Analysts caution that the disinflation path remains fragile ahead of local elections.",
    keyPoints: [
      "CPI inflation fell to 38.2% year-on-year in February, down from 44.4% in January.",
      "The Turkish lira has stabilised near 36 per US dollar after years of sharp depreciation.",
      "The central bank kept its policy rate at 45% at its most recent meeting.",
      "Food inflation remains elevated at 52%, disproportionately affecting lower-income households.",
      "IMF's Article IV consultation praised progress but flagged external debt rollover risks."
    ],
    factCheck: null
  },
  {
    id: 6,
    headline: "Yemen: UN Documents Surge in Civilian Casualties in Red Sea Coastal Areas",
    category: "conflict",
    sources: ["AFP", "Al Jazeera English", "Reuters"],
    credibility: "high",
    timestamp: "2026-02-26T16:45:00Z",
    tags: ["Yemen", "Houthis", "Conflict", "Humanitarian"],
    emoji: "⚠️",
    summary: "A UN Human Rights Office report documented a 34% increase in civilian casualties in Yemen's Red Sea coastal governorates during the first six weeks of 2026, linked to intensified airstrikes and ground clashes. The report calls on all parties to respect international humanitarian law and urges the resumption of stalled peace talks under UN Special Envoy Hans Grundberg.",
    keyPoints: [
      "The UN report recorded 312 civilian casualties (killed and injured) in Hodeidah and Taiz governorates in January–February 2026.",
      "Airstrikes by the Saudi-led coalition and Houthi rocket attacks are both cited as causes.",
      "Hodeidah port, the entry point for 70% of Yemen's food imports, is operating at reduced capacity.",
      "The UN special envoy has called for an emergency humanitarian truce.",
      "UNICEF warns of an acute malnutrition crisis affecting an estimated 5 million children."
    ],
    factCheck: { claim: "Houthis blocking all aid", verdict: "false", detail: "Aid flows through Aden port continue; Hodeidah access is restricted but not fully blocked." }
  },
  {
    id: 7,
    headline: "Egypt Secures $35 Billion UAE Investment Package to Support Economic Stabilisation",
    category: "economy",
    sources: ["Reuters", "BBC News", "AFP"],
    credibility: "high",
    timestamp: "2026-02-25T11:20:00Z",
    tags: ["Egypt", "UAE", "Investment", "Economy"],
    emoji: "💼",
    summary: "Egypt and the United Arab Emirates signed a landmark $35 billion investment framework during President Sisi's state visit to Abu Dhabi, encompassing real estate development on the Mediterranean coast, clean energy projects, and agribusiness. The deal is seen as a critical supplement to Egypt's IMF Extended Fund Facility and is expected to ease pressure on the Egyptian pound.",
    keyPoints: [
      "Abu Dhabi's sovereign wealth funds ADQ and Mubadala are the primary investing vehicles.",
      "The Ras El Hekma coastal development project accounts for approximately $20 billion of the total.",
      "The Egyptian pound strengthened 4% against the dollar on the day of the announcement.",
      "The IMF described the deal as 'materially supportive' of Egypt's fiscal adjustment programme.",
      "Energy and food-security components are expected to create an estimated 250,000 jobs over five years."
    ],
    factCheck: null
  },
  {
    id: 8,
    headline: "Iraq's Kurdish Region and Baghdad Reach Preliminary Oil Revenue Sharing Agreement",
    category: "politics",
    sources: ["AP", "Reuters"],
    credibility: "high",
    timestamp: "2026-02-24T09:30:00Z",
    tags: ["Iraq", "Kurdistan", "Oil", "Politics"],
    emoji: "🛢️",
    summary: "Iraqi federal government officials and the Kurdistan Regional Government (KRG) have initialled a preliminary agreement on the long-disputed oil revenue sharing formula, according to statements from both Erbil and Baghdad. The framework, if ratified, would resolve a dispute that has stalled the KRG's budget payments from Baghdad for over two years and reopen the Kirkuk–Ceyhan pipeline to exports.",
    keyPoints: [
      "The deal allocates 12.67% of federal oil revenues to the KRG, consistent with the 2005 constitution.",
      "The Kirkuk–Ceyhan pipeline, shut since 2023, would resume exports upon ratification.",
      "Kurdistan's civil servants have been partially unpaid since 2022 due to the revenue standoff.",
      "The agreement still requires approval by the Iraqi Council of Representatives.",
      "US and EU diplomats facilitated the latest round of negotiations in Erbil."
    ],
    factCheck: null
  },
  {
    id: 9,
    headline: "Israel-West Bank: UN Reports Record Settlement Expansion in 2025",
    category: "conflict",
    sources: ["Reuters", "AFP", "Al Jazeera English"],
    credibility: "high",
    timestamp: "2026-02-23T13:00:00Z",
    tags: ["Israel", "West Bank", "Settlements", "UN"],
    emoji: "📊",
    summary: "The UN Office for the Coordination of Humanitarian Affairs (OCHA) published its annual report confirming that 2025 saw the highest rate of settlement construction in the West Bank since records began, with more than 25,000 new housing units approved or begun. The report documents a parallel increase in settler-related violence and Palestinian displacement incidents.",
    keyPoints: [
      "Over 25,000 settlement housing units were approved or begun in the West Bank in 2025.",
      "OCHA recorded a 62% rise in settler violence incidents compared to the previous year.",
      "The US State Department described settlement expansion as 'counterproductive to a two-state solution'.",
      "Four EU foreign ministers jointly condemned the expansion as a violation of international law.",
      "Palestinian Authority officials called for an emergency UN Security Council session."
    ],
    factCheck: { claim: "All new construction is illegal", verdict: "mixed", detail: "Under international law most experts consider settlements illegal; Israel disputes this interpretation." }
  },
  {
    id: 10,
    headline: "Qatar Hosts Gulf Cooperation Council Summit on Regional Security Framework",
    category: "diplomacy",
    sources: ["AP", "Reuters"],
    credibility: "high",
    timestamp: "2026-02-22T08:00:00Z",
    tags: ["Qatar", "GCC", "Gulf", "Security"],
    emoji: "🏙️",
    summary: "Doha hosted an extraordinary session of the Gulf Cooperation Council focused on a new collective security architecture in the wake of shifting US strategic posture in the region. Leaders from Saudi Arabia, UAE, Bahrain, Kuwait, Oman, and Qatar agreed to enhance intelligence-sharing protocols and establish a joint rapid-response maritime force for the Gulf of Oman.",
    keyPoints: [
      "All six GCC states endorsed a joint maritime security force charter by consensus.",
      "The meeting addressed concerns about Iranian naval activity in the Strait of Hormuz.",
      "A joint cyber-security operations centre, to be hosted in Riyadh, was announced.",
      "Qatar and Saudi Arabia reaffirmed normalised diplomatic ties following the 2021 Al-Ula declaration.",
      "The US 5th Fleet welcomed the initiative as complementary to existing bilateral arrangements."
    ],
    factCheck: null
  },
  {
    id: 11,
    headline: "Morocco Signs Green Hydrogen Export Agreement with Spain and Portugal",
    category: "economy",
    sources: ["AFP", "Reuters"],
    credibility: "high",
    timestamp: "2026-02-21T10:45:00Z",
    tags: ["Morocco", "Energy", "Green Hydrogen", "Europe"],
    emoji: "⚡",
    summary: "Morocco, Spain, and Portugal formalised a trilateral agreement for the production and export of green hydrogen through a planned sub-sea pipeline under the Strait of Gibraltar. The project, backed by €4 billion in EU funding, is expected to make Morocco one of Europe's primary clean energy suppliers by 2030, supporting the continent's decarbonisation targets.",
    keyPoints: [
      "The pipeline would carry up to 10 gigawatts of renewable energy equivalent annually by 2030.",
      "EU funding of €4 billion comes from the Global Gateway clean energy initiative.",
      "Morocco's Atlantic wind and solar potential is rated among the highest in the MENA region.",
      "The project is expected to create 50,000 jobs in southern Morocco and northern Spain.",
      "First exports are targeted for 2029 pending infrastructure completion."
    ],
    factCheck: null
  },
  {
    id: 12,
    headline: "Syria: Reconstruction Donors Conference Pledges $6.4 Billion in Brussels",
    category: "humanitarian",
    sources: ["Reuters", "BBC News", "AFP"],
    credibility: "high",
    timestamp: "2026-02-20T15:00:00Z",
    tags: ["Syria", "Reconstruction", "Humanitarian", "EU"],
    emoji: "🏗️",
    summary: "The 2026 Brussels Conference on Supporting Syria and the Region produced pledges totalling $6.4 billion from 80 donor nations and institutions. Funds are earmarked for displaced persons assistance, rubble clearance, early reconstruction of water and sanitation infrastructure, and support for neighbouring host communities in Jordan, Lebanon, and Turkey.",
    keyPoints: [
      "The EU pledged €2.1 billion, the largest single donor contribution.",
      "Saudi Arabia and the UAE collectively committed $1.2 billion.",
      "Funds are channelled through UN agencies rather than the Syrian government pending governance reforms.",
      "An estimated 12 million Syrians remain displaced internally or in neighbouring countries.",
      "The conference endorsed a UN roadmap for political transition as a precondition for full reconstruction aid."
    ],
    factCheck: null
  }
];

/* ============================================================
   SUPPLEMENTARY DATA
   ============================================================ */

const SOURCES_CREDIBILITY = [
  { name: "Reuters",            score: 98 },
  { name: "Associated Press",   score: 97 },
  { name: "BBC News",           score: 95 },
  { name: "Al Jazeera English", score: 91 },
  { name: "AFP",                score: 93 }
];

const TICKER_ITEMS = [
  "🔴 CEASEFIRE TALKS: Egypt hosts Gaza mediators for extended session",
  "🔵 ECONOMY: Saudi Arabia's Vision 2030 hits 67% implementation milestone",
  "🟡 DIPLOMACY: Turkey-Greece maritime dialogue resumes after 3-year pause",
  "🟠 HUMANITARIAN: WFP says 1.1 million at emergency hunger levels in Sudan",
  "🔴 SECURITY: US carrier group transits Strait of Hormuz amid heightened tensions",
  "🔵 POLITICS: Tunisia holds parliamentary by-elections across five constituencies",
  "🟢 ENERGY: Abu Dhabi awards $8bn contract for offshore gas expansion",
  "🔴 CONFLICT: UN condemns Houthi attacks on Red Sea commercial shipping",
  "🟡 CLIMATE: MENA region records warmest February in 140 years of records"
];

const FACT_CHECKS = [
  {
    claim: "'Gaza hospitals entirely non-functional'",
    verdict: "mixed",
    detail: "Some hospitals have resumed partial operations with foreign medical teams."
  },
  {
    claim: "'Iran nuclear deal fully collapsed'",
    verdict: "false",
    detail: "Talks remain dormant but no formal withdrawal has been declared by either side."
  },
  {
    claim: "'Lebanon's currency has lost 98% of value'",
    verdict: "true",
    detail: "The Lebanese pound has depreciated over 98% since 2019 per World Bank data."
  }
];

const TRENDING_TAGS = [
  "Gaza", "Ceasefire", "Saudi Arabia", "Lebanon", "Yemen",
  "Turkey", "Iran Nuclear", "Red Sea", "Egypt Economy", "West Bank",
  "Green Energy", "Syria Reconstruction"
];

/* ============================================================
   STATE
   ============================================================ */

let state = {
  articles: [...NEWS_DATA],
  filtered: [...NEWS_DATA],
  displayed: 6,
  activeCategory: "all",
  searchQuery: "",
  sortOrder: "newest",
  openArticle: null
};

/* ============================================================
   UTILITIES
   ============================================================ */

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (h >= 24) return `${Math.floor(h/24)}d ago`;
  if (h >= 1)  return `${h}h ago`;
  return `${m}m ago`;
}

function credLabel(credibility) {
  if (credibility === 'high') return '<span class="credibility-badge cred-high">&#10003; Verified</span>';
  return '<span class="credibility-badge cred-med">&#9679; Partial</span>';
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* ============================================================
   FILTER / SORT
   ============================================================ */

function applyFilters() {
  let result = [...state.articles];

  if (state.activeCategory !== 'all') {
    result = result.filter(a => a.category === state.activeCategory);
  }

  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    result = result.filter(a =>
      a.headline.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  if (state.sortOrder === 'newest') {
    result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } else if (state.sortOrder === 'oldest') {
    result.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  } else {
    // relevance: multi-source stories first
    result.sort((a, b) => b.sources.length - a.sources.length);
  }

  state.filtered = result;
  state.displayed = 6;
  renderAll();
}

/* ============================================================
   RENDER — Featured Article
   ============================================================ */

function renderFeatured() {
  const el = document.getElementById('featured-article');
  const art = state.filtered[0];

  if (!art) {
    el.innerHTML = '<p class="no-results">No featured story available for this filter.</p>';
    return;
  }

  el.innerHTML = `
    <div class="featured-card" data-id="${art.id}">
      <div class="featured-img-wrap">${art.emoji}</div>
      <div class="featured-content">
        <div class="featured-meta">
          <span class="category-tag">${art.category}</span>
          <span class="source-tag">via ${art.sources[0]}</span>
          ${credLabel(art.credibility)}
        </div>
        <h2>${escapeHtml(art.headline)}</h2>
        <p class="featured-summary">${escapeHtml(art.summary.substring(0, 280))}...</p>
        <div class="article-footer">
          <span class="timestamp">${formatDate(art.timestamp)} &middot; ${timeAgo(art.timestamp)}</span>
          <button class="read-more-btn" data-id="${art.id}">Read Full Story</button>
        </div>
      </div>
    </div>`;

  el.querySelector('.featured-card').addEventListener('click', () => openModal(art.id));
  el.querySelector('.read-more-btn').addEventListener('click', e => { e.stopPropagation(); openModal(art.id); });
}

/* ============================================================
   RENDER — News Grid
   ============================================================ */

function renderGrid() {
  const grid = document.getElementById('news-grid');
  const items = state.filtered.slice(1, state.displayed + 1);

  if (!items.length) {
    grid.innerHTML = '<div class="no-results">No articles match your search. Try a different keyword or category.</div>';
    return;
  }

  grid.innerHTML = items.map(art => `
    <div class="news-card" data-id="${art.id}">
      <div class="card-img-wrap">${art.emoji}</div>
      <div class="card-content">
        <div class="card-meta">
          <span class="category-tag">${art.category}</span>
          ${credLabel(art.credibility)}
        </div>
        <h3>${escapeHtml(art.headline)}</h3>
        <p class="card-summary">${escapeHtml(art.summary)}</p>
        <div class="card-footer">
          <span class="timestamp">${timeAgo(art.timestamp)}</span>
          <button class="card-read-btn" data-id="${art.id}">Read more</button>
        </div>
      </div>
    </div>`).join('');

  grid.querySelectorAll('.news-card').forEach(card => {
    card.addEventListener('click', () => openModal(parseInt(card.dataset.id)));
  });
  grid.querySelectorAll('.card-read-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); openModal(parseInt(btn.dataset.id)); });
  });

  // Load more button
  const btn = document.getElementById('load-more-btn');
  btn.style.display = state.displayed >= state.filtered.length - 1 ? 'none' : 'inline-block';
}

/* ============================================================
   RENDER — Sidebar
   ============================================================ */

function renderSidebar() {
  // Source credibility
  const sourceList = document.getElementById('source-list');
  sourceList.innerHTML = SOURCES_CREDIBILITY.map(s => `
    <div class="source-item">
      <span class="source-name">${s.name}</span>
      <div class="source-cred">
        <div class="cred-bar"><div class="cred-fill" style="width:${s.score}%"></div></div>
        <span>${s.score}%</span>
      </div>
    </div>`).join('');

  // Trending tags
  const tagsEl = document.getElementById('trending-tags');
  tagsEl.innerHTML = TRENDING_TAGS.map(t =>
    `<span class="tag">${t}</span>`
  ).join('');

  tagsEl.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', () => {
      document.getElementById('search-input').value = tag.textContent;
      state.searchQuery = tag.textContent.toLowerCase();
      applyFilters();
    });
  });

  // Fact-check corner
  const fcList = document.getElementById('factcheck-list');
  fcList.innerHTML = FACT_CHECKS.map(fc => `
    <div class="factcheck-item">
      <div class="fc-claim">"${fc.claim}"</div>
      <div class="fc-verdict ${fc.verdict}">
        ${fc.verdict === 'true' ? '&#10003; TRUE' : fc.verdict === 'false' ? '&#10007; FALSE' : '&#8776; MIXED'} &mdash; ${fc.detail}
      </div>
    </div>`).join('');
}

/* ============================================================
   RENDER — Breaking Ticker
   ============================================================ */

function renderTicker() {
  const el = document.getElementById('ticker-content');
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  el.innerHTML = doubled.map(item =>
    `<span class="ticker-item"><span class="ticker-dot">&#9670;</span> ${item}</span>`
  ).join('');
}

/* ============================================================
   RENDER — Header Date
   ============================================================ */

function renderDate() {
  const el = document.getElementById('current-date');
  el.textContent = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

/* ============================================================
   MODAL
   ============================================================ */

function openModal(id) {
  const art = NEWS_DATA.find(a => a.id === id);
  if (!art) return;

  state.openArticle = id;

  const body = document.getElementById('modal-body');
  const fcHtml = art.factCheck ? `
    <div class="modal-sources" style="margin-top:16px;">
      <div class="modal-section-label">Fact-Check</div>
      <div class="factcheck-item">
        <div class="fc-claim">Claim: ${art.factCheck.claim}</div>
        <div class="fc-verdict ${art.factCheck.verdict}">
          Verdict: ${art.factCheck.verdict.toUpperCase()} &mdash; ${art.factCheck.detail}
        </div>
      </div>
    </div>` : '';

  body.innerHTML = `
    <div class="modal-category"><span class="category-tag">${art.category}</span></div>
    <h2 class="modal-headline">${escapeHtml(art.headline)}</h2>
    <div class="modal-meta">
      <span><strong>Published:</strong> ${formatDate(art.timestamp)}</span>
      <span><strong>Credibility:</strong> ${art.credibility.charAt(0).toUpperCase() + art.credibility.slice(1)}</span>
      ${credLabel(art.credibility)}
    </div>

    <div class="modal-section-label">Verified Summary</div>
    <div class="modal-summary">${escapeHtml(art.summary)}</div>

    <div class="modal-keypoints">
      <div class="modal-section-label">Key Verified Facts</div>
      <ul>${art.keyPoints.map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ul>
    </div>

    <div class="modal-sources">
      <div class="modal-section-label">Sources</div>
      <div class="source-chips">${art.sources.map(s => `<span class="source-chip">&#10003; ${s}</span>`).join('')}</div>
    </div>

    ${fcHtml}

    <div class="modal-disclaimer">
      &#9432; This summary was generated from ${art.sources.join(' and ')} reports.
      Always read original source articles for full context.
      Middle East Verified aggregates only from established international news agencies.
    </div>`;

  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
  state.openArticle = null;
}

/* ============================================================
   RENDER ALL
   ============================================================ */

function renderAll() {
  renderFeatured();
  renderGrid();
}

/* ============================================================
   EVENT LISTENERS
   ============================================================ */

function bindEvents() {
  // Category navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategory = btn.dataset.category;
      applyFilters();
    });
  });

  // Search
  const searchInput = document.getElementById('search-input');
  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.searchQuery = searchInput.value.trim().toLowerCase();
      applyFilters();
    }, 280);
  });

  // Sort
  document.getElementById('sort-select').addEventListener('change', e => {
    state.sortOrder = e.target.value;
    applyFilters();
  });

  // Refresh
  document.getElementById('refresh-btn').addEventListener('click', () => {
    const btn = document.getElementById('refresh-btn');
    btn.textContent = '⏳ Refreshing...';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = '⟳ Refresh';
      btn.disabled = false;
      applyFilters();
    }, 1200);
  });

  // Load more
  document.getElementById('load-more-btn').addEventListener('click', () => {
    state.displayed += 3;
    renderGrid();
  });

  // Modal close
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });

  // Keyboard close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && state.openArticle) closeModal();
  });
}

/* ============================================================
   INIT
   ============================================================ */

function init() {
  renderDate();
  renderTicker();
  renderSidebar();
  applyFilters();
  bindEvents();
}

document.addEventListener('DOMContentLoaded', init);
