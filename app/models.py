import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, Enum, String, Boolean, Text, Integer, Numeric, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    industry = Column(String(100), nullable=True)
    website = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    service_area = Column(String(255), nullable=True)
    operating_hours = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    services = relationship("Service", back_populates="workspace", cascade="all, delete-orphan")
    qualification_config = relationship("QualificationConfig", back_populates="workspace", uselist=False, cascade="all, delete-orphan")
    ai_config = relationship("AIConfig", back_populates="workspace", uselist=False, cascade="all, delete-orphan")
    leads = relationship("Lead", back_populates="workspace", cascade="all, delete-orphan")

class Service(Base):
    __tablename__ = "services"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    priority = Column(String(50), default="medium")
    price_range = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    workspace = relationship("Workspace", back_populates="services")

class QualificationConfig(Base):
    __tablename__ = "qualification_configs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), unique=True, nullable=False)
    ask_service_type = Column(Boolean, default=True)
    ask_location = Column(Boolean, default=True)
    ask_urgency = Column(Boolean, default=True)
    ask_timeframe = Column(Boolean, default=True)
    ask_budget = Column(Boolean, default=True)
    ask_project_details = Column(Boolean, default=True)
    custom_rules = Column(JSON, default={})
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    workspace = relationship("Workspace", back_populates="qualification_config")

class AIConfig(Base):
    __tablename__ = "ai_configs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), unique=True, nullable=False)
    tone = Column(String(50), default="Professional")
    response_behavior = Column(Text, nullable=True)
    knowledge_base = Column(Text, nullable=True)
    escalation_rules = Column(Text, nullable=True)
    restrictions = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    workspace = relationship("Workspace", back_populates="ai_config")

class Lead(Base):
    __tablename__ = "leads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    contact_name = Column(String(255), nullable=False)
    service_requested = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    urgency = Column(String(50), nullable=True)
    budget = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    status = Column(String(50), default="NEW")
    score = Column(Integer, default=0)
    estimated_value = Column(Numeric(10, 2), default=0.00)
    ai_response = Column(Text, nullable=True)
    is_test_lead = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    workspace = relationship("Workspace", back_populates="leads")