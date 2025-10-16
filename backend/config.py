# Configuration management for Kleio.ai backend
# Loads environment variables and provides app settings

from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path


class Settings(BaseSettings):
    # Application settings loaded from environment variables
    
    # Application
    app_name: str = "Kleio.ai API"
    app_version: str = "1.0.0"
    environment: str = "development"
    debug: bool = True
    port: int = 8080  # Cloud Run default port
    
    # Database
    database_url: str
    
    # Firebase (supports both file and env var for Cloud Run)
    firebase_project_id: str = ""
    firebase_private_key_path: str = "./firebase-adminsdk.json"
    firebase_service_account_json: str = ""  # For Cloud Run - entire JSON as string
    
    # Google AI
    gemini_api_key: str
    
    # CORS
    cors_origins: str = "http://localhost:5173"
    
    # Rate Limiting
    rate_limit_per_minute: int = 60
    
    # Telegram Bot
    telegram_bot_token: str = ""
    telegram_webhook_secret: str = ""
    
    # Optional APIs
    openai_api_key: str = ""
    
    @property
    def cors_origins_list(self) -> List[str]:
        # Convert comma-separated CORS origins to list
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    @property
    def is_production(self) -> bool:
        # Check if running in production
        return self.environment.lower() == "production"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Create settings instance
settings = Settings()

# Ensure Firebase key file exists
firebase_key_path = Path(settings.firebase_private_key_path)
if not firebase_key_path.exists() and settings.environment != "test":
    print(f"⚠️  Warning: Firebase service account key not found at {firebase_key_path}")
    print("   Download it from Firebase Console → Project Settings → Service Accounts")

