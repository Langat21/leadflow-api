from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional
from app.database import get_db
from app.models import Workspace
from app import schemas

router = APIRouter(prefix="/api/workspaces", tags=["Workspaces"])

def get_workspace_id(x_workspace_id: Optional[str] = Header(None)) -> UUID:
    if not x_workspace_id:
        return UUID("00000000-0000-0000-0000-000000000001")
    return UUID(x_workspace_id)

@router.get("/profile", response_model=schemas.WorkspaceOut)
def get_profile(workspace_id: UUID = Depends(get_workspace_id), db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace

@router.post("/profile", response_model=schemas.WorkspaceOut)
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