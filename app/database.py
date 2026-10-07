import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings
from sqlalchemy.engine import URL

# Pass raw parameters directly without percent-encoding
db_url = URL.create(
    drivername="postgresql+psycopg",
    username="postgres.dllaourizodwcyxphsdc",
    password="rpUJGj15kv9DkVky",  # Raw password with ! and @
    host="aws-1-eu-west-1.pooler.supabase.com",
    port=6543,
    database="postgres"
)

# Supabase PostgreSQL Connection Engine
engine = create_engine(
    db_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()