import uuid
import re
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.database import get_db
from app.models import Lead, Workspace
from app import schemas

router = APIRouter(prefix="/api", tags=["Leads Pipeline"])

def get_workspace_id(x_workspace_id: Optional[str] = Header(None)) -> UUID:
    if not x_workspace_id:
        return UUID("00000000-0000-0000-0000-000000000001")
    try:
        return UUID(x_workspace_id)
    except ValueError:
        return UUID("00000000-0000-0000-0000-000000000001")

def process_lead_ai(item: schemas.LeadIngestRequest) -> tuple[int, str, float, str]:
    """Helper function to calculate score, status, estimated value, and AI response for a lead."""
    urgency_text = (item.urgency or "").lower()
    details_text = (item.details or "").lower()
    service_text = (item.service_requested or "").lower()

    # Base score
    score = 60

    # Urgency boost
    if any(k in urgency_text or k in details_text for k in ["emergency", "immediate", "high", "asap", "today", "now", "broken"]):
        score += 25
    elif any(k in urgency_text for k in ["this week", "soon", "medium"]):
        score += 15

    # Budget / Value estimation
    est_val = 350.0
    if item.budget:
        digits = re.findall(r'\d+', item.budget)
        if digits:
            est_val = float(digits[0])
            if est_val > 1000:
                score += 15
            elif est_val > 500:
                score += 10

    if "replacement" in service_text or "install" in service_text or "roof" in service_text or "solar" in service_text:
        est_val = max(est_val, 2500.0)
        score += 10

    score = min(score, 98)

    status_str = "QUALIFIED" if score >= 70 else "HANDOFF_REQUIRED"

    if status_str == "QUALIFIED":
        ai_response = (
            f"Hi {item.contact_name}, thank you for reaching out to LeadFlow regarding {item.service_requested or 'your request'}. "
            f"Based on your location in {item.location or 'your area'}, we have prioritized your request (Score: {score}/100) "
            f"and our local technician will confirm dispatch shortly."
        )
    else:
        ai_response = (
            f"Hello {item.contact_name}, we received your inquiry for {item.service_requested or 'service'}. "
            f"A customer account manager has been assigned to follow up personally and confirm project parameters."
        )

    return score, status_str, est_val, ai_response

@router.post("/test-lead", response_model=schemas.TestLeadResponse)
def execute_test_lead(payload: schemas.TestLeadRequest, workspace_id: UUID = Depends(get_workspace_id), db: Session = Depends(get_db)):
    ingest_req = schemas.LeadIngestRequest(
        contact_name=payload.lead_name,
        service_requested=payload.service_requested,
        location=payload.location,
        urgency=payload.urgency,
        budget=payload.budget,
        details=payload.project_details,
        source="Test Lead Simulator"
    )

    score, status_str, est_val, ai_msg = process_lead_ai(ingest_req)
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
        estimated_value=est_val,
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

@router.post("/leads/ingest", response_model=schemas.LeadDetailOut)
def single_lead_ingest(payload: schemas.LeadIngestRequest, workspace_id: UUID = Depends(get_workspace_id), db: Session = Depends(get_db)):
    score, status_str, est_val, ai_msg = process_lead_ai(payload)

    lead_entry = Lead(
        id=uuid.uuid4(),
        workspace_id=workspace_id,
        contact_name=payload.contact_name,
        service_requested=payload.service_requested,
        location=payload.location,
        urgency=payload.urgency,
        budget=payload.budget,
        details=payload.details,
        status=status_str,
        score=score,
        estimated_value=est_val,
        ai_response=ai_msg,
        is_test_lead=False,
        created_at=datetime.utcnow()
    )

    db.add(lead_entry)
    db.commit()
    db.refresh(lead_entry)
    return lead_entry

@router.post("/leads/bulk-ingest", response_model=schemas.BulkLeadIngestResponse)
def bulk_lead_ingest(payload: schemas.BulkLeadIngestRequest, workspace_id: UUID = Depends(get_workspace_id), db: Session = Depends(get_db)):
    created_leads = []
    qualified_count = 0
    handoff_count = 0

    for item in payload.leads:
        score, status_str, est_val, ai_msg = process_lead_ai(item)
        if status_str == "QUALIFIED":
            qualified_count += 1
        else:
            handoff_count += 1

        lead_entry = Lead(
            id=uuid.uuid4(),
            workspace_id=workspace_id,
            contact_name=item.contact_name,
            service_requested=item.service_requested,
            location=item.location,
            urgency=item.urgency,
            budget=item.budget,
            details=item.details,
            status=status_str,
            score=score,
            estimated_value=est_val,
            ai_response=ai_msg,
            is_test_lead=False,
            created_at=datetime.utcnow()
        )
        db.add(lead_entry)
        created_leads.append(lead_entry)

    db.commit()
    for l in created_leads:
        db.refresh(l)

    return schemas.BulkLeadIngestResponse(
        total_ingested=len(created_leads),
        qualified_count=qualified_count,
        handoff_count=handoff_count,
        leads=created_leads
    )

@router.get("/leads", response_model=List[schemas.LeadListItem])
def list_leads(workspace_id: UUID = Depends(get_workspace_id), db: Session = Depends(get_db)):
    return db.query(Lead).filter(Lead.workspace_id == workspace_id).order_by(Lead.created_at.desc()).all()

@router.get("/leads/{lead_id}", response_model=schemas.LeadDetailOut)
def get_lead_detail(lead_id: UUID, workspace_id: UUID = Depends(get_workspace_id), db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.workspace_id == workspace_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@router.post("/leads/{lead_id}/handoff", response_model=schemas.LeadHandoffResponse)
def trigger_lead_handoff(lead_id: UUID, workspace_id: UUID = Depends(get_workspace_id), db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.workspace_id == workspace_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    lead.status = "HANDOFF_REQUIRED"
    db.commit()
    db.refresh(lead)

    return schemas.LeadHandoffResponse(
        success=True,
        lead_id=lead.id,
        message=f"Human handoff triggered for lead '{lead.contact_name}'. Escalation notification dispatched.",
        status=lead.status
    )
