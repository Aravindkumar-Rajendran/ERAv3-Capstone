import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration"""
    # Database Configuration
    # Ensure the sqlite_db directory exists
    if not os.path.exists("sqlite_db"):
        os.makedirs("sqlite_db")
        
    DATABASE_FILE = os.path.join("sqlite_db", "whizardlm.db")

    # API Configuration
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    PORT = int(os.getenv("PORT", 8000))
    
    # CORS Configuration
    ALLOWED_ORIGINS = [
        "http://localhost:3000",  # React dev server
        "http://localhost:3001",  # React dev server (alt port)
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]
    
    # File Upload Configuration
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES = ["application/pdf", "text/plain"]
    
    # Content Processing
    MAX_CONTENT_LENGTH = 15000  # characters
    MIN_CONTENT_LENGTH = 10     # characters
    
    # Quiz Configuration
    QUESTIONS_PER_QUIZ = 10
    VALID_SUBTYPES = ["MCQ", "TrueFalse", "FillBlanks", "MatchFollowing"]
    
    @classmethod
    def validate_config(cls):
        """Validate that required configuration is present"""
        if not cls.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        return True 