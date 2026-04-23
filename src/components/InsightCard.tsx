import { FinancialInsight } from '../types';

interface InsightCardProps {
  insight: FinancialInsight;
  compact?: boolean;
}

const typeConfig = {
  danger: {
    border: 'border-red-500/30',
    bg: 'bg-red-500/5',
    icon: '🔴',
    badge: 'badge-danger',
    badgeLabel: 'Critical',
    impactColor: 'text-red-400',
  },
  warning: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    icon: '🟡',
    badge: 'badge-warning',
    badgeLabel: 'Warning',
    impactColor: 'text-amber-400',
  },
  opportunity: {
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/5',
    icon: '🟣',
    badge: 'badge-info',
    badgeLabel: 'Opportunity',
    impactColor: 'text-indigo-400',
  },
  success: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/5',
    icon: '🟢',
    badge: 'badge-success',
    badgeLabel: 'On Track',
    impactColor: 'text-emerald-400',
  },
};

export default function InsightCard({ insight, compact = false }: InsightCardProps) {
  const cfg = typeConfig[insight.type];

  return (
    <div
      className={`border rounded-xl p-4 animate-slide-up ${cfg.border} ${cfg.bg}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-white leading-snug">
          {insight.title}
        </h3>
        <span className={cfg.badge}>{cfg.badgeLabel}</span>
      </div>
      {!compact && (
        <p className="text-xs text-slate-400 leading-relaxed mb-3">
          {insight.description}
        </p>
      )}
      <div className={`text-xs font-semibold ${cfg.impactColor} mb-2`}>
        → {insight.impact}
      </div>
      {!compact && (
        <div className="text-xs text-slate-500 border-t border-border pt-2 mt-2">
          <span className="text-slate-600">Action: </span>
          {insight.action}
        </div>
      )}
    </div>
  );
}
