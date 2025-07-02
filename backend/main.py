from typing import Optional, List
import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, Body, Query
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
from pydantic import BaseModel
import traceback

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
async def get_user_conversations(
    project_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get all conversations for the authenticated user and project (if provided)"""
    try:
        conversations = database_client.get_user_conversations(current_user["user_id"], project_id)
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

# NEW: Check if user exists (public endpoint for sign up/login flow)
@app.post("/auth/check-user")
async def check_user_exists(email: str = Form(...)):
    """Check if a user exists in the system (public endpoint)"""
    try:
        # Check if user exists in database by email
        user_data = database_client.get_user_by_email(email)
        
        return {
            "status": "success",
            "exists": user_data is not None,
            "message": "User exists" if user_data else "User not found"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to check user existence: {str(e)}"
        )

# NEW: Register new user (public endpoint)
@app.post("/auth/register")
async def register_new_user(current_user: dict = Depends(get_current_user)):
    """Register a new user in the system"""
    try:
        # Check if user already exists
        existing_user = database_client.get_user(current_user["user_id"])
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="User already exists in the system"
            )
        
        # Create new user
        database_client.create_or_update_user(
            user_id=current_user["user_id"],
            email=current_user["email"],
            name=current_user.get("name"),
            email_verified=current_user.get("email_verified", False)
        )
        
        return {
            "status": "success",
            "message": "User registered successfully",
            "user": current_user
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to register user: {str(e)}"
        )

@app.post("/upload")
async def upload(
    current_user: dict = Depends(get_current_user),
    text: Optional[str] = Form(None),
    files: Optional[List[UploadFile]] = File(None),
    youtube_urls: Optional[List[str]] = Form(None),
    project_id: str = Form(...),
):
    """
    Upload text, PDF files, or YouTube URLs to generate a quiz.
    The LLM will analyze the content and choose the best quiz subtype.
    """
    try:
        # Extract content from text or file
        content = []
        source_type = None
        source_name = None
        source_content = None
        source_url = None
        if files:
            for file in files:
                if file.content_type == "application/pdf":
                    try:
                        extracted = await extractor.extract_text_from_pdf(file)
                        content.append(extracted)
                        source_type = "pdf"
                        source_name = file.filename
                        source_content = None
                        source_url = None
                    except Exception as e:
                        print(f"PDF extraction failed for {file.filename}: {e}")
                        continue  # Skip this file, try others
                else:
                    continue # Skip unsupported file types
        if text:
            content.append(text)
            source_type = "text"
            source_name = text[:40] + ("..." if len(text) > 40 else "")
            source_content = text
            source_url = None
        if youtube_urls:
            transcripts = await extractor.extract_transcripts_from_youtube(youtube_urls)
            content.extend(transcripts)
            source_type = "youtube"
            source_name = youtube_urls[0] if isinstance(youtube_urls, list) else youtube_urls
            source_content = None
            source_url = youtube_urls[0] if isinstance(youtube_urls, list) else youtube_urls
        if not content:
            raise HTTPException(
                status_code=400, 
                detail="No content provided. Please upload a PDF file with extractable text, provide text, or YouTube URLs."
            )
        # Flatten content list
        # chunk and create topics
        chunks, topics = await chunker.chunk_with_topics(content)
        conversation_id = indexer.get_conversation_id()
        if chunks and topics:
            # --- Accumulate topics instead of overwriting ---
            existing_topics = database_client.read_project_topics(project_id, user_id=current_user["user_id"])
            if existing_topics:
                # Merge and deduplicate, preserving order
                merged_topics = list(dict.fromkeys([t.strip() for t in existing_topics + topics if t and t.strip()]))
            else:
                merged_topics = [t.strip() for t in topics if t and t.strip()]
            database_client.write_topics(project_id, merged_topics, user_id=current_user["user_id"])
            # Index only the new topics/chunks for this upload
            indexer.create_index_with_topics(conversation_id, chunks, topics)
        else:
            print("No chunks/topics to index for this upload. Skipping ChromaDB indexing.")
        # Store the source in the database
        source_id = str(uuid.uuid4())
        database_client.write_source(
            source_id=source_id,
            user_id=current_user["user_id"],
            project_id=project_id,
            name=source_name or f"Source {source_id[:8]}",
            type_=source_type or "text",
            content=source_content,
            url=source_url
        )
        return {
            "status": "success",
            "conversation_id": conversation_id,
            "source_id": source_id,
            "source_name": source_name or f"Source {source_id[:8]}",
            "message": "Content processed and indexed successfully",
        }
    except Exception as e:
        print("UPLOAD ERROR:", traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process upload: {str(e)}"
        )

@app.get("/sources")
async def get_sources(
    project_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
):
    """
    List all sources for the current user and project.
    """
    try:
        sources = database_client.list_sources(current_user["user_id"], project_id)
        return {"status": "success", "sources": sources}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch sources: {str(e)}"
        )

@app.post("/chat")
async def chat(
    current_user: dict = Depends(get_current_user),
    user_input: str = Form(..., description="User query for chat"),
    conversation_id: str = Form(..., description="Unique conversation identifier"),
    project_id: str = Form(..., description="Project identifier"),
):
    """
    Chat with the LLM using user input, context, and conversation history.
    The LLM will respond based on the provided input, context, and previous conversation.
    """
    try:
        if not user_input or len(user_input.strip()) < 2:
            raise HTTPException(
                status_code=400, 
                detail="User input is too short. Please provide at least 2 characters."
            )
        retriever = Retriever(conversation_id=conversation_id)
        # Retrieve context based on user input
        context = retriever.semantic_search(user_input)
        print(f"Retrieved context: {context}")
        # Retrieve conversation history for multi-turn dialogue
        conversation_history = database_client.read_chat_messages(conversation_id, user_id=current_user["user_id"])
        print(f"Retrieved conversation history: {len(conversation_history) if conversation_history else 0} messages")
        # DEBUG: Print the exact structure of conversation history
        if conversation_history:
            print(f"DEBUG: First message structure: {conversation_history[0]}")
            for i, msg in enumerate(conversation_history):
                print(f"DEBUG: Message {i}: type='{msg.get('type')}', content='{msg.get('content', '')[:50]}...'")
        # Generate response using Gemini with conversation history
        try:
            response = gemini_client.chat(user_input, context, conversation_history)
            print(f"DEBUG: Successfully generated response")
        except Exception as gemini_error:
            print(f"DEBUG: Gemini error: {str(gemini_error)}")
            print(f"DEBUG: Gemini error type: {type(gemini_error).__name__}")
            raise gemini_error
        # Save both user message and assistant response to database with user_id and project_id
        database_client.write_chat_message(conversation_id, "user", user_input, user_id=current_user["user_id"], project_id=project_id)
        database_client.write_chat_message(conversation_id, "assistant", response, user_id=current_user["user_id"], project_id=project_id)
        return {
            "response": response,
            "status": "success",
            "message": "Chat response generated successfully"
        }
    except Exception as e:
        print(f"DEBUG: Chat endpoint error: {str(e)}")
        print(f"DEBUG: Error type: {type(e).__name__}")
        print(f"DEBUG: Full traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate chat response: {str(e)}"
        )


@app.get("/topics/{project_id}")
async def get_topics(
    project_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Retrieve topics for the given project for the current user.
    """
    try:
        print('User:', current_user["user_id"])
        print('Project:', project_id)
        
        topics = database_client.read_project_topics(project_id, user_id=current_user["user_id"])
        print('Topics:', topics)
        
        if not topics:
            print('No topics found for this project.')
            return {
                "topics": [],
                "status": "success", 
                "message": "No topics found for this project."
            }
            
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





@app.post("/interact-quiz", response_model=QuizResponse)
async def generate_interactives(
    current_user: dict = Depends(get_current_user),
    topics: List[str] = Form(None),
    project_id: str = Form(..., description="Project identifier")
):
    """
    Generate a quiz based on text content or uploaded PDF file.
    The LLM will analyze the content and choose the best quiz subtype.
    """
    try:
        print(f"📥 Received interaction request with topics: {topics}, project_id: {project_id}")
        if not topics or len(topics) == 0:
            raise HTTPException(
                status_code=400, 
                detail="No topics provided. Please provide at least one topic."
            )
        print(f"🔍 Creating retriever for project: {project_id}")
        retriever = Retriever(project_id=project_id)
        print(f"Retrieving content for topics: {topics}")
        content = retriever.retrieve_content_by_project(project_id, topics)
        print(f"📄 Retrieved content length: {len(content) if content else 0}")
        if not content:
            raise HTTPException(
                status_code=400,
                detail="No content found for the provided topics. Please try different topics."
            )
        print(f"🤖 Generating quiz with Gemini...")
        quiz_json = await gemini_client.generate_quiz(content, COMPREHENSIVE_QUIZ_PROMPT)
        print(f"✅ Quiz generated successfully!")
        interact_id = str(uuid.uuid4())
        database_client.write_interactive_content(interact_id, project_id, "quiz", quiz_json, topics, user_id=current_user["user_id"])
        print(f"💾 Quiz saved to database successfully!")
        database_client.write_interactive_history(current_user["user_id"], project_id, "quiz", topics)
        return QuizResponse(
            quiz_data=quiz_json,
            status="success",
            message="Quiz generated successfully",
            interact_id=interact_id
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in generate_interactives: {str(e)}")
        print(f"❌ Error type: {type(e).__name__}")
        print(f"❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate quiz: {str(e)}"
        )

@app.post("/interact-timeline", response_model=TimelineResponse)
async def generate_timeline(
    current_user: dict = Depends(get_current_user),
    topics: Optional[List[str]] = Form(None),
    project_id: str = Form(..., description="Project identifier")
):
    """Generate a timeline based on selected topics."""
    try:
        print(f"📥 Received timeline request with topics: {topics}, project_id: {project_id}")
        
        if not topics or len(topics) == 0:
            raise HTTPException(
                status_code=400, 
                detail="No topics provided. Please provide at least one topic."
            )
        
        retriever = Retriever(project_id=project_id)
        content = retriever.retrieve_content_by_project(project_id, topics)
        
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
        
        interact_id = str(uuid.uuid4())
        database_client.write_interactive_content(interact_id, project_id, "timeline", timeline_json, topics, user_id=current_user["user_id"])
        print(f"💾 Timeline saved to database successfully!")
        database_client.write_interactive_history(current_user["user_id"], project_id, "timeline", topics)
        
        return TimelineResponse(
            timeline_data=timeline_json,
            status="success",
            message="Timeline generated successfully",
            interact_id=interact_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in generate_timeline: {str(e)}")
        print(f"❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate timeline: {str(e)}"
        )


@app.post("/interact-mindmap", response_model=MindmapResponse)
async def generate_mindmap(
    current_user: dict = Depends(get_current_user),
    topics: Optional[List[str]] = Form(None),
    project_id: str = Form(..., description="Project identifier")
):
    """Generate a mindmap based on selected topics."""
    try:
        print(f"📥 Received mindmap request with topics: {topics}, project_id: {project_id}")
        
        if not topics or len(topics) == 0:
            raise HTTPException(
                status_code=400, 
                detail="No topics provided. Please provide at least one topic."
            )
        
        retriever = Retriever(project_id=project_id)
        content = retriever.retrieve_content_by_project(project_id, topics)
        
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
        
        interact_id = str(uuid.uuid4())
        database_client.write_interactive_content(interact_id, project_id, "mindmap", mindmap_json, topics, user_id=current_user["user_id"])
        print(f"💾 Mindmap saved to database successfully!")
        database_client.write_interactive_history(current_user["user_id"], project_id, "mindmap", topics)
        
        return MindmapResponse(
            mindmap_data=mindmap_json,
            status="success",
            message="Mindmap generated successfully",
            interact_id=interact_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in generate_mindmap: {str(e)}")
        print(f"❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate mindmap: {str(e)}"
        )


@app.post("/interact-flashcard", response_model=FlashcardResponse)
async def generate_flashcard(
    current_user: dict = Depends(get_current_user),
    topics: Optional[List[str]] = Form(None),
    project_id: str = Form(..., description="Project identifier")
):
    """Generate flashcards based on selected topics."""
    try:
        print(f"📥 Received flashcard request with topics: {topics}, project_id: {project_id}")
        
        if not topics or len(topics) == 0:
            raise HTTPException(
                status_code=400, 
                detail="No topics provided. Please provide at least one topic."
            )
        
        retriever = Retriever(project_id=project_id)
        content = retriever.retrieve_content_by_project(project_id, topics)
        
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
        
        interact_id = str(uuid.uuid4())
        database_client.write_interactive_content(interact_id, project_id, "flashcard", flashcard_json, topics, user_id=current_user["user_id"])
        print(f"💾 Flashcard saved to database successfully!")
        database_client.write_interactive_history(current_user["user_id"], project_id, "flashcard", topics)
        
        return FlashcardResponse(
            flashcard_data=flashcard_json,
            status="success",
            message="Flashcard generated successfully",
            interact_id=interact_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in generate_flashcard: {str(e)}")
        print(f"❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate flashcard: {str(e)}"
        )

class ProjectCreateRequest(BaseModel):
    name: str

@app.post("/projects")
async def create_project(request: ProjectCreateRequest, current_user: dict = Depends(get_current_user)):
    """Create a new project for the current user"""
    try:
        project_id = str(uuid.uuid4())
        database_client.create_project(project_id, current_user["user_id"], request.name)
        return {"status": "success", "project": {"id": project_id, "name": request.name}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create project: {str(e)}")

@app.get("/projects")
async def list_projects(current_user: dict = Depends(get_current_user)):
    """List all projects for the current user"""
    try:
        projects = database_client.list_projects(current_user["user_id"])
        return {"status": "success", "projects": projects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list projects: {str(e)}")

@app.get("/projects/{project_id}")
async def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    """Get details of a specific project for the current user"""
    try:
        project = database_client.get_project(project_id, current_user["user_id"])
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return {"status": "success", "project": project}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get project: {str(e)}")

@app.post("/conversations/new")
async def create_new_conversation(
    project_id: str = Form(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Create a new conversation for the current user and project.
    """
    try:
        conversation_id = str(uuid.uuid4())
        title = f"Conversation {conversation_id[:8]}"
        database_client.create_conversation(conversation_id, title=title, user_id=current_user["user_id"], project_id=project_id)
        return {"status": "success", "conversation_id": conversation_id, "title": title}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create new conversation: {str(e)}")

@app.get("/interact-history")
async def get_user_interactive_history(
    project_id: str = Query(..., description="Project identifier"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get the 10 most recent interactive history entries for the current user and project.
    """
    try:
        user_id = current_user["user_id"]
        history = database_client.read_interactive_history(user_id, project_id, limit=10)
        return {
            "interactive_history": history,
            "status": "success",
            "message": "Fetched recent interactive history."
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch interactive history: {str(e)}"
        )

# New endpoint to fetch interactive content by interact_id
@app.get("/interact-content/{interact_id}")
async def get_interactive_content(
    interact_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Fetch a single interactive element (quiz, timeline, mindmap, flashcard) by its interact_id.
    """
    try:
        content = database_client.read_interactive_content(interact_id, user_id=current_user["user_id"])
        if not content:
            raise HTTPException(status_code=404, detail="Interactive content not found")
        return {"status": "success", "interactive_content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch interactive content: {str(e)}")

if __name__ == "__main__":
    # Validate config
    Config.validate_config()
    
    # Use port from config
    uvicorn.run(app, host="0.0.0.0", port=Config.PORT)