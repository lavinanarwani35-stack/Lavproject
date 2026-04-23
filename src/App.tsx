import { useState } from 'react';
import { FinancialProvider, useFinancial } from './context/FinancialContext';
import Sidebar from './components/Sidebar';
import ProfileEditor from './components/ProfileEditor';
import Overview from './views/Overview';
import SpendingAnalysis from './views/SpendingAnalysis';
import FIREEngine from './views/FIREEngine';
import DecisionLab from './views/DecisionLab';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import { ActiveView, AppPage, UserProfile } from './types';

const ONBOARDED_KEY = 'fintel-onboarded-v1';

/* ── App dashboard shell ──────────────────────────────────────── */
function AppShell({ onGoToLanding }: { onGoToLanding: () => void }) {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [showEditor, setShowEditor] = useState(false);
  const { profile, setProfile, insights, healthScore } = useFinancial();

  const criticalCount = insights.filter((i) => i.type === 'danger').length;
  const warningCount = insights.filter((i) => i.type === 'warning').length;

  const views: Record<ActiveView, React.JSX.Element> = {
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
          <div className="flex items-center gap-3">
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

          <div className="flex items-center gap-4">
            <button
              onClick={onGoToLanding}
              className="hidden md:block text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              ← Back to home
            </button>
            <div className="text-right">
              <div className="text-xs text-slate-500">Health Score</div>
              <div className="text-sm font-bold text-white">{healthScore.overall}/100</div>
            </div>
            <button
              onClick={() => setShowEditor(true)}
              className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-sm font-bold text-white transition-colors"
              title="Edit profile"
            >
              {profile.name[0]}
            </button>
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
          onSave={(updated: UserProfile) => setProfile(updated)}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}

/* ── Root router ──────────────────────────────────────────────── */
function Router() {
  const { setProfile } = useFinancial();

  const hasOnboarded = localStorage.getItem(ONBOARDED_KEY) === 'true';
  const hasProfile = localStorage.getItem('fintel-profile-v1') !== null;

  const [page, setPage] = useState<AppPage>(() =>
    hasOnboarded ? 'app' : 'landing'
  );

  function handleOnboardingComplete(profile: UserProfile) {
    setProfile(profile);
    localStorage.setItem(ONBOARDED_KEY, 'true');
    setPage('app');
  }

  function handleGoToLanding() {
    setPage('landing');
  }

  if (page === 'landing') {
    return (
      <Landing
        onStart={() => setPage(hasOnboarded ? 'app' : 'onboarding')}
        onSkipToApp={() => setPage('app')}
        hasProfile={hasOnboarded && hasProfile}
      />
    );
  }

  if (page === 'onboarding') {
    return (
      <Onboarding
        onComplete={handleOnboardingComplete}
        onBack={() => setPage('landing')}
      />
    );
  }

  return <AppShell onGoToLanding={handleGoToLanding} />;
}

/* ── Entry point ─────────────────────────────────────────────── */
export default function App() {
  return (
    <FinancialProvider>
      <Router />
    </FinancialProvider>
  );
}
