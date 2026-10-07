from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
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

class LeadListItem(BaseModel):
    id: UUID
    contact_name: str
    service_requested: Optional[str] = None
    status: str
    score: int
    created_at: datetime

    class Config:
        from_attributes = True

class DashboardMetricsResponse(BaseModel):
    new_leads: int
    qualified_leads: int
    ai_responded_leads: int
    human_handoffs: int
    avg_response_time_seconds: int
    high_value_opportunities: int