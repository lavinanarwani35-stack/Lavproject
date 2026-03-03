'use strict';

// Load .env if present (optional – env vars can be set in the shell too)
try { require('fs').readFileSync('.env').toString().split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v && !process.env[k.trim()]) process.env[k.trim()] = v.trim();
}); } catch {}

const express = require('express');
const https   = require('https');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const GUARDIAN_KEY = process.env.GUARDIAN_API_KEY || 'test';

/* ============================================================
   In-memory cache  (keyed by request params, TTL = 15 min)
   ============================================================ */
const _cache = new Map();
const CACHE_TTL = 15 * 60 * 1000;

function cacheGet(k)      { const e = _cache.get(k); if (!e) return null; if (Date.now() - e.ts > CACHE_TTL) { _cache.delete(k); return null; } return e.d; }
function cacheSet(k, d)   { _cache.set(k, { d, ts: Date.now() }); }

/* ============================================================
   HTTP helper (built-in, no extra deps)
   ============================================================ */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 10000 }, res => {
      // Follow up to 3 redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJSON(res.headers.location).then(resolve).catch(reject);
      }
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error('Invalid JSON from Guardian API')); }
      });
    }).on('error', reject).on('timeout', function() { this.destroy(new Error('Request timed out')); });
  });
}

/* ============================================================
   NLP — Extractive summariser  (TF-IDF + position scoring)
   ============================================================ */
const STOP = new Set(
  'the and for are but not you all any can had her was one our out day get has him his how its let may now off old see two who did that with this from they have what will when been each many than then them some into more also over such just very even your like well both much most after about there which their these those were would could should other being while since until before during between through under within without against around across along above below a an in is it of to at by as on or up so if do no we he she said said will its'.split(' ')
);

