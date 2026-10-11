import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.database import engine, Base
from app.routers import workspaces, leads
from app.config import settings

# Initialize Database Tables in Supabase
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LeadFlow Backend Engine",
    version="1.0.0",
    description="FastAPI + Supabase PostgreSQL Service Layer for LeadFlow Frontend Control Panel"
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

# Serve Built Frontend SPA
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="static_assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Allow API calls to be handled by routers
        if full_path.startswith("api"):
            return None
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
