import uuid
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, List
from datetime import datetime
from app.database import get_db
from app.models import Workspace, Service, QualificationConfig, AIConfig, Lead
from app import schemas

router = APIRouter(prefix="/api/workspaces", tags=["Workspaces"])

def get_workspace_id(x_workspace_id: Optional[str] = Header(None)) -> UUID:
    if not x_workspace_id:
        return UUID("00000000-0000-0000-0000-000000000001")
    try:
        return UUID(x_workspace_id)
    except ValueError:
        return UUID("00000000-0000-0000-0000-000000000001")

@router.get("/list", response_model=List[schemas.WorkspaceOut])
def list_workspaces(db: Session = Depends(get_db)):
    return db.query(Workspace).order_by(Workspace.created_at.asc()).all()

@router.get("/profile", response_model=schemas.WorkspaceOut)
def get_profile(workspace_id: UUID = Depends(get_workspace_id), db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        # Create default workspace if none exists
        workspace = Workspace(
            id=workspace_id,
            name="Apex Plumbing & HVAC",
            industry="Home Services",
            website="https://apexplumbing.com",
            phone="+15125550199",
            service_area="Austin, TX",
            operating_hours="24/7",
            description="Default pilot workspace for LeadFlow",
            is_active=True
        )
        db.add(workspace)
        db.commit()
        db.refresh(workspace)
    return workspace

@router.post("/profile", response_model=schemas.WorkspaceOut)
@router.put("/profile", response_model=schemas.WorkspaceOut)
def update_profile(payload: schemas.WorkspaceUpdate, workspace_id: UUID = Depends(get_workspace_id), db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        workspace = Workspace(id=workspace_id, **payload.model_dump())
        db.add(workspace)
    else:
        for key, value in payload.model_dump().items():
            setattr(workspace, key, value)
    db.commit()
    db.refresh(workspace)
    return workspace

# Services Routes
@router.get("/services", response_model=List[schemas.ServiceOut])
def get_services(workspace_id: UUID = Depends(get_workspace_id), db: Session = Depends(get_db)):
    return db.query(Service).filter(Service.workspace_id == workspace_id).all()

@router.post("/services", response_model=schemas.ServiceOut)
def create_service(payload: schemas.ServiceCreate, workspace_id: UUID = Depends(get_workspace_id), db: Session = Depends(get_db)):
    service = Service(
        id=uuid.uuid4(),
        workspace_id=workspace_id,
        **payload.model_dump()
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    return service

@router.put("/services/{service_id}", response_model=schemas.ServiceOut)
def update_service(service_id: UUID, payload: schemas.ServiceUpdate, workspace_id: UUID = Depends(get_workspace_id), db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id, Service.workspace_id == workspace_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    for key, value in payload.model_dump().items():
        setattr(service, key, value)
    db.commit()
    db.refresh(service)
    return service

@router.delete("/services/{service_id}")
def delete_service(service_id: UUID, workspace_id: UUID = Depends(get_workspace_id), db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id, Service.workspace_id == workspace_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    db.delete(service)
    db.commit()
    return {"status": "deleted", "service_id": service_id}

# Qualification Config Routes
@router.get("/qualification", response_model=schemas.QualificationConfigOut)
def get_qualification_config(workspace_id: UUID = Depends(get_workspace_id), db: Session = Depends(get_db)):
    config = db.query(QualificationConfig).filter(QualificationConfig.workspace_id == workspace_id).first()
    if not config:
        config = QualificationConfig(workspace_id=workspace_id)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@router.put("/qualification", response_model=schemas.QualificationConfigOut)
def update_qualification_config(payload: schemas.QualificationConfigUpdate, workspace_id: UUID = Depends(get_workspace_id), db: Session = Depends(get_db)):
    config = db.query(QualificationConfig).filter(QualificationConfig.workspace_id == workspace_id).first()
    if not config:
        config = QualificationConfig(workspace_id=workspace_id, **payload.model_dump())
        db.add(config)
    else:
        for key, value in payload.model_dump().items():
            setattr(config, key, value)
    db.commit()
    db.refresh(config)
    return config

# AI Config Routes
@router.get("/ai-config", response_model=schemas.AIConfigOut)
def get_ai_config(workspace_id: UUID = Depends(get_workspace_id), db: Session = Depends(get_db)):
    config = db.query(AIConfig).filter(AIConfig.workspace_id == workspace_id).first()
    if not config:
        config = AIConfig(
            workspace_id=workspace_id,
            tone="Professional",
            response_behavior="Ask qualification details, confirm service availability.",
            knowledge_base="Service estimate and response guidelines.",
            escalation_rules="Escalate urgent requests and requests for human support.",
            restrictions="Do not provide binding financial promises."
        )
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@router.put("/ai-config", response_model=schemas.AIConfigOut)
def update_ai_config(payload: schemas.AIConfigUpdate, workspace_id: UUID = Depends(get_workspace_id), db: Session = Depends(get_db)):
    config = db.query(AIConfig).filter(AIConfig.workspace_id == workspace_id).first()
    if not config:
        config = AIConfig(workspace_id=workspace_id, **payload.model_dump())
        db.add(config)
    else:
        for key, value in payload.model_dump().items():
            setattr(config, key, value)
    db.commit()
    db.refresh(config)
    return config

# Integrations Route
@router.get("/integrations", response_model=List[schemas.IntegrationItem])
def get_integrations(workspace_id: UUID = Depends(get_workspace_id)):
    return [
        schemas.IntegrationItem(key="website", name="Website Lead Form", description="Receive leads directly from site widget", is_connected=True, connected_at=datetime.utcnow()),
        schemas.IntegrationItem(key="email", name="Email Intake", description="Inbound lead parsing via dedicated email box", is_connected=True, connected_at=datetime.utcnow()),
        schemas.IntegrationItem(key="whatsapp", name="WhatsApp Business API", description="Auto-reply and qualify inbound WhatsApp chats", is_connected=True, connected_at=datetime.utcnow()),
        schemas.IntegrationItem(key="crm", name="CRM Webhook / Sync", description="Sync leads and statuses with external CRM", is_connected=False),
        schemas.IntegrationItem(key="google_calendar", name="Google Calendar", description="Auto-schedule diagnostic calls", is_connected=False),
        schemas.IntegrationItem(key="n8n", name="n8n Workflows", description="Trigger custom integration webhooks", is_connected=True, connected_at=datetime.utcnow()),
    ]

# Activation Route
@router.post("/activate", response_model=schemas.WorkspaceActivateResponse)
def activate_workspace(workspace_id: UUID = Depends(get_workspace_id), db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    workspace.is_active = True
    db.commit()
    db.refresh(workspace)
    return schemas.WorkspaceActivateResponse(
        id=workspace.id,
        is_active=workspace.is_active,
        message="Workspace is now LIVE and ready for automated lead response!"
    )

# Dashboard Metrics
@router.get("/dashboard", response_model=schemas.DashboardMetricsResponse)
def get_dashboard_metrics(workspace_id: UUID = Depends(get_workspace_id), db: Session = Depends(get_db)):
    leads = db.query(Lead).filter(Lead.workspace_id == workspace_id).all()

    new_leads = len(leads)
    qualified_leads = sum(1 for l in leads if l.status == "QUALIFIED")
    ai_responded = sum(1 for l in leads if l.ai_response or l.status == "RESPONDED")
    human_handoffs = sum(1 for l in leads if l.status == "HANDOFF_REQUIRED")
    high_value = sum(1 for l in leads if (l.score or 0) >= 80 or (l.estimated_value or 0) > 500)

    return schemas.DashboardMetricsResponse(
        new_leads=new_leads,
        qualified_leads=qualified_leads,
        ai_responded_leads=ai_responded,
        human_handoffs=human_handoffs,
        avg_response_time_seconds=42,
        high_value_opportunities=high_value
    )
