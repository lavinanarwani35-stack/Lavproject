import { useState } from 'react';
import { UserProfile } from '../types';
import { DEFAULT_PROFILE } from '../data/sampleData';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  onBack: () => void;
}

type DraftProfile = Omit<UserProfile, 'spending'> & {
  spending: Array<{ id: string; name: string; emoji: string; monthly: number; benchmarkMin: number; benchmarkMax: number; color: string }>;
};

const STEP_TITLES = [
  'The basics',
  'Your savings picture',
  'Monthly spending',
  'Goals & launch',
];

const STEP_SUBTITLES = [
  'Everything is calculated against your income, so this is the foundation.',
  'Your current financial cushion and any ongoing debt obligations.',
  'Rough estimates are fine — you can update everything anytime inside the app.',
  'Set your targets and review your profile before we run the analysis.',
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < current
                ? 'bg-indigo-600 text-white'
                : i === current
                ? 'bg-indigo-600/20 border-2 border-indigo-500 text-indigo-400'
                : 'bg-border text-slate-600'
            }`}
          >
            {i < current ? '✓' : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className={`h-px w-8 transition-all ${i < current ? 'bg-indigo-600' : 'bg-border'}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-600 mt-1.5">{hint}</p>}
    </div>
  );
}

function CurrencyInput({
  value,
  onChange,
  placeholder,
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
        $
      </span>
      <input
        type="number"
        className="input-field pl-7"
        value={value || ''}
        placeholder={placeholder || '0'}
        onChange={(e) => onChange(Math.max(0, +e.target.value))}
      />
    </div>
  );
}

