import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useFinancial } from '../context/FinancialContext';
import { analyzePurchase } from '../engine/financialEngine';
import { PurchaseAnalysis } from '../types';

const PRESETS = [
  {
    name: 'New Car (Financed)',
    emoji: '🚗',
    price: 38000,
    down: 7000,
    rate: 7.5,
    term: 60,
    insurance: 180,
    maintenance: 100,
    fuel: 120,
  },
  {
    name: 'Used Car (Cash)',
    emoji: '🚙',
    price: 14000,
    down: 14000,
    rate: 0,
    term: 0,
    insurance: 90,
    maintenance: 80,
    fuel: 100,
  },
  {
    name: 'Luxury Vacation',
    emoji: '✈️',
    price: 8000,
    down: 8000,
    rate: 0,
    term: 0,
    insurance: 0,
    maintenance: 0,
    fuel: 0,
  },
  {
    name: 'Home Renovation',
    emoji: '🏗️',
    price: 25000,
    down: 25000,
    rate: 0,
    term: 0,
    insurance: 0,
    maintenance: 0,
    fuel: 0,
  },
];

function verdictConfig(verdict: PurchaseAnalysis['verdict']) {
  if (verdict === 'consider')
    return {
      color: 'text-emerald-400',
      bg: 'border-emerald-500/30 bg-emerald-500/5',
      icon: '✅',
      label: 'Consider It',
    };
  if (verdict === 'wait')
    return {
      color: 'text-amber-400',
      bg: 'border-amber-500/30 bg-amber-500/5',
      icon: '⏸️',
      label: 'Wait / Reconsider',
    };
  return {
    color: 'text-red-400',
    bg: 'border-red-500/30 bg-red-500/5',
    icon: '🚫',
    label: "Don't Buy This",
  };
}

