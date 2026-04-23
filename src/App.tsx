import { useState } from 'react';
import { FinancialProvider, useFinancial } from './context/FinancialContext';
import Sidebar from './components/Sidebar';
import ProfileEditor from './components/ProfileEditor';
import Overview from './views/Overview';
import SpendingAnalysis from './views/SpendingAnalysis';
import FIREEngine from './views/FIREEngine';
import DecisionLab from './views/DecisionLab';
import { ActiveView } from './types';

function AppShell() {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [showEditor, setShowEditor] = useState(false);
  const { profile, setProfile, insights, healthScore } = useFinancial();

  const criticalCount = insights.filter((i) => i.type === 'danger').length;
  const warningCount = insights.filter((i) => i.type === 'warning').length;

  const views: Record<ActiveView, JSX.Element> = {
    overview: <Overview />,
    spending: <SpendingAnalysis />,
    fire: <FIREEngine />,
    decisions: <DecisionLab />,
  };

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar
        active={activeView}
        onNavigate={setActiveView}
        onEditProfile={() => setShowEditor(true)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-base/90 backdrop-blur border-b border-border px-8 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {criticalCount > 0 && (
                <span className="badge-danger">{criticalCount} critical</span>
              )}
              {warningCount > 0 && (
                <span className="badge-warning">{warningCount} warnings</span>
              )}
              {criticalCount === 0 && warningCount === 0 && (
                <span className="badge-success">All clear</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-500">Financial Health</div>
              <div className="text-sm font-bold text-white">{healthScore.overall}/100</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
              {profile.name[0]}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-8 py-7 max-w-6xl w-full mx-auto">
          {views[activeView]}
        </main>
      </div>

      {showEditor && (
        <ProfileEditor
          profile={profile}
          onSave={(updated) => setProfile(updated)}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <FinancialProvider>
      <AppShell />
    </FinancialProvider>
  );
}
