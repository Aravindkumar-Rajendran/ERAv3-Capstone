from typing import Optional, List
import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from models import QuizRequest, QuizResponse, TimelineResponse, MindmapResponse, FlashcardResponse
from utils.gemini_client import GeminiClient
from prompts.quiz import COMPREHENSIVE_QUIZ_PROMPT
from utils.preprocessor import Chunker, Extractor
from utils.vector_store import Indexer, Retriever
from utils.database import DatabaseClient
from utils.auth import get_current_user, get_current_user_optional
from config import Config
import uuid
import time

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="WhizardLM", version="0.0.1")

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
extractor = Extractor()
chunker = Chunker()
indexer = Indexer()
database_client = DatabaseClient(Config.DATABASE_FILE)

# Simple Firebase test route - serves HTML with proper HTTP protocol
@app.get("/test-auth", response_class=HTMLResponse)
async def test_auth():
    """Serve the Firebase auth test page"""
    try:
        with open("simple_test.html", "r", encoding="utf-8") as f:
            html_content = f.read()
        return HTMLResponse(content=html_content)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Test file not found")

# NEW: Authentication endpoints
@app.post("/auth/verify")
async def verify_token(current_user: dict = Depends(get_current_user)):
    """Verify Firebase token and register/update user"""
    try:
        # Create or update user in database
        database_client.create_or_update_user(
            user_id=current_user["user_id"],
            email=current_user["email"],
            name=current_user.get("name"),
            email_verified=current_user.get("email_verified", False)
        )
        
        return {
            "status": "success",
            "message": "Token verified successfully",
            "user": current_user
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to verify token: {str(e)}"
        )

@app.get("/auth/me")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    try:
        user_data = database_client.get_user(current_user["user_id"])
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "status": "success",
            "user": user_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get user profile: {str(e)}"
        )

@app.get("/auth/conversations")
async def get_user_conversations(current_user: dict = Depends(get_current_user)):
    """Get all conversations for the authenticated user"""
    try:
        conversations = database_client.get_user_conversations(current_user["user_id"])
        return {
            "status": "success",
            "conversations": conversations
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get user conversations: {str(e)}"
        )

# NEW: Diagnostic endpoint to verify user isolation
@app.get("/debug/user-info")
async def debug_user_info(current_user: dict = Depends(get_current_user)):
    """Debug endpoint to show user isolation is working"""
    try:
        # Get user info from database
        user_info = database_client.get_user(current_user["user_id"])
        
        # Get user's conversations
        conversations = database_client.get_user_conversations(current_user["user_id"])
        
        return {
            "status": "success",
            "message": "User isolation is working - this data belongs only to you",
            "firebase_user": {
                "user_id": current_user["user_id"],
                "email": current_user["email"],
                "name": current_user.get("name", "Not provided")
            },
            "database_user": user_info,
            "your_conversations_count": len(conversations),
            "your_conversations": conversations[:5],  # Show first 5
            "isolation_proof": f"This user_id '{current_user['user_id']}' is used to filter ALL your data"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get debug info: {str(e)}"
        )

# TEMPORARY: Test endpoint without authentication (for testing)
@app.get("/auth/test")
async def test_auth_system():
    """Test endpoint to verify authentication system is working"""
    return {
        "status": "success",
        "message": "Authentication system is properly configured",
        "endpoints": [
            "/auth/verify - Verify Firebase token",
            "/auth/me - Get user profile (requires auth)",
            "/auth/conversations - Get user conversations (requires auth)"
        ]
    }

# TEMPORARY: Mock authentication for testing (REMOVE IN PRODUCTION)
@app.post("/auth/mock-login")
async def mock_login(email: str = Form(...)):
    """Mock login endpoint for testing authentication flow without Firebase"""
    try:
        # Create a mock user
        mock_user_id = f"mock_{email.replace('@', '_').replace('.', '_')}"
        
        # Save mock user to database
        database_client.create_or_update_user(
            user_id=mock_user_id,
            email=email,
            name=f"Test User ({email})",
            email_verified=True
        )
        
        # Generate a simple mock token
        mock_token = f"mock_token_{mock_user_id}_{int(time.time())}"
        
        return {
            "status": "success",
            "message": "Mock login successful",
            "mock_token": mock_token,
            "user": {
                "user_id": mock_user_id,
                "email": email,
                "name": f"Test User ({email})"
            },
            "instructions": "Use this mock_token as Bearer token in Bruno for testing"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Mock login failed: {str(e)}"
        )

