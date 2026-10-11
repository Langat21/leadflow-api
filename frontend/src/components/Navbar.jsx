import React, { useState, useEffect } from 'react';
import {
  Zap,
  LayoutDashboard,
  Sparkles,
  Settings as SettingsIcon,
  Building2,
  ChevronDown,
  Check
} from 'lucide-react';
import { fetchWorkspacesList } from '../api';

export default function Navbar({ activePage, setActivePage, activeWorkspaceId, setActiveWorkspaceId }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const list = await fetchWorkspacesList();
      if (list && list.length > 0) {
        setWorkspaces(list);
        if (!activeWorkspaceId) {
          setActiveWorkspaceId(list[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || {
    name: 'Apex Plumbing & HVAC',
    industry: 'Home Services'
  };

  return (
    <header className="bg-[#0e1312]/90 border-b border-emerald-950/80 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActivePage('dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-black flex items-center justify-center font-black shadow-lg glow-green">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-white text-base tracking-tight">Opslayer</span>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                LeadFlow
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block">AI Lead Response Engine</span>
          </div>
        </div>

        {/* Navigation Pages */}
        <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold">
          <button
            onClick={() => setActivePage('dashboard')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
              activePage === 'dashboard'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActivePage('onboarding')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
              activePage === 'onboarding'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Tenant Onboarding</span>
          </button>

          <button
            onClick={() => setActivePage('settings')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
              activePage === 'settings'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Engine Settings</span>
          </button>
        </nav>

        {/* Multi-Tenant Switcher */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 hover:border-emerald-800/60 px-3 py-1.5 rounded-lg text-xs transition-all text-left"
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <span className="font-bold text-white block truncate max-w-[130px] sm:max-w-[160px]">
                {activeWorkspace.name}
              </span>
              <span className="text-[9px] text-slate-500 uppercase block font-mono">
                {activeWorkspace.industry || 'Pilot Tenant'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#111715] border border-emerald-950 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest border-b border-slate-800/80">
                Switch Pilot Tenant
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setActiveWorkspaceId(ws.id);
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-900 flex items-center justify-between text-slate-200"
                >
                  <span className="truncate">{ws.name}</span>
                  {ws.id === activeWorkspaceId && (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
