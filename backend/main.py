# coding agent

import os
import json
from typing import Optional, Union
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

from coding_agent.gemini_client import GeminiClient
from coding_agent.quiz_prompts import COMPREHENSIVE_QUIZ_PROMPT
from pdf_extractor import extract_text_from_pdf
from config import Config

# Load environment variables
load_dotenv()

app = FastAPI(title="WhizardLM Quiz Generator", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.ALLOWED_ORIGINS,  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini client
gemini_client = GeminiClient()

class QuizRequest(BaseModel):
    content: str
    format_type: str = "quiz"

class QuizResponse(BaseModel):
    quiz_data: dict
    status: str
    message: str

@app.get("/")
async def root():
    return {"message": "WhizardLM Quiz Generator API", "status": "running"}

@app.post("/generate-quiz", response_model=QuizResponse)
async def generate_quiz(
    content: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Generate a quiz based on text content or uploaded PDF file.
    The LLM will analyze the content and choose the best quiz subtype.
    """
    
    try:
        # Extract content from text or file
        if file:
            if file.content_type == "application/pdf":
                content = await extract_text_from_pdf(file)
            else:
                # Handle text files
                file_content = await file.read()
                content = file_content.decode('utf-8')
        
        if not content or len(content.strip()) < 10:
            raise HTTPException(
                status_code=400, 
                detail="Content is too short. Please provide at least 10 characters."
            )
        
        # Generate quiz using Gemini
        quiz_json = await gemini_client.generate_quiz(content, COMPREHENSIVE_QUIZ_PROMPT)
        
        return QuizResponse(
            quiz_data=quiz_json,
            status="success",
            message="Quiz generated successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate quiz: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "quiz-generator"}

if __name__ == "__main__":
    # Validate config
    Config.validate_config()
    
    # Use port from config
    uvicorn.run(app, host="0.0.0.0", port=Config.PORT)