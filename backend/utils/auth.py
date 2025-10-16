# Firebase authentication utilities
# Verifies Firebase ID tokens and extracts user information


import os
import json
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pathlib import Path
import logging

from config import settings

logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
firebase_app = None

def init_firebase():
    # Initialize Firebase Admin SDK
    # Supports both file-based (local dev) and env var (Cloud Run) credentials

    global firebase_app
    
    if firebase_app is not None:
        return firebase_app
    
    try:
        # Check if running in Cloud Run (secrets as env var)
        if settings.firebase_service_account_json:
            logger.info("Loading Firebase credentials from environment variable")
            cred_dict = json.loads(settings.firebase_service_account_json)
            cred = credentials.Certificate(cred_dict)
        else:
            # Local development (file path)
            logger.info("Loading Firebase credentials from file")
            key_path = Path(settings.firebase_private_key_path)
            
            if not key_path.exists():
                logger.error(f"Firebase service account key not found at {key_path}")
                raise FileNotFoundError(
                    f"Firebase service account key not found. "
                    f"Download it from Firebase Console and save to {key_path}"
                )
            
            cred = credentials.Certificate(str(key_path))
        
        firebase_app = firebase_admin.initialize_app(cred)
        logger.info("✅ Firebase Admin SDK initialized successfully")
        return firebase_app
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize Firebase: {e}")
        raise


# HTTP Bearer token security scheme
security = HTTPBearer()


async def verify_firebase_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Verify Firebase ID token from Authorization header
    
    Args:
        credentials: HTTP Bearer token from Authorization header
        
    Returns:
        str: Firebase UID of authenticated user
        
    Raises:
        HTTPException: If token is invalid or expired
        
    Usage:
        @app.get("/protected")
        async def protected_route(firebase_uid: str = Depends(verify_firebase_token)):
            return {"user_id": firebase_uid}
    """
    
    # Ensure Firebase is initialized
    if firebase_app is None:
        init_firebase()
    
    token = credentials.credentials
    
    try:
        # Verify the token
        decoded_token = auth.verify_id_token(token)
        firebase_uid = decoded_token['uid']
        
        logger.debug(f"Token verified for user: {firebase_uid}")
        return firebase_uid
        
    except auth.InvalidIdTokenError:
        logger.warning("Invalid Firebase ID token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.ExpiredIdTokenError:
        logger.warning("Expired Firebase ID token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(firebase_uid: str = Depends(verify_firebase_token)) -> str:
    """
    Convenience function to get current authenticated user's UID
    Alias for verify_firebase_token
    
    Usage:
        @app.get("/me")
        async def get_me(user_id: str = Depends(get_current_user)):
            return {"user_id": user_id}
    """
    return firebase_uid

