import React, { useState, useEffect } from 'react';
import {
  Building2,
  Wrench,
  CheckSquare,
  Bot,
  Zap,
  Play,
  Rocket,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Globe,
  Phone,
  Clock,
  DollarSign
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
  fetchIntegrations,
  runTestLead,
  activateWorkspace
} from '../api';

const STEPS = [
  { id: 1, title: 'Business', icon: Building2 },
  { id: 2, title: 'Services', icon: Wrench },
  { id: 3, title: 'Qualification', icon: CheckSquare },
  { id: 4, title: 'AI Config', icon: Bot },
  { id: 5, title: 'Integrations', icon: Zap },
  { id: 6, title: 'Test Lead', icon: Play },
  { id: 7, title: 'Go Live', icon: Rocket },
];

export default function OnboardingWizard({ workspaceId, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Step 1 - Business state
  const [business, setBusiness] = useState({
    name: 'Apex Plumbing & HVAC',
    industry: 'Home Services',
    website: 'https://apexplumbing.com',
    phone: '+15125550199',
    service_area: 'Austin, TX Metropolitan Area',
    operating_hours: '24/7 Emergency Service',
    description: 'Premium residential and commercial plumbing and HVAC repair.',
  });

  // Step 2 - Services state
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({
    name: '',
    priority: 'medium',
    price_range: '$200 - $1,000',
    description: ''
  });

  // Step 3 - Qualification state
  const [qualification, setQualification] = useState({
    ask_service_type: true,
    ask_location: true,
    ask_urgency: true,
    ask_timeframe: true,
    ask_budget: true,
    ask_project_details: true,
  });

  // Step 4 - AI state
  const [aiConfig, setAiConfig] = useState({
    tone: 'Professional & Urgent',
    response_behavior: 'Confirm technician availability within 15 mins. Collect address immediately.',
    knowledge_base: 'Service diagnostic call fee is $89, waived with repair authorization.',
    escalation_rules: 'Escalate immediately if active water leak or zero heating in winter.',
    restrictions: 'Never provide binding firm quotes without physical site inspection.'
  });

  // Step 5 - Integrations
  const [integrations, setIntegrations] = useState([]);

  // Step 6 - Test Lead
  const [testForm, setTestForm] = useState({
    lead_name: 'John Smith',
    service_requested: 'AC Replacement & Repair',
    location: 'Austin, TX',
    urgency: 'Immediate Emergency',
    budget: '$1,500',
    project_details: 'My central AC unit is 15 years old and stopped blowing cool air this afternoon.'
  });
  const [testResult, setTestResult] = useState(null);
  const [testRunning, setTestRunning] = useState(false);

  // Load initial workspace data
  useEffect(() => {
    loadWorkspaceData();
  }, [workspaceId]);

  const loadWorkspaceData = async () => {
    setLoading(true);
    try {
      const p = await fetchWorkspaceProfile(workspaceId);
      if (p) setBusiness({
        name: p.name || '',
        industry: p.industry || 'Home Services',
        website: p.website || '',
        phone: p.phone || '',
        service_area: p.service_area || '',
        operating_hours: p.operating_hours || '',
        description: p.description || ''
      });

      const s = await fetchServices(workspaceId);
      setServices(s || []);

      const q = await fetchQualificationConfig(workspaceId);
      if (q) setQualification(q);

      const ai = await fetchAIConfig(workspaceId);
      if (ai) setAiConfig(ai);

      const integ = await fetchIntegrations(workspaceId);
      setIntegrations(integ || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Step actions
  const handleSaveBusiness = async () => {
    setLoading(true);
    try {
      await updateWorkspaceProfile(workspaceId, business);
      showToast('Business details saved!');
      setCurrentStep(2);
    } catch (e) {
      showToast('Error saving business info');
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newService.name.trim()) return;
    try {
      const created = await createService(workspaceId, newService);
      setServices([...services, created]);
      setNewService({ name: '', priority: 'medium', price_range: '$200 - $1,000', description: '' });
      showToast('Service added!');
    } catch (err) {
      showToast('Failed to add service');
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      await deleteService(workspaceId, serviceId);
      setServices(services.filter(s => s.id !== serviceId));
      showToast('Service removed');
    } catch (err) {
      showToast('Failed to delete service');
    }
  };

  const handleSaveQualification = async () => {
    setLoading(true);
    try {
      await updateQualificationConfig(workspaceId, qualification);
      showToast('Qualification rules saved!');
      setCurrentStep(4);
    } catch (e) {
      showToast('Error saving rules');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAIConfig = async () => {
    setLoading(true);
    try {
      await updateAIConfig(workspaceId, aiConfig);
      showToast('AI Configuration saved!');
      setCurrentStep(5);
    } catch (e) {
      showToast('Error saving AI config');
    } finally {
      setLoading(false);
    }
  };

  const handleRunSimulation = async () => {
    setTestRunning(true);
    setTestResult(null);
    try {
      const res = await runTestLead(workspaceId, testForm);
      setTimeout(() => {
        setTestResult(res);
        setTestRunning(false);
        showToast('LeadFlow simulation complete!');
      }, 800);
    } catch (e) {
      setTestRunning(false);
      showToast('Error running test lead');
    }
  };

  const handleActivate = async () => {
    setLoading(true);
    try {
      await activateWorkspace(workspaceId);
      showToast('Workspace activated!');
      if (onComplete) onComplete();
    } catch (e) {
      showToast('Error activating tenant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Toast */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-900/90 text-emerald-200 px-4 py-2.5 rounded-lg border border-emerald-500/40 shadow-xl flex items-center space-x-2 text-sm font-medium animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-2 bg-emerald-950/80 border border-emerald-800/50 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tenant Pilot Onboarding</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Configure Your LeadFlow Engine
        </h1>
        <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
          Set up business rules, services, AI personality, and test live response automation before going live.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-10 overflow-x-auto custom-scrollbar">
        <div className="flex items-center justify-between min-w-[650px] bg-[#111715] p-3 rounded-xl border border-emerald-950">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = currentStep === s.id;
            const isDone = currentStep > s.id;
            return (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => setCurrentStep(s.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                      : isDone
                      ? 'text-emerald-400 hover:text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <div className={`p-1 rounded-md ${
                    isActive ? 'bg-emerald-500 text-black' : isDone ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-500'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{s.title}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={`h-[1px] w-6 ${isDone ? 'bg-emerald-500/50' : 'bg-slate-800'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* STEP CONTENTS */}
      <div className="glass-card p-6 sm:p-8">
        {/* Step 1: Business */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <span>1. Business Information</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Provide basic company profile information that LeadFlow AI uses during qualification.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Company Name</label>
                <input
                  type="text"
                  value={business.name}
                  onChange={(e) => setBusiness({...business, name: e.target.value})}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Apex Plumbing & HVAC"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Industry</label>
                <input
                  type="text"
                  value={business.industry}
                  onChange={(e) => setBusiness({...business, industry: e.target.value})}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="HVAC / Plumbing / Solar"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Website URL</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={business.website}
                    onChange={(e) => setBusiness({...business, website: e.target.value})}
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="https://apexplumbing.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={business.phone}
                    onChange={(e) => setBusiness({...business, phone: e.target.value})}
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="+1 (512) 555-0199"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Service Area / City</label>
                <input
                  type="text"
                  value={business.service_area}
                  onChange={(e) => setBusiness({...business, service_area: e.target.value})}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Austin, TX & Surrounding Metro"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Business Hours</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={business.operating_hours}
                    onChange={(e) => setBusiness({...business, operating_hours: e.target.value})}
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="24/7 Emergency or Mon-Fri 8am-6pm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Company Description</label>
              <textarea
                value={business.description}
                onChange={(e) => setBusiness({...business, description: e.target.value})}
                rows={3}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                placeholder="Brief summary of your business, key specialties, and value prop..."
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800/80">
              <button
                onClick={handleSaveBusiness}
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-2.5 rounded-lg text-sm flex items-center space-x-2 transition-all glow-green"
              >
                <span>Save & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Services */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-emerald-400" />
                <span>2. Service Offerings</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Define services so LeadFlow AI can accurately match inbound customer inquiries.
              </p>
            </div>

            {/* List of services */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((srv) => (
                <div key={srv.id} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white text-sm">{srv.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                        srv.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {srv.priority} priority
                      </span>
                    </div>
                    <p className="text-xs text-emerald-400 font-mono mt-1">{srv.price_range || 'Quote on inspection'}</p>
                    {srv.description && <p className="text-xs text-slate-400 mt-1">{srv.description}</p>}
                  </div>
                  <button
                    onClick={() => handleDeleteService(srv.id)}
                    className="text-slate-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {services.length === 0 && (
                <div className="col-span-2 text-center py-6 text-slate-500 text-xs italic bg-slate-900/40 rounded-lg border border-dashed border-slate-800">
                  No services added yet. Add your first service below.
                </div>
              )}
            </div>

            {/* Form to add service */}
            <form onSubmit={handleAddService} className="bg-slate-900/60 border border-emerald-950 p-4 rounded-xl space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Service</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  placeholder="Service Name (e.g. AC Repair)"
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={newService.price_range}
                  onChange={(e) => setNewService({...newService, price_range: e.target.value})}
                  placeholder="Price Range (e.g. $150 - $450)"
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <select
                  value={newService.priority}
                  onChange={(e) => setNewService({...newService, priority: e.target.value})}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
              <input
                type="text"
                value={newService.description}
                onChange={(e) => setNewService({...newService, description: e.target.value})}
                placeholder="Short description of service scope..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-medium px-4 py-2 rounded-lg text-xs flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Service</span>
              </button>
            </form>

            <div className="flex justify-between pt-4 border-t border-slate-800/80">
              <button
                onClick={() => setCurrentStep(1)}
                className="text-slate-400 hover:text-white px-4 py-2.5 text-sm flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-2.5 rounded-lg text-sm flex items-center space-x-2 transition-all glow-green"
              >
                <span>Continue to Qualification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Qualification */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                <span>3. Lead Qualification Rules</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select required lead variables LeadFlow AI must capture before marking a lead as QUALIFIED.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'ask_service_type', label: 'Service Requested', desc: 'Confirm specific service needed (Repair, Replacement, Maintenance)' },
                { key: 'ask_location', label: 'Location & Address', desc: 'Capture property city or zip code for technician routing' },
                { key: 'ask_urgency', label: 'Urgency & Emergency', desc: 'Identify immediate emergency requests (gas leaks, pipe bursts)' },
                { key: 'ask_timeframe', label: 'Target Timeframe', desc: 'Collect expected timeline (Today, This Week, Flexible)' },
                { key: 'ask_budget', label: 'Budget & Project Scope', desc: 'Estimate customer project budget range' },
                { key: 'ask_project_details', label: 'Project Notes & Photos', desc: 'Capture customer problem notes and equipment age' },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => setQualification({...qualification, [item.key]: !qualification[item.key]})}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    qualification[item.key]
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={qualification[item.key]}
                      onChange={() => {}}
                      className="accent-emerald-500 h-4 w-4 rounded"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800/80">
              <button
                onClick={() => setCurrentStep(2)}
                className="text-slate-400 hover:text-white px-4 py-2.5 text-sm flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={handleSaveQualification}
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-2.5 rounded-lg text-sm flex items-center space-x-2 transition-all glow-green"
              >
                <span>Save & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: AI Config */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Bot className="w-5 h-5 text-emerald-400" />
                <span>4. AI Agent Behavior</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure tone, knowledge base facts, and escalation rules for LeadFlow's automated responses.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">AI Agent Personality & Tone</label>
                <select
                  value={aiConfig.tone}
                  onChange={(e) => setAiConfig({...aiConfig, tone: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Professional & Urgent">Professional & Urgent (Recommended for Local Trades)</option>
                  <option value="Friendly & Conversational">Friendly & Conversational</option>
                  <option value="Direct & Technical">Direct & Technical</option>
                  <option value="Executive & Formal">Executive & Formal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Response Guidelines & Strategy</label>
                <textarea
                  value={aiConfig.response_behavior}
                  onChange={(e) => setAiConfig({...aiConfig, response_behavior: e.target.value})}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Always confirm service availability within 15 mins. Collect property address immediately..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Company Knowledge Base & Service Facts</label>
                <textarea
                  value={aiConfig.knowledge_base}
                  onChange={(e) => setAiConfig({...aiConfig, knowledge_base: e.target.value})}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Service diagnostic call fee is $89, waived with authorized repair..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Escalation Triggers</label>
                  <textarea
                    value={aiConfig.escalation_rules}
                    onChange={(e) => setAiConfig({...aiConfig, escalation_rules: e.target.value})}
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Active water leak, gas smell, customer demands human agent..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Restrictions / Disallowed Claims</label>
                  <textarea
                    value={aiConfig.restrictions}
                    onChange={(e) => setAiConfig({...aiConfig, restrictions: e.target.value})}
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Never promise exact arrival times or binding financial quotes over chat..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800/80">
              <button
                onClick={() => setCurrentStep(3)}
                className="text-slate-400 hover:text-white px-4 py-2.5 text-sm flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={handleSaveAIConfig}
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-2.5 rounded-lg text-sm flex items-center space-x-2 transition-all glow-green"
              >
                <span>Save & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Integrations */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <span>5. Channel Integrations</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                LeadFlow ingests leads across your website, WhatsApp, email, and external CRMs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.map((item) => (
                <div key={item.key} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white text-sm">{item.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        item.is_connected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.is_connected ? '● Connected' : 'Disconnected'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{item.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-end">
                    <button
                      onClick={() => {
                        const updated = integrations.map(i => i.key === item.key ? {...i, is_connected: !i.is_connected} : i);
                        setIntegrations(updated);
                        showToast(`${item.name} status updated`);
                      }}
                      className="text-xs text-emerald-400 hover:underline font-medium"
                    >
                      {item.is_connected ? 'Configure Settings' : 'Connect Channel'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800/80">
              <button
                onClick={() => setCurrentStep(4)}
                className="text-slate-400 hover:text-white px-4 py-2.5 text-sm flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setCurrentStep(6)}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-2.5 rounded-lg text-sm flex items-center space-x-2 transition-all glow-green"
              >
                <span>Continue to Test Lead</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Test Lead Simulator */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Play className="w-5 h-5 text-emerald-400" />
                <span>6. Test Lead Simulation</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Run a simulated inbound lead through LeadFlow to preview qualification, scoring, and AI response output.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input simulator */}
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4">
                <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Simulated Inbound Customer</h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={testForm.lead_name}
                    onChange={(e) => setTestForm({...testForm, lead_name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Service Requested</label>
                    <input
                      type="text"
                      value={testForm.service_requested}
                      onChange={(e) => setTestForm({...testForm, service_requested: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Location</label>
                    <input
                      type="text"
                      value={testForm.location}
                      onChange={(e) => setTestForm({...testForm, location: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Urgency</label>
                    <input
                      type="text"
                      value={testForm.urgency}
                      onChange={(e) => setTestForm({...testForm, urgency: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Budget</label>
                    <input
                      type="text"
                      value={testForm.budget}
                      onChange={(e) => setTestForm({...testForm, budget: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Customer Message</label>
                  <textarea
                    value={testForm.project_details}
                    onChange={(e) => setTestForm({...testForm, project_details: e.target.value})}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  onClick={handleRunSimulation}
                  disabled={testRunning}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center space-x-2 transition-all glow-green"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{testRunning ? 'Running LeadFlow Engine...' : 'Run LeadFlow Simulation'}</span>
                </button>
              </div>

              {/* Simulation Result */}
              <div className="bg-slate-950/80 border border-emerald-950 p-5 rounded-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">LeadFlow Engine Processing Output</h3>

                  {testResult ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <div>
                          <span className="text-[10px] uppercase text-slate-500 block font-bold">Status & Score</span>
                          <span className={`text-sm font-bold ${testResult.status === 'QUALIFIED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {testResult.status} ({testResult.score}/100)
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase text-slate-500 block font-bold">Action</span>
                          <span className="text-xs text-slate-300 font-mono">{testResult.recommended_action}</span>
                        </div>
                      </div>

                      <div className="bg-emerald-950/30 border border-emerald-800/40 p-4 rounded-xl space-y-2">
                        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase">
                          <Bot className="w-4 h-4" />
                          <span>Generated AI Response</span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-sans italic">
                          "{testResult.ai_response}"
                        </p>
                      </div>

                      <div className="text-[11px] text-slate-500 space-y-1 font-mono">
                        <div>✓ Ingestion: Real-time webhook trigger</div>
                        <div>✓ Classification: High Priority Emergency</div>
                        <div>✓ Audit Logged: Lead ID {testResult.lead_id?.slice(0, 8)}...</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-600 text-xs space-y-2">
                      <Bot className="w-8 h-8 text-slate-700 mx-auto" />
                      <p>Click "Run LeadFlow Simulation" to process test lead through FastAPI.</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-900 mt-4 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="text-slate-400 hover:text-white px-3 py-2 text-xs flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={() => setCurrentStep(7)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-5 py-2 rounded-lg text-xs flex items-center space-x-1.5 transition-all glow-green"
                  >
                    <span>Proceed to Go-Live</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Go Live */}
        {currentStep === 7 && (
          <div className="space-y-6 text-center max-w-xl mx-auto py-4">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400 glow-green">
              <Rocket className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">Your LeadFlow Pilot is Configured!</h2>
              <p className="text-xs text-slate-400 mt-1">
                All engine parameters are active. Inbound customer enquiries will be instantly classified, qualified, and responded to.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl text-left space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Business details & service hours configured</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>{services.length} services pre-loaded with price ranges</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Qualification matrix & emergency rules active</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>AI response personality tuned for {aiConfig.tone}</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Inbound channel webhooks ready</span>
              </div>
            </div>

            <button
              onClick={handleActivate}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3.5 rounded-xl text-base flex items-center justify-center space-x-2 shadow-2xl transition-all glow-green"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>Activate LeadFlow Pilot & Launch Dashboard</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
