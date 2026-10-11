const API_BASE = '/api';

export const getHeaders = (workspaceId) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (workspaceId) {
    headers['X-Workspace-Id'] = workspaceId;
  }
  return headers;
};

export const fetchWorkspacesList = async () => {
  const res = await fetch(`${API_BASE}/workspaces/list`);
  if (!res.ok) throw new Error('Failed to fetch workspaces list');
  return res.json();
};

export const fetchWorkspaceProfile = async (workspaceId) => {
  const res = await fetch(`${API_BASE}/workspaces/profile`, {
    headers: getHeaders(workspaceId),
  });
  if (!res.ok) throw new Error('Failed to fetch workspace profile');
  return res.json();
};

export const updateWorkspaceProfile = async (workspaceId, data) => {
  const res = await fetch(`${API_BASE}/workspaces/profile`, {
    method: 'POST',
    headers: getHeaders(workspaceId),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update workspace profile');
  return res.json();
};

export const fetchServices = async (workspaceId) => {
  const res = await fetch(`${API_BASE}/workspaces/services`, {
    headers: getHeaders(workspaceId),
  });
  if (!res.ok) throw new Error('Failed to fetch services');
  return res.json();
};

export const createService = async (workspaceId, serviceData) => {
  const res = await fetch(`${API_BASE}/workspaces/services`, {
    method: 'POST',
    headers: getHeaders(workspaceId),
    body: JSON.stringify(serviceData),
  });
  if (!res.ok) throw new Error('Failed to create service');
  return res.json();
};

export const deleteService = async (workspaceId, serviceId) => {
  const res = await fetch(`${API_BASE}/workspaces/services/${serviceId}`, {
    method: 'DELETE',
    headers: getHeaders(workspaceId),
  });
  if (!res.ok) throw new Error('Failed to delete service');
  return res.json();
};

export const fetchQualificationConfig = async (workspaceId) => {
  const res = await fetch(`${API_BASE}/workspaces/qualification`, {
    headers: getHeaders(workspaceId),
  });
  if (!res.ok) throw new Error('Failed to fetch qualification config');
  return res.json();
};

export const updateQualificationConfig = async (workspaceId, config) => {
  const res = await fetch(`${API_BASE}/workspaces/qualification`, {
    method: 'PUT',
    headers: getHeaders(workspaceId),
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error('Failed to update qualification config');
  return res.json();
};

export const fetchAIConfig = async (workspaceId) => {
  const res = await fetch(`${API_BASE}/workspaces/ai-config`, {
    headers: getHeaders(workspaceId),
  });
  if (!res.ok) throw new Error('Failed to fetch AI config');
  return res.json();
};

export const updateAIConfig = async (workspaceId, config) => {
  const res = await fetch(`${API_BASE}/workspaces/ai-config`, {
    method: 'PUT',
    headers: getHeaders(workspaceId),
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error('Failed to update AI config');
  return res.json();
};

export const fetchIntegrations = async (workspaceId) => {
  const res = await fetch(`${API_BASE}/workspaces/integrations`, {
    headers: getHeaders(workspaceId),
  });
  if (!res.ok) throw new Error('Failed to fetch integrations');
  return res.json();
};

export const activateWorkspace = async (workspaceId) => {
  const res = await fetch(`${API_BASE}/workspaces/activate`, {
    method: 'POST',
    headers: getHeaders(workspaceId),
  });
  if (!res.ok) throw new Error('Failed to activate workspace');
  return res.json();
};

export const runTestLead = async (workspaceId, leadData) => {
  const res = await fetch(`${API_BASE}/test-lead`, {
    method: 'POST',
    headers: getHeaders(workspaceId),
    body: JSON.stringify(leadData),
  });
  if (!res.ok) throw new Error('Failed to run test lead simulation');
  return res.json();
};

export const fetchDashboardMetrics = async (workspaceId) => {
  const res = await fetch(`${API_BASE}/workspaces/dashboard`, {
    headers: getHeaders(workspaceId),
  });
  if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
  return res.json();
};

export const fetchLeadsList = async (workspaceId) => {
  const res = await fetch(`${API_BASE}/leads`, {
    headers: getHeaders(workspaceId),
  });
  if (!res.ok) throw new Error('Failed to fetch leads');
  return res.json();
};

export const fetchLeadDetail = async (workspaceId, leadId) => {
  const res = await fetch(`${API_BASE}/leads/${leadId}`, {
    headers: getHeaders(workspaceId),
  });
  if (!res.ok) throw new Error('Failed to fetch lead detail');
  return res.json();
};

export const ingestSingleLead = async (workspaceId, leadData) => {
  const res = await fetch(`${API_BASE}/leads/ingest`, {
    method: 'POST',
    headers: getHeaders(workspaceId),
    body: JSON.stringify(leadData),
  });
  if (!res.ok) throw new Error('Failed to ingest single lead');
  return res.json();
};

export const ingestBulkLeads = async (workspaceId, leadsArray) => {
  const res = await fetch(`${API_BASE}/leads/bulk-ingest`, {
    method: 'POST',
    headers: getHeaders(workspaceId),
    body: JSON.stringify({ leads: leadsArray }),
  });
  if (!res.ok) throw new Error('Failed to bulk ingest leads');
  return res.json();
};

export const triggerLeadHandoff = async (workspaceId, leadId) => {
  const res = await fetch(`${API_BASE}/leads/${leadId}/handoff`, {
    method: 'POST',
    headers: getHeaders(workspaceId),
  });
  if (!res.ok) throw new Error('Failed to trigger human handoff');
  return res.json();
};
