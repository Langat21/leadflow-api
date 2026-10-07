from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    ENV: str = "development"
    PORT: int = 8000

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()