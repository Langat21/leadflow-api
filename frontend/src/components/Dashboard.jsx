import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle,
  Bot,
  UserCheck,
  Clock,
  TrendingUp,
  Plus,
  Upload,
  Search,
  Filter,
  X,
  Send,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  FileText,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import {
  fetchDashboardMetrics,
  fetchLeadsList,
  fetchLeadDetail,
  ingestSingleLead,
  ingestBulkLeads,
  triggerLeadHandoff
} from '../api';

export default function Dashboard({ workspaceId }) {
  const [metrics, setMetrics] = useState({
    new_leads: 0,
    qualified_leads: 0,
    ai_responded_leads: 0,
    human_handoffs: 0,
    avg_response_time_seconds: 42,
    high_value_opportunities: 0
  });
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showSingleIngest, setShowSingleIngest] = useState(false);
  const [showBulkIngest, setShowBulkIngest] = useState(false);
  const [selectedLeadModal, setSelectedLeadModal] = useState(null);

  // Forms
  const [singleForm, setSingleForm] = useState({
    contact_name: '',
    service_requested: 'HVAC Maintenance & Repair',
    location: 'Austin, TX',
    urgency: 'Immediate',
    budget: '$850',
    details: 'Air conditioner making loud buzzing noise and blowing lukewarm air.',
    source: 'Website Form'
  });

  const sampleCsvData = `contact_name,service_requested,location,urgency,budget,details
Michael Scott,Emergency Drain Clearing,Downtown Austin,Immediate,$350,Main line backup into first floor bathroom
Pam Beesly,HVAC Tuneup,North Austin,This Week,$200,Annual seasonal tune up before summer heat
Jim Halpert,AC System Replacement,Round Rock TX,High,$8500,Replacing 12 year old air handler and outdoor unit
Dwight Schrute,Solar Panel Inspection,Georgetown TX,Normal,$1200,Inspect solar inverter system on roof`;

  const [bulkCsvText, setBulkCsvText] = useState(sampleCsvData);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [workspaceId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [m, l] = await Promise.all([
        fetchDashboardMetrics(workspaceId),
        fetchLeadsList(workspaceId)
      ]);
      setMetrics(m);
      setLeads(l || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Submit Single Ingest
  const handleSingleIngestSubmit = async (e) => {
    e.preventDefault();
    if (!singleForm.contact_name.trim()) return;
    try {
      const created = await ingestSingleLead(workspaceId, singleForm);
      showToast(`Lead for ${created.contact_name} ingested! Status: ${created.status}`);
      setShowSingleIngest(false);
      setSingleForm({
        contact_name: '',
        service_requested: 'HVAC Maintenance & Repair',
        location: 'Austin, TX',
        urgency: 'Immediate',
        budget: '$850',
        details: '',
        source: 'Website Form'
      });
      loadDashboardData();
    } catch (err) {
      showToast('Failed to ingest lead');
    }
  };

  // Parse CSV text into Lead objects
  const parseCsvToLeads = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length <= 1) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const cols = lines[i].split(',').map(c => c.trim());
      const leadObj = {
        contact_name: cols[0] || 'Unknown Contact',
        service_requested: cols[1] || 'General Enquiry',
        location: cols[2] || 'Austin, TX',
        urgency: cols[3] || 'Normal',
        budget: cols[4] || '$500',
        details: cols[5] || 'Bulk imported enquiry',
        source: 'Bulk CSV Ingest'
      };
      result.push(leadObj);
    }
    return result;
  };

  // Submit Bulk Ingest
  const handleBulkIngestSubmit = async () => {
    try {
      const parsedArray = parseCsvToLeads(bulkCsvText);
      if (parsedArray.length === 0) {
        showToast('No valid CSV records found');
        return;
      }
      const res = await ingestBulkLeads(workspaceId, parsedArray);
      showToast(`Batch Ingestion Complete! Total: ${res.total_ingested}, Qualified: ${res.qualified_count}`);
      setShowBulkIngest(false);
      loadDashboardData();
    } catch (e) {
      showToast('Error executing bulk ingestion');
    }
  };

  // Trigger Human Handoff
  const handleHandoff = async (leadId) => {
    try {
      const res = await triggerLeadHandoff(workspaceId, leadId);
      showToast(res.message);
      loadDashboardData();
      if (selectedLeadModal) {
        setSelectedLeadModal({...selectedLeadModal, status: 'HANDOFF_REQUIRED'});
      }
    } catch (e) {
      showToast('Error triggering handoff');
    }
  };

  // Filtered Leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      (lead.contact_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.service_requested || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-900/95 text-emerald-200 px-4 py-3 rounded-xl border border-emerald-500/40 shadow-2xl flex items-center space-x-2 text-sm font-semibold animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner & Quick Intake Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#111715] to-[#0d1311] border border-emerald-950 p-6 rounded-2xl shadow-2xl">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Operational AI Control Plane</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            LeadFlow Pilot Operations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time automated lead qualification, AI response engine, and human handoff dispatch.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSingleIngest(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg transition-all glow-green"
          >
            <Plus className="w-4 h-4" />
            <span>Single Lead Ingest</span>
          </button>

          <button
            onClick={() => setShowBulkIngest(true)}
            className="bg-slate-900 hover:bg-slate-800 border border-emerald-800/60 text-emerald-300 font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk Import (CSV)</span>
          </button>

          <button
            onClick={loadDashboardData}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 rounded-xl"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: 'New Enquiries', value: metrics.new_leads, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Qualified', value: metrics.qualified_leads, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'AI Responded', value: metrics.ai_responded_leads, icon: Bot, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
          { label: 'Human Handoffs', value: metrics.human_handoffs, icon: UserCheck, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Avg Response', value: `${metrics.avg_response_time_seconds}s`, icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
          { label: 'High Value', value: metrics.high_value_opportunities, icon: TrendingUp, color: 'text-emerald-300', bg: 'bg-emerald-500/15 border-emerald-500/30' },
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className={`p-4 rounded-xl border ${m.bg} flex flex-col justify-between space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{m.label}</span>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <div className={`text-2xl font-extrabold ${m.color}`}>{m.value}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Leads Table Container */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Inbound Lead Pipeline</h2>
            <span className="bg-emerald-950 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border border-emerald-800">
              {filteredLeads.length} total
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search leads, service, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-48 sm:w-64"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="HANDOFF_REQUIRED">Human Handoff</option>
              <option value="NEW">New</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 uppercase text-[10px] text-slate-400 tracking-wider border-b border-slate-800 font-bold">
              <tr>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Urgency</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Est. Value</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">{lead.contact_name}</td>
                  <td className="py-3.5 px-4 text-slate-300">{lead.service_requested || 'General Service'}</td>
                  <td className="py-3.5 px-4 text-slate-400">{lead.location || 'N/A'}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300">
                      {lead.urgency || 'Normal'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    {lead.score}/100
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                      lead.status === 'QUALIFIED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : lead.status === 'HANDOFF_REQUIRED'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-300 font-semibold">
                    ${lead.estimated_value ? lead.estimated_value.toLocaleString() : '350'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedLeadModal(lead)}
                      className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 px-2.5 py-1 rounded text-[11px] font-semibold transition-all inline-flex items-center space-x-1"
                    >
                      <span>View Detail</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500 italic">
                    No leads match the criteria. Click "Single Lead Ingest" or "Bulk Import" to add live test leads.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SINGLE LEAD INGEST MODAL */}
      {showSingleIngest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111715] border border-emerald-800/80 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Single Live Lead Ingestion</span>
              </h3>
              <button onClick={() => setShowSingleIngest(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSingleIngestSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={singleForm.contact_name}
                  onChange={(e) => setSingleForm({...singleForm, contact_name: e.target.value})}
                  placeholder="e.g. Sarah Connor"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Service Requested</label>
                  <input
                    type="text"
                    value={singleForm.service_requested}
                    onChange={(e) => setSingleForm({...singleForm, service_requested: e.target.value})}
                    placeholder="e.g. AC Repair"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Location</label>
                  <input
                    type="text"
                    value={singleForm.location}
                    onChange={(e) => setSingleForm({...singleForm, location: e.target.value})}
                    placeholder="e.g. Austin Downtown"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Urgency</label>
                  <select
                    value={singleForm.urgency}
                    onChange={(e) => setSingleForm({...singleForm, urgency: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Immediate Emergency">Immediate Emergency</option>
                    <option value="High">High Priority</option>
                    <option value="Normal">Normal</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Project Budget</label>
                  <input
                    type="text"
                    value={singleForm.budget}
                    onChange={(e) => setSingleForm({...singleForm, budget: e.target.value})}
                    placeholder="e.g. $1,200"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Problem / Customer Message</label>
                <textarea
                  value={singleForm.details}
                  onChange={(e) => setSingleForm({...singleForm, details: e.target.value})}
                  rows={2}
                  placeholder="Describe details..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSingleIngest(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition-all glow-green"
                >
                  Process & Ingest Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK LEAD INGEST MODAL */}
      {showBulkIngest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111715] border border-emerald-800/80 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Upload className="w-5 h-5 text-emerald-400" />
                <span>Bulk Lead Batch Ingestion (CSV)</span>
              </h3>
              <button onClick={() => setShowBulkIngest(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Paste comma-separated CSV records to batch process leads through LeadFlow AI classification.
            </p>

            <div>
              <label className="block text-xs font-mono text-emerald-400 uppercase mb-1">CSV Format: contact_name, service_requested, location, urgency, budget, details</label>
              <textarea
                value={bulkCsvText}
                onChange={(e) => setBulkCsvText(e.target.value)}
                rows={7}
                className="w-full bg-slate-950 font-mono text-xs text-emerald-300 border border-slate-800 rounded-lg p-3 focus:outline-none focus:border-emerald-500 custom-scrollbar"
              />
            </div>

            <div className="pt-3 flex justify-between items-center border-t border-slate-800">
              <span className="text-[11px] text-slate-500 font-mono">
                Batch size: {bulkCsvText.trim().split('\n').length - 1} records
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBulkIngest(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkIngestSubmit}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition-all glow-green"
                >
                  Execute Batch Ingestion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEAD DETAIL MODAL */}
      {selectedLeadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111715] border border-emerald-800/80 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Lead Intelligence Record</span>
                <h3 className="text-xl font-extrabold text-white">{selectedLeadModal.contact_name}</h3>
              </div>
              <button onClick={() => setSelectedLeadModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/90 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block">Service Requested</span>
                <span className="font-semibold text-white">{selectedLeadModal.service_requested || 'General'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Location</span>
                <span className="font-semibold text-white">{selectedLeadModal.location || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Lead Score</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{selectedLeadModal.score}/100</span>
              </div>
              <div>
                <span className="text-slate-500 block">Qualification Status</span>
                <span className={`font-bold uppercase text-xs ${selectedLeadModal.status === 'QUALIFIED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {selectedLeadModal.status}
                </span>
              </div>
            </div>

            {selectedLeadModal.details && (
              <div>
                <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">Customer Problem Notes</span>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 font-sans">
                  "{selectedLeadModal.details}"
                </div>
              </div>
            )}

            <div>
              <span className="text-xs font-semibold uppercase text-emerald-400 block mb-1 flex items-center space-x-1">
                <Bot className="w-3.5 h-3.5" />
                <span>Generated AI Response</span>
              </span>
              <div className="bg-emerald-950/40 p-3 rounded-lg border border-emerald-800/60 text-xs text-emerald-200 italic font-sans leading-relaxed">
                "{selectedLeadModal.ai_response || 'Automated response generated.'}"
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleHandoff(selectedLeadModal.id)}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold px-4 py-2 rounded-lg text-xs flex items-center space-x-1.5"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Request Human Follow-up / Handoff</span>
              </button>

              <button
                onClick={() => setSelectedLeadModal(null)}
                className="bg-slate-800 text-slate-300 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
