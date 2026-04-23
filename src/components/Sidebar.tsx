import { ActiveView } from '../types';

interface SidebarProps {
  active: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onEditProfile: () => void;
}

const navItems: { id: ActiveView; label: string; icon: string; desc: string }[] = [
  { id: 'overview', label: 'Overview', icon: '⚡', desc: 'Financial health snapshot' },
  { id: 'spending', label: 'Spending', icon: '📊', desc: 'Category analysis' },
  { id: 'fire', label: 'FIRE Engine', icon: '🔥', desc: 'Retirement projections' },
  { id: 'decisions', label: 'Decision Lab', icon: '🧮', desc: 'Purchase advisor' },
];

export default function Sidebar({ active, onNavigate, onEditProfile }: SidebarProps) {
  return (
    <aside className="flex flex-col w-56 shrink-0 bg-surface border-r border-border min-h-screen">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">⚡</span>
          <div>
            <div className="font-bold text-white text-base leading-none">Fintel</div>
            <div className="text-xs text-slate-500 mt-0.5">Decision Engine</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group ${
              active === item.id
                ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400'
                : 'text-slate-400 hover:text-white hover:bg-elevated border border-transparent'
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <div>
              <div
                className={`text-sm font-semibold leading-none ${
                  active === item.id ? 'text-indigo-300' : 'text-slate-300 group-hover:text-white'
                }`}
              >
                {item.label}
              </div>
              <div className="text-xs text-slate-600 mt-0.5">{item.desc}</div>
            </div>
          </button>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-5 space-y-1">
        <button
          onClick={onEditProfile}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-elevated border border-transparent hover:border-border transition-all group"
        >
          <span className="text-base">⚙️</span>
          <div className="text-sm font-medium text-slate-400 group-hover:text-white">
            Edit Profile
          </div>
        </button>
      </div>
    </aside>
  );
}