@app.post("/upload")
async def upload(
    current_user: dict = Depends(get_current_user),
    text: Optional[str] = Form(None),
    files: Optional[List[UploadFile]] = File(None),
    youtube_urls: Optional[List[str]] = Form(None),
):
    """
    Upload text, PDF files, or YouTube URLs to generate a quiz.
    The LLM will analyze the content and choose the best quiz subtype.

    RAG Data Ingestion process
        1. Extract content from file
        2. Chunk content into smaller segments
        3. Convert content to embeddings
        4. Store embeddings in vector database (ChromaDB)
    """
    
    try:
        # Extract content from text or file
        content = []
        if files:
            for file in files:
                if file.content_type == "application/pdf":
                    content.append(await extractor.extract_text_from_pdf(file))
                else:
                    continue # Skip unsupported file types

        if text:
            content.append(text)

        if youtube_urls:
            transcripts = await extractor.extract_transcripts_from_youtube(youtube_urls)
            content.extend(transcripts)

        if not content:
            raise HTTPException(
                status_code=400, 
                detail="No content provided. Please upload a PDF file, provide text, or YouTube URLs."
            )
        # Flatten content list
        # chunk and create topics
        chunks, topics = await chunker.chunk_with_topics(content)

        # store chunks and topics in vector database
        conversation_id = indexer.get_conversation_id()
        indexer.create_index_with_topics(conversation_id, chunks, topics)
        # save topics with conversation ID and user_id in sqlite
        database_client.write_topics(conversation_id, topics, user_id=current_user["user_id"])

        return {
            "status": "success",
            "conversation_id": conversation_id,
            "message": "Content processed and indexed successfully",
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process upload: {str(e)}"
        )
                

@app.post("/chat")
async def chat(
    current_user: dict = Depends(get_current_user),
    user_input: str = Form(..., description="User query for chat"),
    conversation_id: str = Form(..., description="Unique conversation identifier"),
):
    """
    Chat with the LLM using user input and optional context.
    The LLM will respond based on the provided input and context.
    """
    
    try:
        if not user_input or len(user_input.strip()) < 5:
            raise HTTPException(
                status_code=400, 
                detail="User input is too short. Please provide at least 5 characters."
            )
        
        retriever = Retriever(conversation_id=conversation_id)

        # Retrieve context based on user input
        context = retriever.semantic_search(user_input)

        print(f"Retrieved context: {context}")

        # Generate response using Gemini
        response = gemini_client.chat(user_input, context)

        # Save both user message and assistant response to database with user_id
        database_client.write_chat_message(conversation_id, "user", user_input, user_id=current_user["user_id"])
        database_client.write_chat_message(conversation_id, "assistant", response, user_id=current_user["user_id"])
        
        return {
            "response": response,
            "status": "success",
            "message": "Chat response generated successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate chat response: {str(e)}"
        )


