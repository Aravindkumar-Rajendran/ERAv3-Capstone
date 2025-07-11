import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import Config
import logging
import time

# Initialize Firebase Admin SDK
def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        if not firebase_admin._apps:
            # Check if service account file exists
            if not os.path.exists(Config.FIREBASE_CREDENTIALS_PATH):
                logging.warning(f"Firebase service account file not found at {Config.FIREBASE_CREDENTIALS_PATH}")
                return False
            
            cred = credentials.Certificate(Config.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred, {
                'projectId': Config.FIREBASE_PROJECT_ID,
            })
            logging.info("Firebase Admin SDK initialized successfully")
            return True
    except Exception as e:
        logging.error(f"Failed to initialize Firebase: {e}")
        return False

# Security scheme for FastAPI
security = HTTPBearer()

class AuthManager:
    def __init__(self):
        self.firebase_initialized = initialize_firebase()
    
    async def verify_token(self, token: str) -> dict:
        """Verify Firebase ID token and return user info"""
        try:
            if not self.firebase_initialized:
                raise HTTPException(
                    status_code=500,
                    detail="Firebase not properly configured"
                )
            
            # FIXED: Verify the ID token with clock tolerance
            # This handles timing issues between client and server
            try:
                decoded_token = auth.verify_id_token(token, clock_skew_seconds=60)
            except auth.InvalidIdTokenError as e:
                # If timing error, wait a moment and retry
                if "too early" in str(e).lower():
                    logging.warning(f"Token timing issue, retrying: {e}")
                    time.sleep(3)
                    decoded_token = auth.verify_id_token(token, clock_skew_seconds=120)
                else:
                    raise e
            
            user_info = {
                "user_id": decoded_token['uid'],
                "email": decoded_token.get('email'),
                "name": decoded_token.get('name'),
                "email_verified": decoded_token.get('email_verified', False)
            }
            
            return user_info
            
        except auth.ExpiredIdTokenError:
            raise HTTPException(
                status_code=401,
                detail="Token has expired. Please login again."
            )
        except auth.InvalidIdTokenError as e:
            if "too early" in str(e).lower():
                raise HTTPException(
                    status_code=401,
                    detail="Token timing issue. Please wait a moment and try again."
                )
            else:
                raise HTTPException(
                    status_code=401,
                    detail=f"Invalid token format: {str(e)}"
                )
        except Exception as e:
            logging.error(f"Token verification error: {e}")
            raise HTTPException(
                status_code=401,
                detail=f"Authentication failed: {str(e)}"
            )
    
    async def get_current_user(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
        """FastAPI dependency to get current authenticated user"""
        token = credentials.credentials
        return await self.verify_token(token)

# Global auth manager instance
auth_manager = AuthManager()

# FastAPI dependency for protected routes
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current authenticated user - use this as dependency in protected routes"""
    return await auth_manager.get_current_user(credentials)

# Optional auth dependency (for routes that work with or without auth)
async def get_current_user_optional(request: Request) -> dict:
    """Optional authentication - returns user info if token provided, None otherwise"""
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        
        token = auth_header.split(" ")[1]
        return await auth_manager.verify_token(token)
    except:
        return None 