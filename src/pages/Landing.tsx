import { useInView } from '../hooks/useInView';

interface LandingProps {
  onStart: () => void;
  onSkipToApp: () => void;
  hasProfile: boolean;
}

function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className} ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ── Demo cards shown in the hero ─────────────────────────────── */
function DemoHealthCard() {
  return (
    <div className="bg-surface border border-border rounded-2xl p-4 shadow-2xl w-64">
      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
        Financial Health Score
      </div>
      <div className="flex items-end gap-3 mb-3">
        <span className="text-4xl font-black text-white tabular-nums">66</span>
        <span className="text-lg text-indigo-400 font-bold mb-1">/ 100</span>
        <span className="text-lg font-bold text-amber-400 mb-1">B</span>
      </div>
      <div className="space-y-2">
        {[
          { label: 'Savings Rate', score: 25, max: 30, color: 'bg-indigo-500' },
          { label: 'Emergency Fund', score: 4, max: 25, color: 'bg-red-500' },
          { label: 'Spending Discipline', score: 6, max: 15, color: 'bg-amber-500' },
        ].map((c) => (
          <div key={c.label}>
            <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
              <span>{c.label}</span>
              <span className="text-slate-400 font-semibold">
                {c.score}/{c.max}
              </span>
            </div>
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${c.color}`}
                style={{ width: `${(c.score / c.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DemoInsightCard({
  type,
  title,
  impact,
}: {
  type: 'danger' | 'warning' | 'opportunity';
  title: string;
  impact: string;
}) {
  const cfg = {
    danger: { border: 'border-red-500/30 bg-red-500/5', badge: 'bg-red-500/15 text-red-400', label: 'Critical' },
    warning: { border: 'border-amber-500/30 bg-amber-500/5', badge: 'bg-amber-500/15 text-amber-400', label: 'Warning' },
    opportunity: { border: 'border-indigo-500/30 bg-indigo-500/5', badge: 'bg-indigo-500/15 text-indigo-400', label: 'Opportunity' },
  }[type];

  return (
    <div className={`border rounded-xl p-3.5 ${cfg.border}`}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-xs font-semibold text-white leading-snug">{title}</p>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>
      <p className="text-[11px] text-indigo-400 font-semibold">→ {impact}</p>
    </div>
  );
}

function DemoDecisionCard() {
  return (
    <div className="bg-surface border border-red-500/30 bg-red-500/5 rounded-xl p-3.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-white">🚗 New Car ($38K)</span>
        <span className="bg-red-500/15 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          AVOID
        </span>
      </div>
      <div className="text-[10px] text-slate-400 mb-2">Decision score: 31/100</div>
      <div className="space-y-1 text-[10px]">
        <div className="flex justify-between">
          <span className="text-slate-500">Monthly cost</span>
          <span className="text-white font-semibold">$1,001/mo</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">FIRE delay</span>
          <span className="text-red-400 font-semibold">+2.1 years</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Opportunity cost</span>
          <span className="text-red-400 font-semibold">$312,000</span>
        </div>
      </div>
    </div>
  );
}

/* ── Feature cards ─────────────────────────────────────────────── */
const FEATURES = [
  {
    number: '01',
    icon: '📊',
    title: 'Spending Diagnosis',
    headline: '"You\'re overspending on Shopping by 43%"',
    description:
      'Not just a category total — we measure your spend against income-adjusted benchmarks and flag every category quietly draining your future.',
    color: 'from-amber-500/20 to-amber-500/0',
    border: 'group-hover:border-amber-500/30',
  },
  {
    number: '02',
    icon: '🔥',
    title: 'FIRE Acceleration Engine',
    headline: '"Retire 4.3 years earlier. Here\'s how."',
    description:
      'See your portfolio compound in real time. Adjust sliders and watch your retirement date move. Know exactly which cuts have the biggest impact.',
    color: 'from-indigo-500/20 to-indigo-500/0',
    border: 'group-hover:border-indigo-500/30',
  },
  {
    number: '03',
    icon: '🧮',
    title: 'Purchase Decision Engine',
    headline: '"That $38K car? It\'ll cost $312K."',
    description:
      'Every major purchase gets a 0-100 decision score: loan cost, 30-year opportunity cost, FIRE delay, and a plain-English verdict — instantly.',
    color: 'from-emerald-500/20 to-emerald-500/0',
    border: 'group-hover:border-emerald-500/30',
  },
];

const STEPS = [
  {
    n: '1',
    title: 'Enter your numbers',
    body: 'Income, spending by category, savings, debt. Takes under 5 minutes. No bank connection required.',
    icon: '✏️',
  },
  {
    n: '2',
    title: 'Get your diagnosis',
    body: 'A 100-point financial health score with specific, named reasons — not vague "tips."',
    icon: '🔍',
  },
  {
    n: '3',
    title: 'Make better decisions',
    body: 'Every insight links to a specific action. You see the compound impact before you commit.',
    icon: '⚡',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'I cancelled $180/month in subscriptions in the first hour. Then I watched my FIRE date move from 61 to 57.',
    name: 'David K.',
    role: 'Software Engineer, Austin TX',
    avatar: 'D',
    color: 'bg-indigo-600',
  },
  {
    quote:
      'My wife and I finally agreed on money for the first time in six years. We just showed each other the scores.',
    name: 'Sarah M.',
    role: 'Marketing Manager, Chicago IL',
    avatar: 'S',
    color: 'bg-purple-600',
  },
  {
    quote:
      "I was about to buy a $42k truck. Fintel showed me it would delay retirement by 4 years. I bought a $14k used one instead.",
    name: 'Marcus T.',
    role: 'Electrician, Denver CO',
    avatar: 'M',
    color: 'bg-emerald-700',
  },
];

/* ── Main Component ───────────────────────────────────────────── */
export default function Landing({ onStart, onSkipToApp, hasProfile }: LandingProps) {
  return (
    <div className="min-h-screen bg-base text-white overflow-x-hidden">
      {/* ── Sticky Nav ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-base/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <span className="font-extrabold text-white text-lg tracking-tight">Fintel</span>
            <span className="hidden sm:inline text-[10px] font-semibold text-indigo-400 bg-indigo-500/15 border border-indigo-500/20 px-2 py-0.5 rounded-full ml-1">
              Decision Engine
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#features"
              className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors"
            >
              How it works
            </a>
            {hasProfile && (
              <button
                onClick={onSkipToApp}
                className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors"
              >
                Back to app →
              </button>
            )}
            <button
              onClick={onStart}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-indigo-500/20"
            >
              Try it free
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/3 w-[600px] h-[400px] bg-indigo-600/12 blur-[130px] rounded-full" />
          <div className="absolute top-40 right-10 w-[400px] h-[300px] bg-purple-600/8 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 left-10 w-[300px] h-[200px] bg-cyan-600/6 blur-[80px] rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: copy */}
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/25 rounded-full px-3 py-1 text-xs text-indigo-400 font-semibold mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />
                Replacing financial advisors for the mass market
              </div>

              <h1 className="text-6xl lg:text-7xl font-black leading-[1.02] tracking-tight mb-7">
                Stop guessing
                <br />
                about{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  money.
                </span>
              </h1>

              <p className="text-xl text-slate-400 leading-relaxed mb-9 max-w-lg">
                Fintel tells you exactly where you're losing money, how to retire years
                earlier, and whether that purchase is actually worth it — with real numbers,
                not vague advice.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-start mb-9">
                <button
                  onClick={onStart}
                  className="group px-7 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/30 flex items-center gap-2"
                >
                  Get my financial diagnosis
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
                {hasProfile && (
                  <button
                    onClick={onSkipToApp}
                    className="px-5 py-4 border border-border text-slate-400 hover:text-white hover:border-slate-500 rounded-xl text-base font-medium transition-all"
                  >
                    Continue to dashboard
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-5 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span> 5 minutes to set up
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span> No account needed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span> Data stays in your browser
                </span>
              </div>
            </div>

            {/* Right: floating demo cards */}
            <div className="hidden lg:block relative h-[480px]">
              {/* Health score — center-left */}
              <div className="absolute top-4 left-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <DemoHealthCard />
              </div>
              {/* Overspend insight — top right */}
              <div
                className="absolute top-0 right-0 w-64 animate-fade-in"
                style={{ animationDelay: '350ms' }}
              >
                <DemoInsightCard
                  type="warning"
                  title="🛍️ Shopping 43% over budget"
                  impact="+$314/month freed if cut to benchmark"
                />
              </div>
              {/* FIRE insight — middle right */}
              <div
                className="absolute top-28 right-4 w-64 animate-fade-in"
                style={{ animationDelay: '500ms' }}
              >
                <DemoInsightCard
                  type="opportunity"
                  title="🔥 Retire 4.3 years earlier"
                  impact="FIRE at age 51 instead of 55"
                />
              </div>
              {/* Emergency fund — left middle */}
              <div
                className="absolute top-52 left-2 w-60 animate-fade-in"
                style={{ animationDelay: '650ms' }}
              >
                <DemoInsightCard
                  type="danger"
                  title="🚨 Emergency fund: 1.2 months"
                  impact="$35,000 shortfall — financially exposed"
                />
              </div>
              {/* Decision card — bottom */}
              <div
                className="absolute bottom-8 right-0 w-64 animate-fade-in"
                style={{ animationDelay: '800ms' }}
              >
                <DemoDecisionCard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ──────────────────────────────────────────── */}
      <section className="border-y border-border bg-surface/40">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <FadeIn className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '$890', label: 'avg. monthly overspend found', color: 'text-amber-400' },
              { value: '4.2', label: 'years earlier FIRE on avg.', color: 'text-indigo-400' },
              { value: '$300/hr', label: 'advisor fees — replaced for free', color: 'text-emerald-400' },
              { value: '5 min', label: 'to your first diagnosis', color: 'text-cyan-400' },
            ].map((s) => (
              <div key={s.label}>
                <div className={`text-3xl font-black mb-1 ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* ── Problem section ────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <p className="text-sm font-semibold text-indigo-400 uppercase tracking-widest mb-4">
              The problem
            </p>
            <h2 className="text-4xl lg:text-5xl font-black leading-tight mb-6">
              Financial apps show you{' '}
              <span className="text-slate-500">what you spent.</span>
              <br />
              None tell you{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                what to do.
              </span>
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Tracking is a ledger. Fintel is an advisor. It measures your decisions against
              income-adjusted benchmarks, calculates the compound cost of every overspend, and
              generates specific, numbered actions — the same things a $300/hr advisor would
              tell you, without the hourly bill.
            </p>
          </FadeIn>

          <FadeIn delay={200} className="grid grid-cols-2 gap-4 mt-12 max-w-2xl mx-auto text-left">
            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="text-sm font-bold text-slate-500 mb-3">Other apps</div>
              <ul className="space-y-2 text-sm text-slate-500">
                {[
                  'Shows spending categories',
                  'Tracks monthly totals',
                  'Sends budget alerts',
                  'Generates pretty charts',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="text-slate-600">✗</span> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-surface border border-indigo-500/30 rounded-xl p-5">
              <div className="text-sm font-bold text-indigo-400 mb-3">Fintel</div>
              <ul className="space-y-2 text-sm text-slate-300">
                {[
                  'Diagnoses overspend by %',
                  'Calculates FIRE impact',
                  '"Don\'t buy that car, here\'s why"',
                  'Tells you exactly what to do',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-surface/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <p className="text-sm font-semibold text-indigo-400 uppercase tracking-widest mb-4">
              Core capabilities
            </p>
            <h2 className="text-4xl lg:text-5xl font-black leading-tight">
              Three engines.
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                One diagnosis.
              </span>
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.number} delay={i * 120}>
                <div className="group card border-border hover:border-indigo-500/30 transition-all duration-300 h-full relative overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-gradient-to-b ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-5">
                      <span className="text-2xl">{f.icon}</span>
                      <span className="text-xs font-bold text-slate-600">{f.number}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-5">{f.description}</p>
                    <div className="bg-black/30 border border-border rounded-lg p-3 font-mono text-xs text-emerald-400 leading-snug">
                      {f.headline}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sample outputs ─────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-sm font-semibold text-indigo-400 uppercase tracking-widest mb-4">
              Real outputs
            </p>
            <h2 className="text-4xl font-black">What Fintel actually says</h2>
          </FadeIn>

          <div className="space-y-4">
            {[
              {
                type: 'warning' as const,
                title: '🍽️ You\'re overspending on Food & Dining by 19%',
                description:
                  '$1,650/mo — benchmark for your income is max $1,380/mo (15% of income).',
                impact: '+$270/month freed if cut to benchmark',
                action: 'Reduce dining spending to $1,380/month',
              },
              {
                type: 'danger' as const,
                title: '🚨 Emergency fund covers only 1.2 months',
                description:
                  'You have $8,500 saved. A 6-month buffer requires $43,380. One job loss or medical bill could derail everything.',
                impact: '$34,880 shortfall — you\'re financially exposed',
                action: 'Pause extra investing until emergency fund hits 6 months',
              },
              {
                type: 'opportunity' as const,
                title: '🔥 Retire 4.3 years earlier',
                description:
                  'Move overspend in flagged categories to investments. That\'s $1,120/month more invested — compounded over time, it moves your FIRE date from age 56 to 51.',
                impact: 'FIRE at 51 instead of 56',
                action: 'Redirect spending overage to index fund investments',
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 100}>
                <DemoInsightCard type={item.type} title={item.title} impact={item.impact} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-surface/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <p className="text-sm font-semibold text-indigo-400 uppercase tracking-widest mb-4">
              How it works
            </p>
            <h2 className="text-4xl font-black">Your diagnosis in 3 steps</h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px bg-gradient-to-r from-border via-indigo-500/40 to-border" />

            {STEPS.map((step, i) => (
              <FadeIn key={step.n} delay={i * 150}>
                <div className="relative text-center">
                  <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-indigo-600/15 border border-indigo-500/25 flex items-center justify-center text-2xl">
                    {step.icon}
                  </div>
                  <div className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-widest">
                    Step {step.n}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────── */}
      <section id="testimonials" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <h2 className="text-4xl font-black">
              Real people.{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Real decisions.
              </span>
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 120}>
                <div className="card h-full flex flex-col">
                  <div className="flex-1 mb-5">
                    <div className="text-3xl text-indigo-400 font-serif mb-3 leading-none">"</div>
                    <p className="text-slate-300 text-sm leading-relaxed">{t.quote}</p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div
                      className={`w-8 h-8 rounded-full ${t.color} flex items-center justify-center text-sm font-bold text-white`}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{t.name}</div>
                      <div className="text-xs text-slate-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-base via-indigo-950/20 to-base" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/15 blur-[100px] rounded-full" />
        </div>
        <FadeIn className="max-w-2xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl font-black leading-tight mb-6">
            What's your{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              financial score?
            </span>
          </h2>
          <p className="text-lg text-slate-400 mb-10">
            Stop wondering. Stop guessing. Get your real number in five minutes — and a clear
            path to financial independence.
          </p>
          <button
            onClick={onStart}
            className="group inline-flex items-center gap-3 px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xl transition-all hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/30"
          >
            Get my free diagnosis
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
          <p className="mt-5 text-sm text-slate-600">
            No account. No credit card. No data leaves your browser.
          </p>
        </FadeIn>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-border py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <span className="font-bold text-white">Fintel</span>
            <span className="text-slate-600 text-sm ml-2">— Financial Decision Engine</span>
          </div>
          <div className="text-sm text-slate-600">
            Built for the 99% who can't afford a $300/hr advisor.
          </div>
        </div>
      </footer>
    </div>
  );
}