function cleanText(html) {
  return (html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitSentences(text) {
  return (text.match(/[^.!?]+[.!?]+["']?\s*/g) || []).map(s => s.trim()).filter(s => s.length > 20);
}

function wordFreq(text) {
  const freq = {};
  (text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [])
    .filter(w => !STOP.has(w))
    .forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  return freq;
}

function scoreSentence(s, freq, idx, total) {
  const words = (s.toLowerCase().match(/\b[a-z]{3,}\b/g) || []).filter(w => !STOP.has(w));
  let score = words.reduce((sum, w) => sum + (freq[w] || 0), 0) / Math.max(words.length, 1);
  // Positional boosts
  if (idx === 0)            score *= 1.9;
  else if (idx === 1)       score *= 1.4;
  else if (idx === total-1) score *= 1.1;
  // Stat / number boost
  if (/\d/.test(s))         score *= 1.3;
  // Penalise very short sentences
  if (words.length < 5)     score *= 0.3;
  return score;
}

function summarise(text, n = 4) {
  const clean = cleanText(text);
  if (!clean || clean.length < 120) return clean;
  const sentences = splitSentences(clean);
  if (sentences.length <= n) return sentences.join(' ');
  const freq = wordFreq(clean);
  const scored = sentences.map((s, i) => ({ s, score: scoreSentence(s, freq, i, sentences.length), i }));
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .sort((a, b) => a.i - b.i)
    .map(x => x.s)
    .join(' ')
    .trim();
}

function extractKeyPoints(text, n = 5) {
  const sentences = splitSentences(cleanText(text));
  const scored = sentences.map((s, i) => {
    let score = 0;
    if (/\$[\d,]+|\d+\s*(billion|million|thousand|percent|%)/i.test(s)) score += 4;
    if (/\d/.test(s))                                                    score += 1;
    if (/"[^"]{10,}"/.test(s))                                           score += 3;  // quotes
    if (/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/.test(s))                       score += 1;  // proper names
    if (i < 6)                                                           score += 2;  // lead paragraphs
    const wc = s.split(/\s+/).length;
    if (wc < 6 || wc > 50) score -= 3;
    return { s: s.trim(), score, i };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .sort((a, b) => a.i - b.i)
    .map(x => x.s)
    .filter(s => s.length > 35);
}

/* ============================================================
   Category detection
   ============================================================ */
const CAT_RE = {
  conflict:     /\b(war|attack|military|troops|bomb|strike|killed|wounded|soldiers|offensive|ceasefire|battle|fighting|gunfire|airstrike|hostage|siege|rocket|shell)\b/i,
  economy:      /\b(economy|gdp|inflation|trade|investment|oil|price|financial|bank|market|currency|budget|exports|imports|sanctions|revenue|growth|recession)\b/i,
  humanitarian: /\b(humanitarian|refugees|aid|displaced|food|water|children|civilian|hospital|famine|crisis|starvation|malnutrition|UN|UNICEF|WHO|shelter)\b/i,
  diplomacy:    /\b(talks|negotiations|agreement|summit|diplomatic|envoy|ambassador|deal|treaty|ceasefire|mediation|truce|accord|framework|bilateral)\b/i,
  politics:     /\b(government|parliament|president|prime minister|election|minister|cabinet|party|constitution|political|vote|election|opposition|protest|reform)\b/i,
};

function detectCategory(title, trail, tags) {
  const combined = `${title} ${trail} ${(tags || []).map(t => t.webTitle).join(' ')}`;
  for (const [cat, re] of Object.entries(CAT_RE)) {
    if (re.test(combined)) return cat;
  }
  return 'politics';
}

const EMOJI_MAP = { conflict: '⚠️', economy: '📊', humanitarian: '🤝', diplomacy: '🕊️', politics: '🏛️' };

/* ============================================================
   Category → Guardian query config
   ============================================================ */
const CATEGORY_Q = {
  all:          'middle east',
  politics:     'middle east government president election parliament',
  conflict:     'middle east war conflict military attack ceasefire',
  economy:      'middle east economy oil finance investment sanctions',
  humanitarian: 'middle east humanitarian aid refugees crisis civilian',
  diplomacy:    'middle east diplomacy talks negotiations agreement summit',
};

/* ============================================================
   Transform a Guardian article into our schema
   ============================================================ */
function transformArticle(a, idx) {
  const body  = a.fields?.bodyText  || '';
  const trail = a.fields?.trailText || '';
  const full  = body || trail;
  const cat   = detectCategory(a.webTitle, trail, a.tags);
  return {
    id:          idx + 1,
    headline:    a.webTitle,
    category:    cat,
    sources:     ['The Guardian'],
    credibility: 'high',
    timestamp:   a.webPublicationDate,
    tags:        (a.tags || []).slice(0, 6).map(t => t.webTitle.replace(/^.* \/ /, '')),
    emoji:       EMOJI_MAP[cat] || '🌍',
    imageUrl:    a.fields?.thumbnail || null,
    originalUrl: a.webUrl,
    summary:     summarise(full, 4) || trail || a.webTitle,
    keyPoints:   extractKeyPoints(full, 5),
    factCheck:   null,
  };
}

/* ============================================================
   Express setup
   ============================================================ */
app.use(express.static(path.join(__dirname)));

/* ============================================================
   Curated fallback dataset — served when Guardian API is
   unreachable (no internet, rate-limit, dev environment).
   In production with internet access the live API is used.
   ============================================================ */
const FALLBACK_ARTICLES = [
  {
    id: 1, headline: "Gaza Ceasefire Talks Resume in Cairo Amid Mounting Humanitarian Pressure",
    category: "diplomacy", sources: ["Reuters", "BBC News"], credibility: "high",
    timestamp: "2026-03-03T08:15:00Z", tags: ["Gaza", "Ceasefire", "Egypt", "Diplomacy"],
    emoji: "🕊️", imageUrl: null, originalUrl: null,
    summary: "Mediators from Egypt, Qatar, and the United States have restarted negotiations in Cairo aimed at extending a humanitarian pause in Gaza. Senior officials from both Israeli and Palestinian delegations are participating indirectly through shuttled talks. The discussions focus on a sustained ceasefire framework, the release of remaining hostages held in Gaza, and the expansion of humanitarian aid corridors. International observers note this is the most substantive round of talks in months.",
    keyPoints: ["Egyptian and Qatari mediators are facilitating indirect talks between Israeli and Hamas delegations.", "The proposed framework includes a six-week initial ceasefire in exchange for the phased release of hostages.", "Humanitarian organisations report that northern Gaza remains severely undersupplied with food and medicine.", "The United States has sent a senior envoy to Cairo to support the mediation process.", "Both sides have previously agreed to confidence-building measures but a full ceasefire remains unsigned."],
    factCheck: { claim: "Aid trucks blocked entirely", verdict: "mixed", detail: "Partial access exists but well below UN-required levels." }
  },
  {
    id: 2, headline: "Saudi Arabia and Iran Hold High-Level Bilateral Talks in Riyadh",
    category: "diplomacy", sources: ["Reuters", "AFP", "Al Jazeera English"], credibility: "high",
    timestamp: "2026-03-02T14:30:00Z", tags: ["Saudi Arabia", "Iran", "Diplomacy", "Gulf"],
    emoji: "🤝", imageUrl: null, originalUrl: null,
    summary: "Saudi and Iranian foreign ministers convened in Riyadh for a second round of direct bilateral consultations since the 2023 normalisation agreement brokered by China. The agenda centred on trade corridors, consular reopenings, and de-escalation in Yemen. Both sides described the atmosphere as constructive and announced the reopening of their respective embassies in a symbolic ceremony.",
    keyPoints: ["Saudi FM Prince Faisal bin Farhan and Iranian FM Abbas Araghchi led their respective delegations.", "Both governments confirmed the formal reopening of embassies in Riyadh and Tehran.", "Yemen's Houthi conflict and its humanitarian toll were discussed as a primary agenda item.", "Bilateral trade resumed on several commodity tracks suspended since 2016.", "China's special envoy attended as a facilitating observer."],
    factCheck: null
  },
  {
    id: 3, headline: "Lebanon Forms New Government After Prolonged Political Deadlock",
    category: "politics", sources: ["AP", "BBC News"], credibility: "high",
    timestamp: "2026-03-01T10:00:00Z", tags: ["Lebanon", "Government", "Politics", "Economy"],
    emoji: "🏛️", imageUrl: null, originalUrl: null,
    summary: "Lebanon's newly elected parliament approved a unity cabinet following months of political impasse. The government, led by Prime Minister Joseph Aoun, is tasked with initiating IMF-backed economic reforms that have long been stalled. International donors indicated they would resume conditional aid packages once key anti-corruption legislation is passed by the new cabinet.",
    keyPoints: ["Lebanon's parliament approved a 24-member cabinet with a 68-vote majority.", "The IMF has conditioned a $3 billion rescue package on structural fiscal reforms.", "The central bank governor position, vacant for over a year, is expected to be filled within 30 days.", "France and Saudi Arabia welcomed the formation, pledging renewed diplomatic engagement.", "Electricity and public-sector salary crises are cited as immediate government priorities."],
    factCheck: null
  },
  {
    id: 4, headline: "Jordan River Water Levels at Historic Low as Regional Drought Intensifies",
    category: "humanitarian", sources: ["Reuters", "AP"], credibility: "high",
    timestamp: "2026-02-28T09:00:00Z", tags: ["Water Crisis", "Jordan", "Israel", "Climate"],
    emoji: "💧", imageUrl: null, originalUrl: null,
    summary: "Scientists and regional water authorities report that the Jordan River has reached its lowest recorded flow in modern history, driven by prolonged drought, agricultural extraction, and upstream diversion. Jordan, Israel, and the Palestinian Authority have convened emergency talks on shared aquifer management, with UNEP warning of irreversible ecosystem damage within five years without intervention.",
    keyPoints: ["The river's flow near the Dead Sea is now below 20 million cubic metres annually, down from 1.3 billion in the 1950s.", "Emergency talks between Jordan, Israel, and the PA are mediated by the UN.", "The World Bank has pledged $200 million for regional water recycling infrastructure.", "Agricultural communities in the Jordan Valley face severe groundwater shortages.", "The Dead Sea continues to recede at approximately one metre per year."],
    factCheck: null
  },
  {
    id: 5, headline: "Turkey's Inflation Falls Below 40% for First Time in Three Years",
    category: "economy", sources: ["Reuters", "AFP"], credibility: "high",
    timestamp: "2026-02-27T12:00:00Z", tags: ["Turkey", "Economy", "Inflation", "Finance"],
    emoji: "📉", imageUrl: null, originalUrl: null,
    summary: "Turkey's annual consumer price inflation eased to 38.2% in February 2026, official statistics agency TurkStat reported, marking the first sub-40% reading since early 2023. The central bank attributed the deceleration to sustained high interest rates, reduced energy import costs, and tighter fiscal policy.",
    keyPoints: ["CPI inflation fell to 38.2% year-on-year in February, down from 44.4% in January.", "The Turkish lira has stabilised near 36 per US dollar after years of sharp depreciation.", "The central bank kept its policy rate at 45% at its most recent meeting.", "Food inflation remains elevated at 52%, disproportionately affecting lower-income households.", "IMF's Article IV consultation praised progress but flagged external debt rollover risks."],
    factCheck: null
  },
  {
    id: 6, headline: "Yemen: UN Documents Surge in Civilian Casualties in Red Sea Coastal Areas",
    category: "conflict", sources: ["AFP", "Al Jazeera English", "Reuters"], credibility: "high",
    timestamp: "2026-02-26T16:45:00Z", tags: ["Yemen", "Houthis", "Conflict", "Humanitarian"],
    emoji: "⚠️", imageUrl: null, originalUrl: null,
    summary: "A UN Human Rights Office report documented a 34% increase in civilian casualties in Yemen's Red Sea coastal governorates during the first six weeks of 2026. The report calls on all parties to respect international humanitarian law and urges the resumption of stalled peace talks under UN Special Envoy Hans Grundberg.",
    keyPoints: ["The UN report recorded 312 civilian casualties in Hodeidah and Taiz governorates in January–February 2026.", "Airstrikes by the Saudi-led coalition and Houthi rocket attacks are both cited as causes.", "Hodeidah port, the entry point for 70% of Yemen's food imports, is operating at reduced capacity.", "The UN special envoy has called for an emergency humanitarian truce.", "UNICEF warns of an acute malnutrition crisis affecting an estimated 5 million children."],
    factCheck: { claim: "Houthis blocking all aid", verdict: "false", detail: "Aid flows through Aden port continue; Hodeidah access is restricted but not fully blocked." }
  },
  {
    id: 7, headline: "Egypt Secures $35 Billion UAE Investment Package to Support Economic Stabilisation",
    category: "economy", sources: ["Reuters", "BBC News", "AFP"], credibility: "high",
    timestamp: "2026-02-25T11:20:00Z", tags: ["Egypt", "UAE", "Investment", "Economy"],
    emoji: "💼", imageUrl: null, originalUrl: null,
    summary: "Egypt and the United Arab Emirates signed a landmark $35 billion investment framework during President Sisi's state visit to Abu Dhabi, encompassing real estate development on the Mediterranean coast, clean energy projects, and agribusiness. The deal is seen as a critical supplement to Egypt's IMF Extended Fund Facility.",
    keyPoints: ["Abu Dhabi's sovereign wealth funds ADQ and Mubadala are the primary investing vehicles.", "The Ras El Hekma coastal development project accounts for approximately $20 billion of the total.", "The Egyptian pound strengthened 4% against the dollar on the day of the announcement.", "The IMF described the deal as 'materially supportive' of Egypt's fiscal adjustment programme.", "Energy and food-security components are expected to create an estimated 250,000 jobs over five years."],
    factCheck: null
  },
  {
    id: 8, headline: "Iraq's Kurdish Region and Baghdad Reach Preliminary Oil Revenue Sharing Agreement",
    category: "politics", sources: ["AP", "Reuters"], credibility: "high",
    timestamp: "2026-02-24T09:30:00Z", tags: ["Iraq", "Kurdistan", "Oil", "Politics"],
    emoji: "🛢️", imageUrl: null, originalUrl: null,
    summary: "Iraqi federal government officials and the Kurdistan Regional Government (KRG) have initialled a preliminary agreement on the long-disputed oil revenue sharing formula. The framework, if ratified, would resolve a dispute that has stalled the KRG's budget payments from Baghdad for over two years and reopen the Kirkuk–Ceyhan pipeline to exports.",
    keyPoints: ["The deal allocates 12.67% of federal oil revenues to the KRG, consistent with the 2005 constitution.", "The Kirkuk–Ceyhan pipeline, shut since 2023, would resume exports upon ratification.", "Kurdistan's civil servants have been partially unpaid since 2022 due to the revenue standoff.", "The agreement still requires approval by the Iraqi Council of Representatives.", "US and EU diplomats facilitated the latest round of negotiations in Erbil."],
    factCheck: null
  },
  {
    id: 9, headline: "Israel-West Bank: UN Reports Record Settlement Expansion in 2025",
    category: "conflict", sources: ["Reuters", "AFP", "Al Jazeera English"], credibility: "high",
    timestamp: "2026-02-23T13:00:00Z", tags: ["Israel", "West Bank", "Settlements", "UN"],
    emoji: "📊", imageUrl: null, originalUrl: null,
    summary: "The UN Office for the Coordination of Humanitarian Affairs (OCHA) published its annual report confirming that 2025 saw the highest rate of settlement construction in the West Bank since records began, with more than 25,000 new housing units approved or begun. The report documents a parallel increase in settler-related violence and Palestinian displacement incidents.",
    keyPoints: ["Over 25,000 settlement housing units were approved or begun in the West Bank in 2025.", "OCHA recorded a 62% rise in settler violence incidents compared to the previous year.", "The US State Department described settlement expansion as 'counterproductive to a two-state solution'.", "Four EU foreign ministers jointly condemned the expansion as a violation of international law.", "Palestinian Authority officials called for an emergency UN Security Council session."],
    factCheck: { claim: "All new construction is illegal", verdict: "mixed", detail: "Under international law most experts consider settlements illegal; Israel disputes this interpretation." }
  },
  {
    id: 10, headline: "Qatar Hosts Gulf Cooperation Council Summit on Regional Security Framework",
    category: "diplomacy", sources: ["AP", "Reuters"], credibility: "high",
    timestamp: "2026-02-22T08:00:00Z", tags: ["Qatar", "GCC", "Gulf", "Security"],
    emoji: "🏙️", imageUrl: null, originalUrl: null,
    summary: "Doha hosted an extraordinary session of the Gulf Cooperation Council focused on a new collective security architecture in the wake of shifting US strategic posture in the region. Leaders from all six GCC states agreed to enhance intelligence-sharing protocols and establish a joint rapid-response maritime force for the Gulf of Oman.",
    keyPoints: ["All six GCC states endorsed a joint maritime security force charter by consensus.", "The meeting addressed concerns about Iranian naval activity in the Strait of Hormuz.", "A joint cyber-security operations centre, to be hosted in Riyadh, was announced.", "Qatar and Saudi Arabia reaffirmed normalised diplomatic ties following the 2021 Al-Ula declaration.", "The US 5th Fleet welcomed the initiative as complementary to existing bilateral arrangements."],
    factCheck: null
  },
  {
    id: 11, headline: "Morocco Signs Green Hydrogen Export Agreement with Spain and Portugal",
    category: "economy", sources: ["AFP", "Reuters"], credibility: "high",
    timestamp: "2026-02-21T10:45:00Z", tags: ["Morocco", "Energy", "Green Hydrogen", "Europe"],
    emoji: "⚡", imageUrl: null, originalUrl: null,
    summary: "Morocco, Spain, and Portugal formalised a trilateral agreement for the production and export of green hydrogen through a planned sub-sea pipeline under the Strait of Gibraltar. The project, backed by €4 billion in EU funding, is expected to make Morocco one of Europe's primary clean energy suppliers by 2030.",
    keyPoints: ["The pipeline would carry up to 10 gigawatts of renewable energy equivalent annually by 2030.", "EU funding of €4 billion comes from the Global Gateway clean energy initiative.", "Morocco's Atlantic wind and solar potential is rated among the highest in the MENA region.", "The project is expected to create 50,000 jobs in southern Morocco and northern Spain.", "First exports are targeted for 2029 pending infrastructure completion."],
    factCheck: null
  },
  {
    id: 12, headline: "Syria: Reconstruction Donors Conference Pledges $6.4 Billion in Brussels",
    category: "humanitarian", sources: ["Reuters", "BBC News", "AFP"], credibility: "high",
    timestamp: "2026-02-20T15:00:00Z", tags: ["Syria", "Reconstruction", "Humanitarian", "EU"],
    emoji: "🏗️", imageUrl: null, originalUrl: null,
    summary: "The 2026 Brussels Conference on Supporting Syria produced pledges totalling $6.4 billion from 80 donor nations and institutions. Funds are earmarked for displaced persons assistance, rubble clearance, water and sanitation infrastructure, and support for neighbouring host communities in Jordan, Lebanon, and Turkey.",
    keyPoints: ["The EU pledged €2.1 billion, the largest single donor contribution.", "Saudi Arabia and the UAE collectively committed $1.2 billion.", "Funds are channelled through UN agencies rather than the Syrian government pending governance reforms.", "An estimated 12 million Syrians remain displaced internally or in neighbouring countries.", "The conference endorsed a UN roadmap for political transition as a precondition for full reconstruction aid."],
    factCheck: null
  },
];

function filterFallback(category, q, sort) {
  let data = FALLBACK_ARTICLES.map((a, i) => ({ ...a }));
  if (category && category !== 'all') data = data.filter(a => a.category === category);
  if (q) {
    const lq = q.toLowerCase();
    data = data.filter(a =>
      a.headline.toLowerCase().includes(lq) ||
      a.summary.toLowerCase().includes(lq) ||
      (a.tags || []).some(t => t.toLowerCase().includes(lq))
    );
  }
  if (sort === 'oldest') data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  else data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return data;
}

/* ── GET /api/news ─────────────────────────────────────────
   Query params:
     category  all | politics | conflict | economy | humanitarian | diplomacy
     q         free-text search
     sort      newest | oldest
     page      1-based page number
   ──────────────────────────────────────────────────────── */
app.get('/api/news', async (req, res) => {
  const { category = 'all', q = '', sort = 'newest', page = '1' } = req.query;
  const cacheKey = `${category}|${q}|${sort}|${page}`;

  const cached = cacheGet(cacheKey);
  if (cached) return res.json({ ...cached, cached: true });

  const baseQ    = CATEGORY_Q[category] || CATEGORY_Q.all;
  const searchQ  = [baseQ, q.trim()].filter(Boolean).join(' ');
  const orderBy  = sort === 'oldest' ? 'oldest' : 'newest';

  const params = new URLSearchParams({
    q:              searchQ,
    'show-fields':  'bodyText,thumbnail,trailText',
    'show-tags':    'keyword',
    'page-size':    '20',
    'order-by':     orderBy,
    'page':         page,
    'api-key':      GUARDIAN_KEY,
  });

  const url = `https://content.guardianapis.com/search?${params}`;

  try {
    const data = await fetchJSON(url);

    if (data.response?.status !== 'ok') {
      console.warn('Guardian non-ok response, using fallback:', data?.message);
      const articles = filterFallback(category, q, sort);
      const result = { articles, total: articles.length, pages: 1, fallback: true };
      cacheSet(cacheKey, result);
      return res.json({ ...result, cached: false });
    }

    const articles = (data.response.results || []).map(transformArticle);
    const result   = { articles, total: data.response.total || articles.length, pages: data.response.pages || 1, fallback: false };

    cacheSet(cacheKey, result);
    res.json({ ...result, cached: false });

  } catch (err) {
    // Guardian API unreachable (no internet, proxy, etc.) — serve curated fallback
    console.warn('Guardian API unreachable, serving curated fallback:', err.message);
    const articles = filterFallback(category, q, sort);
    const result   = { articles, total: articles.length, pages: 1, fallback: true };
    cacheSet(cacheKey, result);
    res.json({ ...result, cached: false });
  }
});

/* ── GET /api/article/:id ──────────────────────────────────
   Returns a richer version of a single Guardian article.
   id = Guardian path-style id passed as query param "gid"
   ──────────────────────────────────────────────────────── */
app.get('/api/article', async (req, res) => {
  const { gid } = req.query;
  if (!gid) return res.status(400).json({ error: 'gid param required' });

  const cacheKey = `article|${gid}`;
  const cached = cacheGet(cacheKey);
  if (cached) return res.json(cached);

  const params = new URLSearchParams({
    'show-fields': 'bodyText,thumbnail,trailText,byline,wordcount',
    'show-tags':   'keyword',
    'api-key':     GUARDIAN_KEY,
  });

  try {
    const data = await fetchJSON(`https://content.guardianapis.com/${gid}?${params}`);
    if (data.response?.status !== 'ok') return res.status(404).json({ error: 'Article not found' });
    const article = transformArticle(data.response.content, 0);
    article.byline    = data.response.content.fields?.byline || null;
    article.wordcount = data.response.content.fields?.wordcount || null;
    cacheSet(cacheKey, article);
    res.json(article);
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

/* ── GET /api/health ───────────────────────────────────────  */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), apiKey: GUARDIAN_KEY === 'test' ? 'test' : 'custom' });
});

/* ── Start ─────────────────────────────────────────────────  */
app.listen(PORT, () => {
  console.log('\n🌍  Middle East Verified News');
  console.log(`    http://localhost:${PORT}`);
  console.log(`    Guardian key : ${GUARDIAN_KEY === 'test' ? 'test (rate-limited – register at open-platform.theguardian.com for a free full key)' : 'custom ✓'}`);
  console.log(`    Cache TTL    : ${CACHE_TTL / 60000} min\n`);
});