@app.get("/topics/{conversation_id}")
async def get_topics(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Retrieve topics from the database based on conversation ID.
    This will return a list of topics associated with the conversation.
    """
    
    try:
        if not conversation_id:
            raise HTTPException(
                status_code=400, 
                detail="Conversation ID is required."
            )
        
        topics = database_client.read_topics(conversation_id, user_id=current_user["user_id"])
        
        if not topics:
            raise HTTPException(
                status_code=404, 
                detail="No topics found for the provided conversation ID."
            )
        
        return {
            "topics": topics,
            "status": "success",
            "message": "Topics retrieved successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve topics: {str(e)}"
        )


@app.get("/conversations/{conversation_id}")
async def get_conversation_history(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Retrieve conversation history from the database based on conversation ID.
    This will return all chat messages associated with the conversation.
    """
    
    try:
        if not conversation_id:
            raise HTTPException(
                status_code=400, 
                detail="Conversation ID is required."
            )
        
        # Get conversation metadata with user_id
        conversation_info = database_client.get_conversation_info(conversation_id, user_id=current_user["user_id"])
        
        # Get all chat messages with user_id
        messages = database_client.read_chat_messages(conversation_id, user_id=current_user["user_id"])
        
        if not messages and not conversation_info:
            raise HTTPException(
                status_code=404, 
                detail="No conversation found for the provided conversation ID."
            )
        
        return {
            "conversation_info": conversation_info,
            "messages": messages,
            "status": "success",
            "message": "Conversation history retrieved successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve conversation history: {str(e)}"
        )


@app.get("/interactive-history/{conversation_id}")
async def get_interactive_history(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Retrieve interactive content history from the database based on conversation ID.
    This will return all generated interactive content associated with the conversation.
    """
    
    try:
        if not conversation_id:
            raise HTTPException(
                status_code=400, 
                detail="Conversation ID is required."
            )
        
        interactive_history = database_client.read_interactive_content(conversation_id, user_id=current_user["user_id"])
        
        if not interactive_history:
            raise HTTPException(
                status_code=404, 
                detail="No interactive content found for the provided conversation ID."
            )
        
        return {
            "interactive_history": interactive_history,
            "status": "success",
            "message": "Interactive content history retrieved successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve interactive content history: {str(e)}"
        )


@app.post("/interact", response_model=QuizResponse)
async def generate_interactives(
    current_user: dict = Depends(get_current_user),
    topics: List[str] = Form(None),
    conversation_id: str = Form(..., description="Unique conversation identifier")
):
    """
    Generate a quiz based on text content or uploaded PDF file.
    The LLM will analyze the content and choose the best quiz subtype.
    """
    
    try:
        print(f"📥 Received interaction request with topics: {topics}, conversation_id: {conversation_id}")
        
        if not topics or len(topics) == 0:
            raise HTTPException(
                status_code=400, 
                detail="No topics provided. Please provide at least one topic."
            )
        
        print(f"🔍 Creating retriever for conversation: {conversation_id}")
        retriever = Retriever(conversation_id=conversation_id)
        
        print(f"Retrieving content for topics: {topics}")

        # retrieve content based on topics
        content = retriever.retrieve_content_with_topics(topics)
        print(f"📄 Retrieved content length: {len(content) if content else 0}")
        
        if not content:
            raise HTTPException(
                status_code=400,
                detail="No content found for the provided topics. Please try different topics."
            )

        print(f"🤖 Generating quiz with Gemini...")
        # Generate quiz using Gemini
        quiz_json = await gemini_client.generate_quiz(content, COMPREHENSIVE_QUIZ_PROMPT)
        print(f"✅ Quiz generated successfully!")
        
        # Save interactive content to database with user_id
        database_client.write_interactive_content(conversation_id, "quiz", quiz_json, topics, user_id=current_user["user_id"])
        print(f"💾 Quiz saved to database successfully!")
        
        return QuizResponse(
            quiz_data=quiz_json,
            status="success",
            message="Quiz generated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in generate_interactives: {str(e)}")
        print(f"❌ Error type: {type(e).__name__}")
        import traceback
        print(f"❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate quiz: {str(e)}"
        )

@app.post("/interact-timeline", response_model=TimelineResponse)
async def generate_timeline(
    current_user: dict = Depends(get_current_user),
    topics: Optional[List[str]] = Form(None),
    conversation_id: str = Form(..., description="Unique conversation identifier")
):
    """Generate a timeline based on selected topics."""
    try:
        print(f"📥 Received timeline request with topics: {topics}, conversation_id: {conversation_id}")
        
        if not topics or len(topics) == 0:
            raise HTTPException(
                status_code=400, 
                detail="No topics provided. Please provide at least one topic."
            )
        
        retriever = Retriever(conversation_id=conversation_id)
        content = retriever.retrieve_content_with_topics(topics)
        
        if not content:
            raise HTTPException(
                status_code=400,
                detail="No content found for the provided topics. Please try different topics."
            )

        # Import timeline prompt
        from prompts.timeline import COMPREHENSIVE_TIMELINE_PROMPT
        
        # Generate timeline using Gemini
        full_prompt = f"{COMPREHENSIVE_TIMELINE_PROMPT}\n\nCONTENT TO ANALYZE:\n{content}"
        timeline_response = gemini_client.generate(full_prompt)
        
        # Parse JSON response
        import json
        if "```json" in timeline_response:
            start = timeline_response.find("```json") + 7
            end = timeline_response.find("```", start)
            timeline_response = timeline_response[start:end].strip()
        elif "```" in timeline_response:
            start = timeline_response.find("```") + 3
            end = timeline_response.find("```", start)
            timeline_response = timeline_response[start:end].strip()
        
        timeline_json = json.loads(timeline_response)
        
        # Check if timeline generation was rejected
        if "error" in timeline_json and timeline_json["error"] == "TIMELINE_NOT_SUITABLE":
            return TimelineResponse(
                timeline_data={"error": "TIMELINE_NOT_SUITABLE", "message": timeline_json["message"]},
                status="rejected",
                message=timeline_json["message"]
            )
        
        # Save interactive content to database with user_id
        database_client.write_interactive_content(conversation_id, "timeline", timeline_json, topics, user_id=current_user["user_id"])
        print(f"💾 Timeline saved to database successfully!")
        
        return TimelineResponse(
            timeline_data=timeline_json,
            status="success",
            message="Timeline generated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in generate_timeline: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate timeline: {str(e)}"
        )


@app.post("/interact-mindmap", response_model=MindmapResponse)
async def generate_mindmap(
    current_user: dict = Depends(get_current_user),
    topics: Optional[List[str]] = Form(None),
    conversation_id: str = Form(..., description="Unique conversation identifier")
):
    """Generate a mindmap based on selected topics."""
    try:
        print(f"📥 Received mindmap request with topics: {topics}, conversation_id: {conversation_id}")
        
        if not topics or len(topics) == 0:
            raise HTTPException(
                status_code=400, 
                detail="No topics provided. Please provide at least one topic."
            )
        
        retriever = Retriever(conversation_id=conversation_id)
        content = retriever.retrieve_content_with_topics(topics)
        
        if not content:
            raise HTTPException(
                status_code=400,
                detail="No content found for the provided topics. Please try different topics."
            )

        # Import mindmap prompt
        from prompts.mindmap import COMPREHENSIVE_MINDMAP_PROMPT
        
        # Generate mindmap using Gemini
        full_prompt = f"{COMPREHENSIVE_MINDMAP_PROMPT}\n\nCONTENT TO ANALYZE:\n{content}"
        mindmap_response = gemini_client.generate(full_prompt)
        
        # Parse JSON response
        import json
        if "```json" in mindmap_response:
            start = mindmap_response.find("```json") + 7
            end = mindmap_response.find("```", start)
            mindmap_response = mindmap_response[start:end].strip()
        elif "```" in mindmap_response:
            start = mindmap_response.find("```") + 3
            end = mindmap_response.find("```", start)
            mindmap_response = mindmap_response[start:end].strip()
        
        mindmap_json = json.loads(mindmap_response)
        
        # Save interactive content to database with user_id
        database_client.write_interactive_content(conversation_id, "mindmap", mindmap_json, topics, user_id=current_user["user_id"])
        print(f"💾 Mindmap saved to database successfully!")
        
        return MindmapResponse(
            mindmap_data=mindmap_json,
            status="success",
            message="Mindmap generated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in generate_mindmap: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate mindmap: {str(e)}"
        )


@app.post("/interact-flashcard", response_model=FlashcardResponse)
async def generate_flashcard(
    current_user: dict = Depends(get_current_user),
    topics: Optional[List[str]] = Form(None),
    conversation_id: str = Form(..., description="Unique conversation identifier")
):
    """Generate flashcards based on selected topics."""
    try:
        print(f"📥 Received flashcard request with topics: {topics}, conversation_id: {conversation_id}")
        
        if not topics or len(topics) == 0:
            raise HTTPException(
                status_code=400, 
                detail="No topics provided. Please provide at least one topic."
            )
        
        retriever = Retriever(conversation_id=conversation_id)
        content = retriever.retrieve_content_with_topics(topics)
        
        if not content:
            raise HTTPException(
                status_code=400,
                detail="No content found for the provided topics. Please try different topics."
            )

        # Import flashcard prompt
        from prompts.flashcard import COMPREHENSIVE_FLASHCARD_PROMPT
        
        # Generate flashcard using Gemini
        full_prompt = f"{COMPREHENSIVE_FLASHCARD_PROMPT}\n\nCONTENT TO ANALYZE:\n{content}"
        flashcard_response = gemini_client.generate(full_prompt)
        
        # Parse JSON response
        import json
        if "```json" in flashcard_response:
            start = flashcard_response.find("```json") + 7
            end = flashcard_response.find("```", start)
            flashcard_response = flashcard_response[start:end].strip()
        elif "```" in flashcard_response:
            start = flashcard_response.find("```") + 3
            end = flashcard_response.find("```", start)
            flashcard_response = flashcard_response[start:end].strip()
        
        flashcard_json = json.loads(flashcard_response)
        
        # Save interactive content to database with user_id
        database_client.write_interactive_content(conversation_id, "flashcard", flashcard_json, topics, user_id=current_user["user_id"])
        print(f"💾 Flashcard saved to database successfully!")
        
        return FlashcardResponse(
            flashcard_data=flashcard_json,
            status="success",
            message="Flashcard generated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in generate_flashcard: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate flashcard: {str(e)}"
        )

if __name__ == "__main__":
    # Validate config
    Config.validate_config()
    
    # Use port from config
    uvicorn.run(app, host="0.0.0.0", port=Config.PORT)