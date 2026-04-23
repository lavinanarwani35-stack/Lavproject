import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { useFinancial } from '../context/FinancialContext';

export default function SpendingAnalysis() {
  const { profile, totalSpending, savingsRate, monthlySavings } = useFinancial();

  const categories = profile.spending.map((cat) => {
    const pct = (cat.monthly / profile.monthlyIncome) * 100;
    const maxBenchmark = cat.benchmarkMax;
    const minBenchmark = cat.benchmarkMin;
    const isOver = pct > maxBenchmark;
    const isUnder = pct < minBenchmark;
    const overspendPct = isOver ? ((pct - maxBenchmark) / maxBenchmark) * 100 : 0;
    const overspendAmount = isOver
      ? cat.monthly - (profile.monthlyIncome * maxBenchmark) / 100
      : 0;
    const benchmarkMaxAmount = (profile.monthlyIncome * maxBenchmark) / 100;
    return {
      ...cat,
      pct,
      isOver,
      isUnder,
      overspendPct,
      overspendAmount,
      benchmarkMaxAmount,
      status: isOver ? 'over' : isUnder ? 'under' : 'ok',
    };
  });

  const chartData = categories.map((c) => ({
    name: c.emoji + ' ' + c.name,
    actual: Math.round(c.pct * 10) / 10,
    benchmark: c.benchmarkMax,
    color: c.isOver ? '#ef4444' : '#6366f1',
  }));

  const totalOverspend = categories.reduce((s, c) => s + c.overspendAmount, 0);
  const overspentCount = categories.filter((c) => c.isOver).length;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-elevated border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
        <div className="font-semibold text-white mb-1">{label}</div>
        <div className="text-slate-300">Actual: {payload[0]?.value}% of income</div>
        <div className="text-amber-400">Benchmark max: {payload[1]?.value}%</div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Spending Analysis</h1>
        <p className="text-slate-500 text-sm mt-1">
          How your spending compares to income benchmarks — where the engine flags problems.
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <div className="stat-label mb-2">Total Spending</div>
          <div className="stat-value">${totalSpending.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">
            {((totalSpending / profile.monthlyIncome) * 100).toFixed(1)}% of income
          </div>
        </div>
        <div className="card">
          <div className="stat-label mb-2">Monthly Savings</div>
          <div className={`stat-value ${monthlySavings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ${monthlySavings.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">{savingsRate.toFixed(1)}% rate</div>
        </div>
        <div className="card">
          <div className="stat-label mb-2">Categories Over Budget</div>
          <div className={`stat-value ${overspentCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {overspentCount} / {categories.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {overspentCount === 0 ? 'All within benchmark' : 'Need attention'}
          </div>
        </div>
        <div className="card">
          <div className="stat-label mb-2">Monthly Overspend</div>
          <div className={`stat-value ${totalOverspend > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            ${Math.round(totalOverspend).toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {totalOverspend > 0
              ? `Could be invested instead`
              : 'No overspend detected'}
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-1">
          Spending vs. Benchmark (% of Income)
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Orange bars = actual spend. Dashed line = max recommended % for your income level.
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              unit="%"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="actual" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} fillOpacity={0.85} />
              ))}
            </Bar>
            <Bar dataKey="benchmark" fill="transparent" maxBarSize={40}>
              {chartData.map((_, index) => (
                <Cell
                  key={index}
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category deep-dive */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-4">Category Breakdown</h2>
        <div className="space-y-5">
          {categories.map((cat) => {
            const barWidth = Math.min(100, (cat.monthly / (profile.monthlyIncome * 0.35)) * 100);
            const benchmarkBarWidth = Math.min(
              100,
              (cat.benchmarkMaxAmount / (profile.monthlyIncome * 0.35)) * 100
            );
            return (
              <div key={cat.id}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cat.emoji}</span>
                    <div>
                      <span className="text-sm font-semibold text-white">{cat.name}</span>
                      {cat.isOver && (
                        <span className="ml-2 badge-danger">
                          +{cat.overspendPct.toFixed(0)}% over
                        </span>
                      )}
                      {!cat.isOver && !cat.isUnder && (
                        <span className="ml-2 badge-success">✓ On track</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">
                      ${cat.monthly.toLocaleString()}
                      <span className="text-slate-500 font-normal text-xs ml-1">
                        / mo
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {cat.pct.toFixed(1)}% of income
                    </div>
                  </div>
                </div>

                {/* Bar */}
                <div className="relative h-4 bg-border rounded-full overflow-hidden mb-1">
                  {/* Benchmark range fill */}
                  <div
                    className="absolute top-0 h-full bg-indigo-500/15 rounded-full"
                    style={{ width: `${benchmarkBarWidth}%` }}
                  />
                  {/* Actual bar */}
                  <div
                    className={`absolute top-0 h-full rounded-full transition-all duration-500 ${
                      cat.isOver ? 'bg-red-500/80' : 'bg-indigo-500/70'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-slate-500">
                  <span>
                    Benchmark: ${Math.round((profile.monthlyIncome * cat.benchmarkMin) / 100).toLocaleString()}–$
                    {Math.round(cat.benchmarkMaxAmount).toLocaleString()}/mo ({cat.benchmarkMin}–{cat.benchmarkMax}%)
                  </span>
                  {cat.isOver && (
                    <span className="text-red-400 font-semibold">
                      ${Math.round(cat.overspendAmount).toLocaleString()} over max
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optimization summary */}
      {totalOverspend > 0 && (
        <div className="border border-indigo-500/30 bg-indigo-500/5 rounded-xl p-5">
          <h3 className="text-sm font-bold text-indigo-300 mb-2">
            ⚡ If you cut overspend to benchmark levels:
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-white">
                +${Math.round(totalOverspend).toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">Extra savings / month</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">
                +${Math.round(totalOverspend * 12).toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">Extra savings / year</div>
            </div>
            <div>
              <div className="text-xl font-bold text-emerald-400">
                ${Math.round((totalOverspend * 12 * 25) / 1000).toLocaleString()}k
              </div>
              <div className="text-xs text-slate-400">Reduction in FIRE number</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
