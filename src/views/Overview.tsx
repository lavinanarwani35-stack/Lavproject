import { useFinancial } from '../context/FinancialContext';
import HealthScoreGauge from '../components/HealthScoreGauge';
import InsightCard from '../components/InsightCard';

export default function Overview() {
  const { profile, healthScore, fireProjection, insights, monthlySavings, savingsRate, totalSpending } =
    useFinancial();

  const scoreComponents = Object.values(healthScore.components);
  const topInsights = insights.slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Good afternoon, {profile.name}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Here's your financial snapshot and what to do next.
        </p>
      </div>

      {/* Hero stats row */}
      <div className="grid grid-cols-4 gap-4">
        {/* Health score */}
        <div className="card col-span-1 flex flex-col items-center justify-center">
          <div className="stat-label mb-3">Financial Health</div>
          <HealthScoreGauge score={healthScore.overall} size={130} />
        </div>

        {/* Monthly savings */}
        <div className="card col-span-1">
          <div className="stat-label mb-2">Monthly Savings</div>
          <div className={`stat-value ${monthlySavings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ${monthlySavings.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {savingsRate.toFixed(1)}% savings rate
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Income</span>
              <span className="text-white font-medium">${profile.monthlyIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Spending</span>
              <span className="text-white font-medium">${totalSpending.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* FIRE date */}
        <div className="card col-span-1">
          <div className="stat-label mb-2">FIRE Age (Current Path)</div>
          <div className="stat-value text-amber-400">
            {fireProjection.currentFIREAge < 999
              ? `Age ${fireProjection.currentFIREAge.toFixed(0)}`
              : 'Not on track'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {fireProjection.currentFIREAge < 999
              ? `${(fireProjection.currentFIREAge - profile.age).toFixed(1)} years from now`
              : 'Increase savings rate'}
          </div>
          {fireProjection.yearsEarlier > 0.5 && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="text-xs text-indigo-400 font-semibold">
                ⚡ Optimized: Age {fireProjection.optimizedFIREAge.toFixed(0)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {fireProjection.yearsEarlier.toFixed(1)} years earlier possible
              </div>
            </div>
          )}
        </div>

        {/* Portfolio target */}
        <div className="card col-span-1">
          <div className="stat-label mb-2">FIRE Number</div>
          <div className="stat-value">
            ${(fireProjection.currentFireNumber / 1_000_000).toFixed(2)}M
          </div>
          <div className="text-xs text-slate-500 mt-1">
            25× annual expenses (4% rule)
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Invested</span>
              <span className="text-white font-medium">${profile.currentSavings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Progress</span>
              <span className="text-emerald-400 font-medium">
                {((profile.currentSavings / fireProjection.currentFireNumber) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Score Breakdown</h2>
          <span className="text-xs text-slate-500">100 points total</span>
        </div>
        <div className="space-y-3">
          {scoreComponents.map((comp) => {
            const pct = (comp.score / comp.max) * 100;
            const color =
              pct >= 80
                ? 'bg-emerald-500'
                : pct >= 60
                ? 'bg-indigo-500'
                : pct >= 40
                ? 'bg-amber-500'
                : 'bg-red-500';
            return (
              <div key={comp.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-400">{comp.label}</span>
                  <span className="text-xs font-semibold text-white tabular-nums">
                    {comp.score}/{comp.max}
                  </span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top insights */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">
            Decisions to Make Now
          </h2>
          <span className="text-xs text-slate-500">{insights.length} active insights</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {topInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </div>

      {/* Cash flow bar */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-4">Monthly Cash Flow</h2>
        <div className="space-y-2">
          {profile.spending.map((cat) => {
            const pct = (cat.monthly / profile.monthlyIncome) * 100;
            const maxBenchmark = cat.benchmarkMax;
            const isOver = pct > maxBenchmark;
            return (
              <div key={cat.id} className="flex items-center gap-3">
                <span className="text-sm w-5">{cat.emoji}</span>
                <span className="text-xs text-slate-400 w-28 truncate">{cat.name}</span>
                <div className="flex-1 h-5 bg-border rounded relative overflow-hidden">
                  <div
                    className={`h-full rounded transition-all ${isOver ? 'bg-red-500/70' : 'bg-indigo-500/60'}`}
                    style={{ width: `${Math.min(100, (pct / 30) * 100)}%` }}
                  />
                  <div
                    className="absolute top-0 h-full border-r-2 border-amber-400/60"
                    style={{ left: `${Math.min(100, (maxBenchmark / 30) * 100)}%` }}
                    title={`Max benchmark: ${maxBenchmark}%`}
                  />
                </div>
                <span className={`text-xs font-mono w-16 text-right ${isOver ? 'text-red-400' : 'text-slate-400'}`}>
                  ${cat.monthly.toLocaleString()}
                </span>
              </div>
            );
          })}
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <span className="text-sm w-5">💰</span>
            <span className="text-xs text-slate-300 font-semibold w-28">Savings</span>
            <div className="flex-1 h-5 bg-border rounded overflow-hidden">
              <div
                className="h-full bg-emerald-500/70 rounded"
                style={{ width: `${Math.min(100, (savingsRate / 30) * 100)}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 w-16 text-right">
              ${monthlySavings.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 bg-amber-400/60 inline-block rounded" />
            Benchmark max
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 bg-red-500/70 inline-block rounded" />
            Over benchmark
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 bg-indigo-500/60 inline-block rounded" />
            Within benchmark
          </span>
        </div>
      </div>
    </div>
  );
}