/* ── Step 1: Basics ───────────────────────────────────────────── */
function Step1({
  draft,
  update,
}: {
  draft: DraftProfile;
  update: <K extends keyof DraftProfile>(k: K, v: DraftProfile[K]) => void;
}) {
  return (
    <div className="space-y-5">
      <FormField label="What should we call you?">
        <input
          className="input-field"
          value={draft.name}
          placeholder="Alex"
          onChange={(e) => update('name', e.target.value)}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Your age">
          <input
            type="number"
            className="input-field"
            value={draft.age || ''}
            placeholder="32"
            onChange={(e) => update('age', +e.target.value)}
          />
        </FormField>

        <FormField
          label="Monthly take-home income"
          hint="After all taxes and deductions"
        >
          <CurrencyInput
            value={draft.monthlyIncome}
            onChange={(v) => update('monthlyIncome', v)}
          />
        </FormField>
      </div>

      {draft.monthlyIncome > 0 && (
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 text-sm">
          <div className="text-indigo-400 font-semibold mb-2">Income benchmarks at ${draft.monthlyIncome.toLocaleString()}/mo</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400">
            {[
              { cat: 'Housing', pct: '25–30%', amount: `$${Math.round(draft.monthlyIncome * 0.25).toLocaleString()}–$${Math.round(draft.monthlyIncome * 0.30).toLocaleString()}` },
              { cat: 'Food & Dining', pct: '10–15%', amount: `$${Math.round(draft.monthlyIncome * 0.10).toLocaleString()}–$${Math.round(draft.monthlyIncome * 0.15).toLocaleString()}` },
              { cat: 'Transportation', pct: '10–15%', amount: `$${Math.round(draft.monthlyIncome * 0.10).toLocaleString()}–$${Math.round(draft.monthlyIncome * 0.15).toLocaleString()}` },
              { cat: 'Entertainment', pct: '5–8%', amount: `$${Math.round(draft.monthlyIncome * 0.05).toLocaleString()}–$${Math.round(draft.monthlyIncome * 0.08).toLocaleString()}` },
            ].map((b) => (
              <div key={b.cat} className="flex justify-between gap-2">
                <span>{b.cat}</span>
                <span className="text-slate-500">{b.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Step 2: Savings ──────────────────────────────────────────── */
function Step2({
  draft,
  update,
}: {
  draft: DraftProfile;
  update: <K extends keyof DraftProfile>(k: K, v: DraftProfile[K]) => void;
}) {
  const totalSpending = draft.spending.reduce((s, c) => s + c.monthly, 0);
  const monthsEF = totalSpending > 0 ? draft.emergencyFund / totalSpending : 0;
  const efStatus =
    monthsEF >= 6 ? { label: 'Excellent ✓', color: 'text-emerald-400' } :
    monthsEF >= 3 ? { label: 'OK but needs work', color: 'text-amber-400' } :
    { label: 'Dangerously low ⚠️', color: 'text-red-400' };

  return (
    <div className="space-y-5">
      <FormField
        label="Current investment & retirement accounts"
        hint="Total across 401k, IRA, brokerage, crypto, etc."
      >
        <CurrencyInput
          value={draft.currentSavings}
          onChange={(v) => update('currentSavings', v)}
        />
      </FormField>

      <FormField
        label="Emergency fund (liquid savings)"
        hint="Cash in savings accounts you could access within days"
      >
        <CurrencyInput
          value={draft.emergencyFund}
          onChange={(v) => update('emergencyFund', v)}
        />
        {draft.emergencyFund > 0 && totalSpending > 0 && (
          <div className="mt-2 text-xs">
            Coverage: {monthsEF.toFixed(1)} months of expenses —{' '}
            <span className={efStatus.color}>{efStatus.label}</span>
          </div>
        )}
      </FormField>

      <FormField
        label="Monthly debt payments"
        hint="Minimum payments on car loans, student loans, credit cards, etc. (not mortgage — include that in housing)"
      >
        <CurrencyInput
          value={draft.monthlyDebtPayments}
          onChange={(v) => update('monthlyDebtPayments', v)}
        />
      </FormField>

      {draft.monthlyDebtPayments > 0 && draft.monthlyIncome > 0 && (
        <div className={`text-xs px-3 py-2 rounded-lg border ${
          (draft.monthlyDebtPayments / draft.monthlyIncome) > 0.2
            ? 'bg-red-500/10 border-red-500/25 text-red-400'
            : 'bg-border/40 border-border text-slate-400'
        }`}>
          Debt-to-income ratio:{' '}
          <span className="font-semibold">
            {((draft.monthlyDebtPayments / draft.monthlyIncome) * 100).toFixed(1)}%
          </span>
          {(draft.monthlyDebtPayments / draft.monthlyIncome) > 0.2 && ' — above safe threshold of 20%'}
        </div>
      )}
    </div>
  );
}

/* ── Step 3: Spending ─────────────────────────────────────────── */
function Step3({
  draft,
  updateSpending,
}: {
  draft: DraftProfile;
  updateSpending: (id: string, v: number) => void;
}) {
  const total = draft.spending.reduce((s, c) => s + c.monthly, 0);
  const savings = draft.monthlyIncome - total - draft.monthlyDebtPayments;
  const savingsRate = draft.monthlyIncome > 0 ? (savings / draft.monthlyIncome) * 100 : 0;

  return (
    <div className="space-y-1">
      {draft.spending.map((cat) => {
        const pct = draft.monthlyIncome > 0 ? (cat.monthly / draft.monthlyIncome) * 100 : 0;
        const isOver = pct > cat.benchmarkMax;
        const isUnder = cat.benchmarkMin > 0 && pct < cat.benchmarkMin;
        return (
          <div
            key={cat.id}
            className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
              isOver ? 'bg-red-500/5' : 'hover:bg-elevated/50'
            }`}
          >
            <span className="text-lg w-6 text-center shrink-0">{cat.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium text-slate-300 truncate">{cat.name}</span>
                {isOver && (
                  <span className="text-[10px] text-red-400 font-semibold shrink-0">
                    over
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-600">
                benchmark {cat.benchmarkMin}–{cat.benchmarkMax}%{' '}
                {draft.monthlyIncome > 0 && (
                  <span>
                    ($
                    {Math.round((draft.monthlyIncome * cat.benchmarkMin) / 100).toLocaleString()}–$
                    {Math.round((draft.monthlyIncome * cat.benchmarkMax) / 100).toLocaleString()}
                    )
                  </span>
                )}
              </div>
            </div>
            <div className="relative w-28 shrink-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                $
              </span>
              <input
                type="number"
                className={`input-field pl-6 text-right text-sm pr-2 py-1.5 ${
                  isOver ? 'border-red-500/40 text-red-300' : ''
                }`}
                value={cat.monthly || ''}
                placeholder="0"
                onChange={(e) => updateSpending(cat.id, Math.max(0, +e.target.value))}
              />
            </div>
            <div
              className={`text-xs font-semibold w-12 text-right shrink-0 ${
                isOver ? 'text-red-400' : isUnder ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              {pct.toFixed(1)}%
            </div>
          </div>
        );
      })}

      {/* Live summary */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">Total spending</span>
          <span className="font-semibold text-white">${total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Monthly savings</span>
          <span className={`font-bold ${savings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {savings >= 0 ? '+' : ''}${savings.toLocaleString()}
            {draft.monthlyIncome > 0 && (
              <span className="font-normal text-slate-500 ml-1">
                ({savingsRate.toFixed(1)}%)
              </span>
            )}
          </span>
        </div>
        {savingsRate < 15 && savings > 0 && (
          <div className="text-xs text-amber-400 mt-2">
            ⚠️ Target 20%+ savings rate for serious wealth building
          </div>
        )}
        {savingsRate >= 20 && (
          <div className="text-xs text-emerald-400 mt-2">
            ✓ Strong savings rate — FIRE is achievable
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Step 4: Goals ────────────────────────────────────────────── */
function Step4({
  draft,
  update,
}: {
  draft: DraftProfile;
  update: <K extends keyof DraftProfile>(k: K, v: DraftProfile[K]) => void;
}) {
  const totalSpending = draft.spending.reduce((s, c) => s + c.monthly, 0);
  const savings = draft.monthlyIncome - totalSpending - draft.monthlyDebtPayments;
  const savingsRate = draft.monthlyIncome > 0 ? (savings / draft.monthlyIncome) * 100 : 0;
  const fireNumber = totalSpending * 12 * 25;
  const yearsToTarget = draft.targetRetirementAge - draft.age;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">Target FIRE age</label>
            <span className="text-sm font-bold text-indigo-400">{draft.targetRetirementAge}</span>
          </div>
          <input
            type="range"
            min={30}
            max={70}
            step={1}
            value={draft.targetRetirementAge}
            onChange={(e) => update('targetRetirementAge', +e.target.value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-600 mt-1">
            <span>Age 30</span>
            <span>Age 70</span>
          </div>
          {draft.age > 0 && (
            <div className="text-xs text-slate-500 mt-1">
              {yearsToTarget > 0 ? `${yearsToTarget} years from now` : 'Already there!'}
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">Expected annual return</label>
            <span className="text-sm font-bold text-indigo-400">{draft.expectedReturn}%</span>
          </div>
          <input
            type="range"
            min={4}
            max={12}
            step={0.5}
            value={draft.expectedReturn}
            onChange={(e) => update('expectedReturn', +e.target.value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-600 mt-1">
            <span>4% (bonds)</span>
            <span>12% (aggressive)</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            S&P 500 avg: ~10% nominal, ~7% real
          </div>
        </div>
      </div>

      {/* Profile summary */}
      <div className="bg-elevated border border-border rounded-xl p-5">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
          Your Profile Summary
        </div>
        <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
          {[
            { label: 'Name & age', value: `${draft.name}, ${draft.age}` },
            { label: 'Monthly income', value: `$${draft.monthlyIncome.toLocaleString()}` },
            { label: 'Monthly spending', value: `$${totalSpending.toLocaleString()}` },
            { label: 'Monthly savings', value: `$${savings.toLocaleString()} (${savingsRate.toFixed(1)}%)` },
            { label: 'Investments', value: `$${draft.currentSavings.toLocaleString()}` },
            { label: 'Emergency fund', value: `$${draft.emergencyFund.toLocaleString()}` },
            { label: 'FIRE number', value: fireNumber > 0 ? `$${(fireNumber / 1000000).toFixed(2)}M` : '—' },
            { label: 'Target FIRE age', value: `${draft.targetRetirementAge}` },
          ].map((row) => (
            <div key={row.label} className="flex justify-between gap-4">
              <span className="text-slate-500">{row.label}</span>
              <span className="text-white font-semibold text-right">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-sm text-indigo-300">
        ⚡ Your financial diagnosis takes about 2 seconds to run. We'll calculate your health
        score, FIRE timeline, and generate personalized insights based on these numbers.
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────── */
export default function Onboarding({ onComplete, onBack }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<DraftProfile>(
    JSON.parse(JSON.stringify(DEFAULT_PROFILE))
  );

  function update<K extends keyof DraftProfile>(key: K, value: DraftProfile[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function updateSpending(id: string, monthly: number) {
    setDraft((d) => ({
      ...d,
      spending: d.spending.map((c) => (c.id === id ? { ...c, monthly } : c)),
    }));
  }

  function canProceed() {
    if (step === 0) return draft.name.trim().length > 0 && draft.monthlyIncome > 0 && draft.age > 0;
    if (step === 3) {
      const spending = draft.spending.reduce((s, c) => s + c.monthly, 0);
      return spending > 0 && draft.monthlyIncome > 0;
    }
    return true;
  }

  function handleNext() {
    if (step < 3) setStep(step + 1);
    else onComplete(draft as UserProfile);
  }

  const steps = [
    <Step1 key={0} draft={draft} update={update} />,
    <Step2 key={1} draft={draft} update={update} />,
    <Step3 key={2} draft={draft} updateSpending={updateSpending} />,
    <Step4 key={3} draft={draft} update={update} />,
  ];

  return (
    <div className="min-h-screen bg-base flex items-start justify-center py-16 px-4">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-20 left-1/3 w-96 h-64 bg-indigo-600/8 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <button
            onClick={onBack}
            className="text-slate-600 hover:text-slate-400 transition-colors mr-1"
          >
            ←
          </button>
          <span className="text-lg">⚡</span>
          <span className="font-extrabold text-white">Fintel</span>
        </div>

        {/* Step indicator */}
        <div className="mb-8">
          <StepIndicator current={step} total={4} />
        </div>

        {/* Step header */}
        <div className="mb-7">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
            Step {step + 1} of 4
          </p>
          <h1 className="text-2xl font-black text-white mb-2">{STEP_TITLES[step]}</h1>
          <p className="text-sm text-slate-400">{STEP_SUBTITLES[step]}</p>
        </div>

        {/* Form card */}
        <div className="bg-surface border border-border rounded-2xl p-6 mb-5 animate-fade-in">
          {steps[step]}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 border border-border text-slate-400 hover:text-white hover:border-slate-500 rounded-xl text-sm font-medium transition-all"
            >
              ← Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              canProceed()
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-lg hover:shadow-indigo-500/20'
                : 'bg-border text-slate-600 cursor-not-allowed'
            }`}
          >
            {step < 3
              ? 'Continue →'
              : '🔍 Get My Financial Diagnosis →'}
          </button>
        </div>

        {step === 0 && (
          <p className="text-center text-xs text-slate-600 mt-4">
            All data is stored locally in your browser. Nothing is sent to any server.
          </p>
        )}
      </div>
    </div>
  );
}
