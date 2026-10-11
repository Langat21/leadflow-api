import sys
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200, f"Health check failed: {response.text}"
    print("✓ Health check passed:", response.json())

def test_workspaces_flow():
    # List workspaces
    res = client.get("/api/workspaces/list")
    assert res.status_code == 200, f"List workspaces failed: {res.text}"
    ws_list = res.json()
    print(f"✓ Workspaces list returned {len(ws_list)} workspaces")

    # Get profile
    res = client.get("/api/workspaces/profile")
    assert res.status_code == 200, f"Get workspace profile failed: {res.text}"
    profile = res.json()
    print("✓ Workspace profile:", profile["name"])

    # Update profile
    res = client.post("/api/workspaces/profile", json={
        "name": "Apex Plumbing & HVAC Solutions",
        "industry": "HVAC & Plumbing",
        "website": "https://apexplumbing.com",
        "phone": "+15125550199",
        "service_area": "Austin & Central TX",
        "operating_hours": "24/7 Emergency",
        "description": "Premium service provider"
    })
    assert res.status_code == 200, f"Update profile failed: {res.text}"
    print("✓ Profile updated successfully")

    # Services CRUD
    res = client.get("/api/workspaces/services")
    assert res.status_code == 200, f"Get services failed: {res.text}"
    services = res.json()
    print(f"✓ Services count: {len(services)}")

    res = client.post("/api/workspaces/services", json={
        "name": "Solar Water Heater Installation",
        "priority": "high",
        "price_range": "$3,000 - $6,000",
        "description": "Full eco solar setup"
    })
    assert res.status_code == 200, f"Create service failed: {res.text}"
    new_srv = res.json()
    print("✓ Service created:", new_srv["name"])

    # Qualification config
    res = client.get("/api/workspaces/qualification")
    assert res.status_code == 200, f"Get qualification config failed: {res.text}"

    res = client.put("/api/workspaces/qualification", json={
        "ask_service_type": True,
        "ask_location": True,
        "ask_urgency": True,
        "ask_timeframe": True,
        "ask_budget": True,
        "ask_project_details": True,
        "custom_rules": {"min_lead_score": 70}
    })
    assert res.status_code == 200, f"Update qualification failed: {res.text}"
    print("✓ Qualification config updated")

    # AI Config
    res = client.get("/api/workspaces/ai-config")
    assert res.status_code == 200, f"Get AI config failed: {res.text}"

    res = client.put("/api/workspaces/ai-config", json={
        "tone": "Direct & Helpful",
        "response_behavior": "Immediate qualification and dispatch prompt",
        "knowledge_base": "Standard diagnostic call $99",
        "escalation_rules": "Escalate water leak and zero heating emergencies",
        "restrictions": "No exact firm pricing promises before visual inspection"
    })
    assert res.status_code == 200, f"Update AI config failed: {res.text}"
    print("✓ AI Config updated")

    # Integrations
    res = client.get("/api/workspaces/integrations")
    assert res.status_code == 200, f"Get integrations failed: {res.text}"
    print(f"✓ Integrations count: {len(res.json())}")

    # Activation
    res = client.post("/api/workspaces/activate")
    assert res.status_code == 200, f"Activate workspace failed: {res.text}"
    print("✓ Workspace activated:", res.json()["message"])

    # Dashboard
    res = client.get("/api/workspaces/dashboard")
    assert res.status_code == 200, f"Dashboard metrics failed: {res.text}"
    print("✓ Dashboard metrics:", res.json())

def test_leads_flow():
    # Single test lead
    res = client.post("/api/test-lead", json={
        "lead_name": "Sarah Connor",
        "service_requested": "Emergency AC Repair",
        "location": "Austin Downtown",
        "urgency": "Immediate Emergency",
        "budget": "$1,200",
        "project_details": "AC unit completely stopped blowing cold air."
    })
    assert res.status_code == 200, f"Test lead failed: {res.text}"
    test_res = res.json()
    print("✓ Test lead executed:", test_res["status"], f"Score: {test_res['score']}")

    # Single Ingest
    res = client.post("/api/leads/ingest", json={
        "contact_name": "Robert Patrick",
        "service_requested": "Full Roof Replacement",
        "location": "Round Rock, TX",
        "urgency": "High",
        "budget": "$12,000",
        "details": "Storm damage to shingles.",
        "source": "Website Form"
    })
    assert res.status_code == 200, f"Single ingest failed: {res.text}"
    single_lead = res.json()
    print("✓ Single lead ingested:", single_lead["contact_name"], f"Status: {single_lead['status']}")

    # Bulk Ingest
    res = client.post("/api/leads/bulk-ingest", json={
        "leads": [
            {
                "contact_name": "Alice Johnson",
                "service_requested": "Plumbing Leak Repair",
                "location": "Cedar Park, TX",
                "urgency": "Immediate",
                "budget": "$450",
                "details": "Sink pipe leaking into cabinet."
            },
            {
                "contact_name": "Bob Smith",
                "service_requested": "Annual Duct Cleaning",
                "location": "Georgetown, TX",
                "urgency": "Low",
                "budget": "$150",
                "details": "General seasonal cleaning."
            }
        ]
    })
    assert res.status_code == 200, f"Bulk ingest failed: {res.text}"
    bulk_res = res.json()
    print(f"✓ Bulk ingested {bulk_res['total_ingested']} leads. Qualified: {bulk_res['qualified_count']}, Handoff: {bulk_res['handoff_count']}")

    # List leads
    res = client.get("/api/leads")
    assert res.status_code == 200, f"List leads failed: {res.text}"
    leads = res.json()
    print(f"✓ List leads count: {len(leads)}")

    # Get single lead detail
    first_lead_id = leads[0]["id"]
    res = client.get(f"/api/leads/{first_lead_id}")
    assert res.status_code == 200, f"Get lead detail failed: {res.text}"
    print("✓ Lead detail fetched:", res.json()["contact_name"])

    # Trigger handoff
    res = client.post(f"/api/leads/{first_lead_id}/handoff")
    assert res.status_code == 200, f"Handoff failed: {res.text}"
    print("✓ Handoff triggered:", res.json()["message"])

if __name__ == "__main__":
    test_health()
    test_workspaces_flow()
    test_leads_flow()
    print("\n🎉 ALL BACKEND API TESTS PASSED SUCCESSFULLY!")
