from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime

class WorkspaceBase(BaseModel):
    name: str
    industry: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    service_area: Optional[str] = None
    operating_hours: Optional[str] = None
    description: Optional[str] = None

class WorkspaceUpdate(WorkspaceBase):
    pass

class WorkspaceOut(WorkspaceBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ServiceCreate(BaseModel):
    name: str
    priority: str = "medium"
    price_range: Optional[str] = None
    description: Optional[str] = None

class ServiceUpdate(ServiceCreate):
    pass

class ServiceOut(ServiceCreate):
    id: UUID
    workspace_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class QualificationConfigUpdate(BaseModel):
    ask_service_type: bool = True
    ask_location: bool = True
    ask_urgency: bool = True
    ask_timeframe: bool = True
    ask_budget: bool = True
    ask_project_details: bool = True
    custom_rules: Optional[Dict[str, Any]] = Field(default_factory=dict)

class QualificationConfigOut(QualificationConfigUpdate):
    id: UUID
    workspace_id: UUID

    class Config:
        from_attributes = True

class AIConfigUpdate(BaseModel):
    tone: str = "Professional"
    response_behavior: Optional[str] = None
    knowledge_base: Optional[str] = None
    escalation_rules: Optional[str] = None
    restrictions: Optional[str] = None

class AIConfigOut(AIConfigUpdate):
    id: UUID
    workspace_id: UUID

    class Config:
        from_attributes = True

class TestLeadRequest(BaseModel):
    lead_name: str
    service_requested: str
    location: str
    urgency: str
    budget: Optional[str] = None
    project_details: Optional[str] = None

class TestLeadResponse(BaseModel):
    lead_id: UUID
    status: str
    score: int
    ai_response: str
    recommended_action: str
    created_at: datetime

class LeadIngestRequest(BaseModel):
    contact_name: str
    service_requested: Optional[str] = None
    location: Optional[str] = None
    urgency: Optional[str] = "Normal"
    budget: Optional[str] = None
    details: Optional[str] = None
    source: Optional[str] = "Manual Ingest"

class BulkLeadIngestRequest(BaseModel):
    leads: List[LeadIngestRequest]

class LeadDetailOut(BaseModel):
    id: UUID
    workspace_id: UUID
    contact_name: str
    service_requested: Optional[str] = None
    location: Optional[str] = None
    urgency: Optional[str] = None
    budget: Optional[str] = None
    details: Optional[str] = None
    status: str
    score: int
    estimated_value: float
    ai_response: Optional[str] = None
    is_test_lead: bool
    created_at: datetime

    class Config:
        from_attributes = True

class BulkLeadIngestResponse(BaseModel):
    total_ingested: int
    qualified_count: int
    handoff_count: int
    leads: List[LeadDetailOut]

class LeadListItem(BaseModel):
    id: UUID
    contact_name: str
    service_requested: Optional[str] = None
    location: Optional[str] = None
    urgency: Optional[str] = None
    status: str
    score: int
    estimated_value: float
    ai_response: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class LeadHandoffResponse(BaseModel):
    success: bool
    lead_id: UUID
    message: str
    status: str

class IntegrationItem(BaseModel):
    key: str
    name: str
    description: str
    is_connected: bool = False
    connected_at: Optional[datetime] = None

class WorkspaceActivateResponse(BaseModel):
    id: UUID
    is_active: bool
    message: str

class DashboardMetricsResponse(BaseModel):
    new_leads: int
    qualified_leads: int
    ai_responded_leads: int
    human_handoffs: int
    avg_response_time_seconds: int
    high_value_opportunities: int
