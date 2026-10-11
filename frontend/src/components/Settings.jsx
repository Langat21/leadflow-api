import React, { useState, useEffect } from 'react';
import {
  Building2,
  Wrench,
  CheckSquare,
  Bot,
  Zap,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Phone,
  Globe
} from 'lucide-react';
import {
  fetchWorkspaceProfile,
  updateWorkspaceProfile,
  fetchServices,
  createService,
  deleteService,
  fetchQualificationConfig,
  updateQualificationConfig,
  fetchAIConfig,
  updateAIConfig,
  fetchIntegrations
} from '../api';

export default function Settings({ workspaceId }) {
  const [activeTab, setActiveTab] = useState('business');
  const [toastMsg, setToastMsg] = useState(null);

  // States
  const [business, setBusiness] = useState({ name: '', industry: '', website: '', phone: '', service_area: '', operating_hours: '', description: '' });
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ name: '', priority: 'medium', price_range: '$200 - $800', description: '' });
  const [qualification, setQualification] = useState({ ask_service_type: true, ask_location: true, ask_urgency: true, ask_timeframe: true, ask_budget: true, ask_project_details: true });
  const [aiConfig, setAiConfig] = useState({ tone: 'Professional', response_behavior: '', knowledge_base: '', escalation_rules: '', restrictions: '' });
  const [integrations, setIntegrations] = useState([]);

  useEffect(() => {
    loadSettingsData();
  }, [workspaceId]);

  const loadSettingsData = async () => {
    try {
      const [p, s, q, ai, integ] = await Promise.all([
        fetchWorkspaceProfile(workspaceId),
        fetchServices(workspaceId),
        fetchQualificationConfig(workspaceId),
        fetchAIConfig(workspaceId),
        fetchIntegrations(workspaceId)
      ]);

      if (p) setBusiness(p);
      setServices(s || []);
      if (q) setQualification(q);
      if (ai) setAiConfig(ai);
      setIntegrations(integ || []);
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const saveBusiness = async () => {
    await updateWorkspaceProfile(workspaceId, business);
    showToast('Business profile updated!');
  };

  const saveQualification = async () => {
    await updateQualificationConfig(workspaceId, qualification);
    showToast('Qualification matrix updated!');
  };

  const saveAI = async () => {
    await updateAIConfig(workspaceId, aiConfig);
    showToast('AI config updated!');
  };

  const addServiceItem = async (e) => {
    e.preventDefault();
    if (!newService.name.trim()) return;
    const created = await createService(workspaceId, newService);
    setServices([...services, created]);
    setNewService({ name: '', priority: 'medium', price_range: '$200 - $800', description: '' });
    showToast('Service added!');
  };

  const removeServiceItem = async (id) => {
    await deleteService(workspaceId, id);
    setServices(services.filter(s => s.id !== id));
    showToast('Service deleted!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-900/95 text-emerald-200 px-4 py-2.5 rounded-lg border border-emerald-500/40 shadow-xl flex items-center space-x-2 text-sm font-semibold animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Workspace & Engine Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage tenant business parameters, service catalog, qualification requirements, and AI behavior.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 text-xs font-semibold overflow-x-auto custom-scrollbar">
        {[
          { id: 'business', label: 'Business Profile', icon: Building2 },
          { id: 'services', label: 'Services Catalog', icon: Wrench },
          { id: 'qualification', label: 'Qualification Matrix', icon: CheckSquare },
          { id: 'ai', label: 'AI Behavior', icon: Bot },
          { id: 'integrations', label: 'Integrations', icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-all ${
                isActive
                  ? 'border-emerald-500 text-emerald-400 font-bold bg-emerald-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="glass-card p-6">
        {activeTab === 'business' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">Business Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Company Name</label>
                <input
                  type="text"
                  value={business.name || ''}
                  onChange={(e) => setBusiness({...business, name: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Industry</label>
                <input
                  type="text"
                  value={business.industry || ''}
                  onChange={(e) => setBusiness({...business, industry: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Website</label>
                <input
                  type="text"
                  value={business.website || ''}
                  onChange={(e) => setBusiness({...business, website: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Phone</label>
                <input
                  type="text"
                  value={business.phone || ''}
                  onChange={(e) => setBusiness({...business, phone: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Service Area</label>
                <input
                  type="text"
                  value={business.service_area || ''}
                  onChange={(e) => setBusiness({...business, service_area: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Hours</label>
                <input
                  type="text"
                  value={business.operating_hours || ''}
                  onChange={(e) => setBusiness({...business, operating_hours: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
              <textarea
                value={business.description || ''}
                onChange={(e) => setBusiness({...business, description: e.target.value})}
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              onClick={saveBusiness}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-5 py-2 rounded-lg text-xs flex items-center space-x-1.5 glow-green"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">Services Catalog</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((s) => (
                <div key={s.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white text-xs block">{s.name}</span>
                    <span className="text-[11px] font-mono text-emerald-400">{s.price_range}</span>
                  </div>
                  <button onClick={() => removeServiceItem(s.id)} className="text-slate-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={addServiceItem} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-emerald-400 block">Add New Service</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Service Name"
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Price Range"
                  value={newService.price_range}
                  onChange={(e) => setNewService({...newService, price_range: e.target.value})}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                />
                <select
                  value={newService.priority}
                  onChange={(e) => setNewService({...newService, priority: e.target.value})}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
              <button type="submit" className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-semibold px-3 py-1.5 rounded text-xs">
                Add Service
              </button>
            </form>
          </div>
        )}

        {activeTab === 'qualification' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">Qualification Rules</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'ask_service_type', label: 'Service Requested Required' },
                { key: 'ask_location', label: 'Location Required' },
                { key: 'ask_urgency', label: 'Urgency & Emergency Check' },
                { key: 'ask_timeframe', label: 'Timeframe Capture' },
                { key: 'ask_budget', label: 'Budget Estimate Required' },
                { key: 'ask_project_details', label: 'Problem Details & Notes' },
              ].map((item) => (
                <label key={item.key} className="flex items-center space-x-2 bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={qualification[item.key] || false}
                    onChange={(e) => setQualification({...qualification, [item.key]: e.target.checked})}
                    className="accent-emerald-500 rounded h-4 w-4"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
            <button
              onClick={saveQualification}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-5 py-2 rounded-lg text-xs flex items-center space-x-1.5 glow-green"
            >
              <Save className="w-4 h-4" />
              <span>Save Qualification Matrix</span>
            </button>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">AI Personality & Knowledge</h2>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Tone</label>
              <input
                type="text"
                value={aiConfig.tone || ''}
                onChange={(e) => setAiConfig({...aiConfig, tone: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Knowledge Base Facts</label>
              <textarea
                value={aiConfig.knowledge_base || ''}
                onChange={(e) => setAiConfig({...aiConfig, knowledge_base: e.target.value})}
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Escalation Rules</label>
              <textarea
                value={aiConfig.escalation_rules || ''}
                onChange={(e) => setAiConfig({...aiConfig, escalation_rules: e.target.value})}
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              onClick={saveAI}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-5 py-2 rounded-lg text-xs flex items-center space-x-1.5 glow-green"
            >
              <Save className="w-4 h-4" />
              <span>Save AI Configuration</span>
            </button>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">Integrations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {integrations.map((i) => (
                <div key={i.key} className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white block">{i.name}</span>
                    <span className="text-[10px] text-slate-400">{i.description}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${i.is_connected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                    {i.is_connected ? 'Active' : 'Off'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
