from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import workspaces, leads
from app.config import settings

# Initialize Database Tables in Supabase
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LeadFlow Backend Engine",
    version="1.0.0",
    description="FastAPI + Supabase PostgreSQL Service Layer for LeadFlow Bubble Frontend"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(workspaces.router)
app.include_router(leads.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENV,
        "database": "Supabase PostgreSQL Connected"
    }