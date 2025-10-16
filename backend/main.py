"""
Kleio.ai - AI-Powered Household Inventory Management
FastAPI Backend Application

Architecture: Firebase Auth + PostgreSQL (Option 1)
- Firebase: User authentication ONLY (token verification)
- PostgreSQL: ALL application data (inventory, consumption, predictions)
- FastAPI: Business logic + token verification middleware
- Gemini AI: Recipes and photo detection (Phase 2)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import sys

from config import settings
from database import init_db, check_db_connection
from utils.auth import init_firebase
from routers import health, users, inventory, ai, recipes, shopping, chat, telegram
from utils.scheduler import start_scheduler, stop_scheduler

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):

    # Application lifespan events
    # Runs on startup and shutdown

    # Startup
    logger.info(f"🚀 Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"Environment: {settings.environment}")
    
    # Initialize Firebase
    try:
        init_firebase()
        logger.info("✅ Firebase initialized")
    except Exception as e:
        logger.error(f"❌ Firebase initialization failed: {e}")
        if settings.is_production:
            raise
    
    # Initialize database
    try:
        if check_db_connection():
            init_db()
            logger.info("✅ Database initialized")
        else:
            logger.error("❌ Database connection failed")
            if settings.is_production:
                raise Exception("Database connection required")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        if settings.is_production:
            raise
    
    # Start background job scheduler for pattern analysis
    try:
        start_scheduler()
        logger.info("✅ Background job scheduler started")
    except Exception as e:
        logger.error(f"⚠️ Failed to start scheduler: {e}")
        # Don't fail startup if scheduler fails
    
    logger.info("✅ Application startup complete")
    
    yield
    
    # Shutdown
    logger.info("👋 Shutting down application")
    
    # Stop background scheduler
    try:
        stop_scheduler()
        logger.info("✅ Background scheduler stopped")
    except Exception as e:
        logger.error(f"⚠️ Error stopping scheduler: {e}")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    description="AI-powered household inventory management for Indian families",
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    # Log all HTTP requests
    logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Status: {response.status_code}")
    return response


# Include routers
app.include_router(health.router)
app.include_router(users.router)
app.include_router(inventory.router)
app.include_router(ai.router)
app.include_router(recipes.router)
app.include_router(shopping.router)
app.include_router(chat.router)
app.include_router(telegram.router)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    # Handle unexpected errors
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return {
        "error": "Internal server error",
        "detail": str(exc) if settings.debug else "An unexpected error occurred"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=settings.debug,
        log_level="debug" if settings.debug else "info"
    )