export default function DecisionLab() {
  const { profile } = useFinancial();

  const [name, setName] = useState('New Car (Financed)');
  const [price, setPrice] = useState(38000);
  const [down, setDown] = useState(7000);
  const [rate, setRate] = useState(7.5);
  const [term, setTerm] = useState(60);
  const [insurance, setInsurance] = useState(180);
  const [maintenance, setMaintenance] = useState(100);
  const [fuel, setFuel] = useState(120);

  const analysis = analyzePurchase(
    name,
    price,
    down,
    rate,
    term,
    insurance,
    maintenance,
    fuel,
    profile
  );

  const vc = verdictConfig(analysis.verdict);

  function applyPreset(preset: (typeof PRESETS)[0]) {
    setName(preset.name);
    setPrice(preset.price);
    setDown(preset.down);
    setRate(preset.rate);
    setTerm(preset.term);
    setInsurance(preset.insurance);
    setMaintenance(preset.maintenance);
    setFuel(preset.fuel);
  }

  const costBreakdown = [
    { name: 'Loan Payment', value: analysis.monthlyPayment, color: '#6366f1' },
    { name: 'Insurance', value: insurance, color: '#f59e0b' },
    { name: 'Maintenance', value: maintenance, color: '#10b981' },
    { name: 'Fuel / Other', value: fuel, color: '#8b5cf6' },
  ].filter((c) => c.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-elevated border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
        <div className="font-semibold text-white">{payload[0].name}</div>
        <div className="text-slate-300">${payload[0].value}/month</div>
      </div>
    );
  };

  const scoreColor =
    analysis.score >= 70
      ? 'text-emerald-400'
      : analysis.score >= 45
      ? 'text-amber-400'
      : 'text-red-400';

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Decision Lab</h1>
        <p className="text-slate-500 text-sm mt-1">
          Should you buy it? Enter any purchase and get an instant financial verdict.
        </p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left: input form */}
        <div className="col-span-2 space-y-5">
          {/* Presets */}
          <div className="card">
            <div className="stat-label mb-3">Quick Scenarios</div>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left border transition-all text-xs font-medium ${
                    name === p.name
                      ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
                      : 'border-border text-slate-400 hover:text-white hover:bg-elevated'
                  }`}
                >
                  <span>{p.emoji}</span>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="card space-y-3">
            <div className="stat-label mb-1">Purchase Details</div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Item name</label>
              <input
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 2024 Honda Civic"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Purchase price ($)</label>
                <input
                  type="number"
                  className="input-field"
                  value={price}
                  onChange={(e) => setPrice(+e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Down payment ($)</label>
                <input
                  type="number"
                  className="input-field"
                  value={down}
                  onChange={(e) => setDown(+e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Loan rate (%/yr)</label>
                <input
                  type="number"
                  className="input-field"
                  value={rate}
                  step="0.1"
                  onChange={(e) => setRate(+e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Loan term (months)</label>
                <input
                  type="number"
                  className="input-field"
                  value={term}
                  onChange={(e) => setTerm(+e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="stat-label mb-2">Monthly Ongoing Costs</div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Insurance</label>
                  <input
                    type="number"
                    className="input-field"
                    value={insurance}
                    onChange={(e) => setInsurance(+e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Maintenance</label>
                  <input
                    type="number"
                    className="input-field"
                    value={maintenance}
                    onChange={(e) => setMaintenance(+e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Fuel / Other</label>
                  <input
                    type="number"
                    className="input-field"
                    value={fuel}
                    onChange={(e) => setFuel(+e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: results */}
        <div className="col-span-3 space-y-5">
          {/* Verdict */}
          <div className={`border rounded-xl p-5 ${vc.bg}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-1">
                  Fintel's Verdict
                </div>
                <div className={`text-2xl font-extrabold ${vc.color}`}>
                  {vc.icon} {vc.label}
                </div>
                <div className="text-sm text-slate-400 mt-1">{name}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 mb-1">Decision Score</div>
                <div className={`text-4xl font-black ${scoreColor}`}>{analysis.score}</div>
                <div className="text-xs text-slate-500">/ 100</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    analysis.score >= 70
                      ? 'bg-emerald-500'
                      : analysis.score >= 45
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${analysis.score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Key numbers */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center">
              <div className="stat-label mb-1">Monthly Cost</div>
              <div className="text-xl font-bold text-white">
                ${analysis.totalMonthlyCost.toLocaleString()}
              </div>
              <div className={`text-xs mt-1 font-semibold ${analysis.incomePercent > 15 ? 'text-red-400' : 'text-slate-400'}`}>
                {analysis.incomePercent.toFixed(1)}% of income
              </div>
            </div>
            <div className="card text-center">
              <div className="stat-label mb-1">FIRE Delay</div>
              <div className={`text-xl font-bold ${analysis.fireDelayYears > 1 ? 'text-red-400' : 'text-amber-400'}`}>
                {analysis.fireDelayYears > 0
                  ? `+${analysis.fireDelayYears.toFixed(1)} yrs`
                  : 'No delay'}
              </div>
              <div className="text-xs text-slate-500 mt-1">to your retirement</div>
            </div>
            <div className="card text-center">
              <div className="stat-label mb-1">Opportunity Cost</div>
              <div className="text-xl font-bold text-red-400">
                ${(analysis.totalOpportunityCost / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-slate-500 mt-1">invested over 30 yrs</div>
            </div>
          </div>

          {/* Cost breakdown chart */}
          {costBreakdown.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-3">Monthly Cost Breakdown</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart
                  data={costBreakdown}
                  layout="vertical"
                  margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={18}>
                    {costBreakdown.map((entry, index) => (
                      <Cell key={index} fill={entry.color} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-between items-center mt-2 pt-3 border-t border-border">
                <span className="text-xs text-slate-400">Total monthly cost of ownership</span>
                <span className="text-sm font-bold text-white">
                  ${analysis.totalMonthlyCost.toLocaleString()}/mo
                </span>
              </div>
            </div>
          )}

          {/* Reasons */}
          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-3">Why This Verdict</h3>
            <ul className="space-y-2">
              {analysis.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span
                    className={`mt-0.5 shrink-0 ${
                      analysis.verdict === 'avoid'
                        ? 'text-red-400'
                        : analysis.verdict === 'wait'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {analysis.verdict === 'consider' ? '✓' : '✗'}
                  </span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Down payment</span>
                  <span className="text-white font-semibold">${down.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Loan amount</span>
                  <span className="text-white font-semibold">
                    ${Math.max(0, price - down).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly payment</span>
                  <span className="text-white font-semibold">
                    ${analysis.monthlyPayment.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total loan cost</span>
                  <span className="text-white font-semibold">
                    ${analysis.totalLoanCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Down payment → 30yr growth</span>
                  <span className="text-red-400 font-semibold">
                    ${(analysis.downPaymentGrowth / 1000).toFixed(0)}K foregone
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Emergency fund safe?</span>
                  <span
                    className={`font-semibold ${
                      profile.emergencyFund - down >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {profile.emergencyFund - down >= 0
                      ? `$${(profile.emergencyFund - down).toLocaleString()} remaining`
                      : 'Depleted — danger'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
