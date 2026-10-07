import uuid
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.database import get_db
from app.models import Lead
from app import schemas

router = APIRouter(prefix="/api", tags=["Leads Pipeline"])

def get_workspace_id(x_workspace_id: Optional[str] = Header(None)) -> UUID:
    if not x_workspace_id:
        return UUID("00000000-0000-0000-0000-000000000001")
    return UUID(x_workspace_id)

@router.post("/test-lead", response_model=schemas.TestLeadResponse)
def execute_test_lead(payload: schemas.TestLeadRequest, workspace_id: UUID = Depends(get_workspace_id), db: Session = Depends(get_db)):
    urgency_lower = payload.urgency.lower()
    is_urgent = any(k in urgency_lower for k in ["emergency", "immediate", "high", "asap"])
    
    score = 90 if is_urgent else 65
    status_str = "QUALIFIED" if score >= 70 else "HANDOFF_REQUIRED"
    
    ai_msg = (
        f"Hello {payload.lead_name}, thank you for reaching out regarding {payload.service_requested}. "
        f"We have noted your location ({payload.location}). Our team has received your inquiry "
        f"and will follow up shortly."
    )
    
    action = "Auto-assign field agent & trigger instant SMS." if status_str == "QUALIFIED" else "Route to manager queue."

    lead_entry = Lead(
        id=uuid.uuid4(),
        workspace_id=workspace_id,
        contact_name=payload.lead_name,
        service_requested=payload.service_requested,
        location=payload.location,
        urgency=payload.urgency,
        budget=payload.budget,
        details=payload.project_details,
        status=status_str,
        score=score,
        ai_response=ai_msg,
        is_test_lead=True,
        created_at=datetime.utcnow()
    )

    db.add(lead_entry)
    db.commit()
    db.refresh(lead_entry)

    return schemas.TestLeadResponse(
        lead_id=lead_entry.id,
        status=status_str,
        score=score,
        ai_response=ai_msg,
        recommended_action=action,
        created_at=lead_entry.created_at
    )

@router.get("/leads", response_model=List[schemas.LeadListItem])
def list_leads(workspace_id: UUID = Depends(get_workspace_id), db: Session = Depends(get_db)):
    return db.query(Lead).filter(Lead.workspace_id == workspace_id).order_by(Lead.created_at.desc()).all()