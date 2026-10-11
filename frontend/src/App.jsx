import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import OnboardingWizard from './components/OnboardingWizard';
import Settings from './components/Settings';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('00000000-0000-0000-0000-000000000001');

  return (
    <div className="min-h-screen bg-[#0b0f0e] text-slate-100 flex flex-col font-sans">
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        activeWorkspaceId={activeWorkspaceId}
        setActiveWorkspaceId={setActiveWorkspaceId}
      />

      <main className="flex-1 pb-16">
        {activePage === 'dashboard' && (
          <Dashboard workspaceId={activeWorkspaceId} />
        )}

        {activePage === 'onboarding' && (
          <OnboardingWizard
            workspaceId={activeWorkspaceId}
            onComplete={() => setActivePage('dashboard')}
          />
        )}

        {activePage === 'settings' && (
          <Settings workspaceId={activeWorkspaceId} />
        )}
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>© 2025 LeadFlow AI Operations Stack • FastAPI + Supabase PostgreSQL + Pilot Control Plane</p>
      </footer>
    </div>
  );
}
