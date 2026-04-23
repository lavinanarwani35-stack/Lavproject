import { useState } from 'react';
import { UserProfile, SpendingCategory } from '../types';

interface ProfileEditorProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

export default function ProfileEditor({ profile, onSave, onClose }: ProfileEditorProps) {
  const [draft, setDraft] = useState<UserProfile>(JSON.parse(JSON.stringify(profile)));

  function updateField<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setDraft((p) => ({ ...p, [key]: value }));
  }

  function updateSpending(id: string, monthly: number) {
    setDraft((p) => ({
      ...p,
      spending: p.spending.map((c) => (c.id === id ? { ...c, monthly } : c)),
    }));
  }

  const totalSpending = draft.spending.reduce((s, c) => s + c.monthly, 0);
  const savings = draft.monthlyIncome - totalSpending - draft.monthlyDebtPayments;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-[440px] h-full bg-surface border-l border-border overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-border px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-base font-bold text-white">Edit Profile</h2>
            <p className="text-xs text-slate-500">Changes reflect instantly across all views</p>
          </div>
          <button onClick={onClose} className="btn-ghost text-lg leading-none px-2">
            ✕
          </button>
        </div>

        <div className="px-5 py-5 space-y-6">
          {/* Basics */}
          <section>
            <h3 className="stat-label mb-3">Personal</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Name</label>
                <input
                  className="input-field"
                  value={draft.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Age</label>
                <input
                  type="number"
                  className="input-field"
                  value={draft.age}
                  onChange={(e) => updateField('age', +e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Monthly Income ($)</label>
                <input
                  type="number"
                  className="input-field"
                  value={draft.monthlyIncome}
                  onChange={(e) => updateField('monthlyIncome', +e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Target FIRE Age</label>
                <input
                  type="number"
                  className="input-field"
                  value={draft.targetRetirementAge}
                  onChange={(e) => updateField('targetRetirementAge', +e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Investments ($)</label>
                <input
                  type="number"
                  className="input-field"
                  value={draft.currentSavings}
                  onChange={(e) => updateField('currentSavings', +e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Emergency Fund ($)</label>
                <input
                  type="number"
                  className="input-field"
                  value={draft.emergencyFund}
                  onChange={(e) => updateField('emergencyFund', +e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Monthly Debt Payments ($)</label>
                <input
                  type="number"
                  className="input-field"
                  value={draft.monthlyDebtPayments}
                  onChange={(e) => updateField('monthlyDebtPayments', +e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Expected Return (%/yr)</label>
                <input
                  type="number"
                  className="input-field"
                  value={draft.expectedReturn}
                  step="0.5"
                  onChange={(e) => updateField('expectedReturn', +e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Spending categories */}
          <section>
            <h3 className="stat-label mb-3">Monthly Spending</h3>
            <div className="space-y-2">
              {draft.spending.map((cat: SpendingCategory) => (
                <div key={cat.id} className="flex items-center gap-3">
                  <span className="text-base w-6 text-center shrink-0">{cat.emoji}</span>
                  <span className="text-sm text-slate-300 flex-1 truncate">{cat.name}</span>
                  <div className="relative w-32">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                      $
                    </span>
                    <input
                      type="number"
                      className="input-field pl-6 text-right"
                      value={cat.monthly}
                      onChange={(e) => updateSpending(cat.id, +e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Summary */}
          <div className="card-sm bg-elevated">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">Total spending</span>
              <span className="font-semibold text-white">${totalSpending.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Monthly savings</span>
              <span
                className={`font-bold ${savings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
              >
                {savings >= 0 ? '+' : ''}${savings.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-surface border-t border-border px-5 py-4 flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">
            Cancel
          </button>
          <button onClick={() => { onSave(draft); onClose(); }} className="btn-primary flex-1">
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}
