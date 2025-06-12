from typing import Optional, List
import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from models import QuizRequest, QuizResponse, TimelineResponse, MindmapResponse, FlashcardResponse
from utils.gemini_client import GeminiClient
from prompts.quiz import COMPREHENSIVE_QUIZ_PROMPT
from utils.preprocessor import Chunker, Extractor
from utils.vector_store import Indexer, Retriever
from utils.database import DatabaseClient
from config import Config

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


@app.get("/")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "WhizardLM API"}

@app.post("/upload")
async def upload(
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
        # save topics with conversation ID in sqlite
        database_client.write_topics(conversation_id, topics)

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

        # Save conversation to database
        conversation_dict = {
            "conversation_id": conversation_id,
            "user_input": user_input,
            "response": response
        }

        database_client.write_conversation(conversation_id, conversation_dict)
        
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
        
        topics = database_client.read_topics(conversation_id)
        
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


@app.post("/interact", response_model=QuizResponse)
async def generate_interactives(
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
        
        if not content or not content.strip():
            raise HTTPException(
                status_code=400,
                detail="No content found for the provided topics. Please try different topics."
            )

        print(f"🤖 Generating quiz with Gemini...")
        # Generate quiz using Gemini
        quiz_json = await gemini_client.generate_quiz(content, COMPREHENSIVE_QUIZ_PROMPT)
        print(f"✅ Quiz generated successfully!")
        
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
        
        if not content or not content.strip():
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
        
        if not content or not content.strip():
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
        
        if not content or not content.strip():
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