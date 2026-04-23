import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { useFinancial } from '../context/FinancialContext';
import {
  projectPortfolio,
  findYearsToFIRE,
  getMonthlySavings,
  getTotalMonthlySpending,
} from '../engine/financialEngine';

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-elevated border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="font-semibold text-white mb-2">Age {label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }} className="mb-0.5">
          {p.name}: {fmt(p.value)}
        </div>
      ))}
    </div>
  );
};

export default function FIREEngine() {
  const { profile, fireProjection } = useFinancial();
  const [extraMonthly, setExtraMonthly] = useState(0);
  const [customReturn, setCustomReturn] = useState(profile.expectedReturn);

  const baseSavings = getMonthlySavings(profile);
  const baseSpending = getTotalMonthlySpending(profile);
  const simSavings = baseSavings + extraMonthly;
  const simFireNumber = (baseSpending - extraMonthly * 0) * 12 * 25;

  const simYears = findYearsToFIRE(
    profile.currentSavings,
    simSavings,
    customReturn,
    fireProjection.currentFireNumber
  );
  const simFIREAge = profile.age + simYears;

  const chartData = fireProjection.chartData.map((pt) => {
    const simPortfolio = projectPortfolio(
      profile.currentSavings,
      simSavings,
      customReturn,
      (pt.age - profile.age) * 12
    );
    return { ...pt, simulation: Math.round(simPortfolio) };
  });

  const milestones = [
    { label: '25% of FIRE number', pct: 0.25, value: fireProjection.currentFireNumber * 0.25 },
    { label: '50% of FIRE number', pct: 0.5, value: fireProjection.currentFireNumber * 0.5 },
    { label: '75% of FIRE number', pct: 0.75, value: fireProjection.currentFireNumber * 0.75 },
    { label: 'FIRE number (4% rule)', pct: 1, value: fireProjection.currentFireNumber },
  ];

  const currentProgress = profile.currentSavings / fireProjection.currentFireNumber;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">FIRE Engine</h1>
        <p className="text-slate-500 text-sm mt-1">
          Your financial independence projection — and what changes move the needle most.
        </p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <div className="stat-label mb-2">FIRE Number</div>
          <div className="stat-value">{fmt(fireProjection.currentFireNumber)}</div>
          <div className="text-xs text-slate-500 mt-1">25× annual expenses</div>
        </div>
        <div className="card">
          <div className="stat-label mb-2">Current Path</div>
          <div className="stat-value text-amber-400">
            Age {fireProjection.currentFIREAge < 999 ? fireProjection.currentFIREAge.toFixed(0) : '—'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {fireProjection.currentFIREAge < 999
              ? `${(fireProjection.currentFIREAge - profile.age).toFixed(1)} yrs away`
              : 'Increase savings first'}
          </div>
        </div>
        <div className="card">
          <div className="stat-label mb-2">Optimized Path</div>
          <div className="stat-value text-indigo-400">
            Age {fireProjection.optimizedFIREAge < 999 ? fireProjection.optimizedFIREAge.toFixed(0) : '—'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Cut overspend → invest more
          </div>
        </div>
        <div className="card border-emerald-500/30 bg-emerald-500/5">
          <div className="stat-label mb-2 text-emerald-500">Years Saved</div>
          <div className="stat-value text-emerald-400">
            {fireProjection.yearsEarlier > 0 ? fireProjection.yearsEarlier.toFixed(1) : '0'}
          </div>
          <div className="text-xs text-slate-500 mt-1">by optimizing spending</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold text-white">Progress to FIRE</h2>
          <span className="text-sm font-bold text-emerald-400">
            {(currentProgress * 100).toFixed(1)}%
          </span>
        </div>
        <div className="relative h-4 bg-border rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, currentProgress * 100)}%` }}
          />
          {milestones.slice(0, 3).map((m) => (
            <div
              key={m.label}
              className="absolute top-0 h-full border-r border-white/20"
              style={{ left: `${m.pct * 100}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>$0</span>
          <span>{fmt(fireProjection.currentFireNumber * 0.25)}</span>
          <span>{fmt(fireProjection.currentFireNumber * 0.5)}</span>
          <span>{fmt(fireProjection.currentFireNumber * 0.75)}</span>
          <span>{fmt(fireProjection.currentFireNumber)}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-border flex gap-6 text-xs text-slate-400">
          <span>
            Current portfolio:{' '}
            <span className="text-white font-semibold">${profile.currentSavings.toLocaleString()}</span>
          </span>
          <span>
            Remaining:{' '}
            <span className="text-white font-semibold">
              {fmt(Math.max(0, fireProjection.currentFireNumber - profile.currentSavings))}
            </span>
          </span>
          <span>
            Monthly savings:{' '}
            <span className="text-white font-semibold">${baseSavings.toLocaleString()}</span>
          </span>
        </div>
      </div>

      {/* What-if simulator */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-1">What-If Simulator</h2>
        <p className="text-xs text-slate-500 mb-4">
          Drag the sliders to see how changes move your FIRE date in real-time.
        </p>
        <div className="grid grid-cols-2 gap-6 mb-5">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs text-slate-400">Extra monthly investment</label>
              <span className="text-xs font-bold text-indigo-400">+${extraMonthly}/mo</span>
            </div>
            <input
              type="range"
              min={0}
              max={2000}
              step={50}
              value={extraMonthly}
              onChange={(e) => setExtraMonthly(+e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>$0</span>
              <span>$2,000</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs text-slate-400">Expected annual return</label>
              <span className="text-xs font-bold text-indigo-400">{customReturn}%</span>
            </div>
            <input
              type="range"
              min={4}
              max={12}
              step={0.5}
              value={customReturn}
              onChange={(e) => setCustomReturn(+e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>4% (conservative)</span>
              <span>12% (aggressive)</span>
            </div>
          </div>
        </div>

        {extraMonthly > 0 || customReturn !== profile.expectedReturn ? (
          <div className="bg-elevated border border-border rounded-lg p-4 mb-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-white">
                  {simFIREAge < 999 ? `Age ${simFIREAge.toFixed(0)}` : '—'}
                </div>
                <div className="text-xs text-slate-400">Simulated FIRE age</div>
              </div>
              <div>
                <div className={`text-lg font-bold ${simFIREAge < fireProjection.currentFIREAge ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {simFIREAge < 999 && fireProjection.currentFIREAge < 999
                    ? `${Math.abs(fireProjection.currentFIREAge - simFIREAge).toFixed(1)} yrs ${simFIREAge < fireProjection.currentFIREAge ? 'earlier' : 'later'}`
                    : '—'}
                </div>
                <div className="text-xs text-slate-400">vs current path</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  ${(simSavings).toLocaleString()}/mo
                </div>
                <div className="text-xs text-slate-400">total monthly invested</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Projection chart */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-1">Portfolio Projection</h2>
        <p className="text-xs text-slate-500 mb-4">
          Assumes {profile.expectedReturn}% annual return. Dashed line = FIRE target.
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradOptimized" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradSim" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d42" />
            <XAxis
              dataKey="age"
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              label={{ value: 'Age', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 10 }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => fmt(v)}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={fireProjection.currentFireNumber}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              label={{ value: 'FIRE target', position: 'right', fill: '#f59e0b', fontSize: 10 }}
            />
            {fireProjection.optimizedFireNumber !== fireProjection.currentFireNumber && (
              <ReferenceLine
                y={fireProjection.optimizedFireNumber}
                stroke="#6366f1"
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{ value: 'Opt. target', position: 'right', fill: '#6366f1', fontSize: 10 }}
              />
            )}
            <Area
              type="monotone"
              dataKey="current"
              name="Current path"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#gradCurrent)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="optimized"
              name="Optimized path"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#gradOptimized)"
              dot={false}
            />
            {(extraMonthly > 0 || customReturn !== profile.expectedReturn) && (
              <Area
                type="monotone"
                dataKey="simulation"
                name="Your simulation"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#gradSim)"
                dot={false}
                strokeDasharray="6 3"
              />
            )}
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
              formatter={(value) => (
                <span style={{ color: '#94a3b8' }}>{value}</span>
              )}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Key levers */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-4">Biggest Levers to Pull</h2>
        <div className="space-y-3">
          {[
            {
              label: 'Increase savings rate by 5%',
              saving: profile.monthlyIncome * 0.05,
              impact: '~2 years earlier',
              color: 'text-indigo-400',
            },
            {
              label: 'Cut dining to benchmark max',
              saving: Math.max(
                0,
                (profile.spending.find((c) => c.id === 'food')?.monthly ?? 0) -
                  (profile.monthlyIncome *
                    (profile.spending.find((c) => c.id === 'food')?.benchmarkMax ?? 0)) /
                    100
              ),
              impact: 'Lower FIRE number + more invested',
              color: 'text-amber-400',
            },
            {
              label: 'Cut shopping to benchmark max',
              saving: Math.max(
                0,
                (profile.spending.find((c) => c.id === 'shopping')?.monthly ?? 0) -
                  (profile.monthlyIncome *
                    (profile.spending.find((c) => c.id === 'shopping')?.benchmarkMax ?? 0)) /
                    100
              ),
              impact: 'Direct investment increase',
              color: 'text-red-400',
            },
          ]
            .filter((l) => l.saving > 0)
            .map((lever, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-elevated rounded-lg px-4 py-3"
              >
                <div>
                  <div className="text-sm font-medium text-white">{lever.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{lever.impact}</div>
                </div>
                <div className={`text-sm font-bold ${lever.color}`}>
                  +${Math.round(lever.saving).toLocaleString()}/mo
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
