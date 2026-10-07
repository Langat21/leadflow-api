import uuid
from datetime import datetime, timezone
from app.database import SessionLocal, engine, Base
from app.models import Workspace, Service, QualificationConfig, AIConfig, Lead

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Clearing existing data...")
        # Clear child tables first to respect Foreign Key constraints
        db.query(Lead).delete()
        db.query(AIConfig).delete()
        db.query(QualificationConfig).delete()
        db.query(Service).delete()
        db.query(Workspace).delete()
        db.commit()

        print("Seeding Workspaces...")
        
        # Workspace 1: Standard Pilot Workspace
        ws1_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
        workspace1 = Workspace(
            id=ws1_id,
            name="Apex Plumbing & HVAC",
            industry="Home Services",
            website="https://apexplumbing.com",
            phone="+15125550199",
            service_area="Austin, TX Metropolitan Area",
            operating_hours="24/7 Emergency Service",
            description="Premium residential and commercial plumbing and HVAC repair.",
            is_active=True
        )
        db.add(workspace1)

        # Services
        s1 = Service(
            id=uuid.uuid4(),
            workspace_id=ws1_id,
            name="Emergency Drain Cleaning",
            priority="high",
            price_range="$150 - $450",
            description="Main line and drain clearing"
        )
        s2 = Service(
            id=uuid.uuid4(),
            workspace_id=ws1_id,
            name="HVAC Tune-up & Repair",
            priority="medium",
            price_range="$200 - $1,200",
            description="Complete system diagnostic and service"
        )
        db.add_all([s1, s2])

        # Qualification Rules
        q1 = QualificationConfig(
            workspace_id=ws1_id,
            ask_service_type=True,
            ask_location=True,
            ask_urgency=True,
            ask_timeframe=True,
            ask_budget=True,
            ask_project_details=True
        )
        db.add(q1)

        # AI Configuration
        ai1 = AIConfig(
            workspace_id=ws1_id,
            tone="Professional & Urgent",
            response_behavior="Confirm availability within 15 minutes. Collect address immediately.",
            knowledge_base="Service call fee is $89, waived if repair service is authorized.",
            escalation_rules="Escalate immediately if gas leak, active water leak, or zero heating in winter.",
            restrictions="Do not give binding quotes without physical inspection."
        )
        db.add(ai1)

        # Pre-loaded Pilot Leads
        l1 = Lead(
            workspace_id=ws1_id,
            contact_name="Michael Scott",
            service_requested="Emergency Drain Cleaning",
            location="Downtown Austin, TX",
            urgency="Immediate",
            budget="$300",
            details="Main drain backing up into first-floor bathroom.",
            status="QUALIFIED",
            score=95,
            estimated_value=350.00,
            ai_response="Hello Michael, we have dispatched a technician alert for Downtown Austin. Our team will call you within 10 minutes.",
            is_test_lead=False,
            created_at=datetime.now(timezone.utc)
        )
        
        l2 = Lead(
            workspace_id=ws1_id,
            contact_name="Pam Beesly",
            service_requested="HVAC Maintenance",
            location="North Austin, TX",
            urgency="This Week",
            budget="$200",
            details="Annual tune up before summer heat.",
            status="HANDOFF_REQUIRED",
            score=65,
            estimated_value=200.00,
            ai_response="Hi Pam, thanks for reaching out. A scheduling agent will follow up tomorrow morning to confirm a service slot.",
            is_test_lead=False,
            created_at=datetime.now(timezone.utc)
        )
        db.add_all([l1, l2])

        db.commit()
        print("Database successfully seeded!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()