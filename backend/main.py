from typing import Optional, List
import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from models import QuizRequest, QuizResponse
from utils.gemini_client import GeminiClient
from prompts.quiz import COMPREHENSIVE_QUIZ_PROMPT
from utils.preprocessor import Chunker, Extractor
from utils.vector_store import Indexer, Retriever
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
            content.extend(await extractor.extract_transcripts_from_youtube(youtube_urls))

        if not content:
            raise HTTPException(
                status_code=400, 
                detail="No content provided. Please upload a PDF file, provide text, or YouTube URLs."
            )
        # Flatten content list
        # chunk and create topics
        chunks, topics = chunker.chunk_with_topics(content)

        # store chunks and topics in vector database
        conversation_id = indexer.get_conversation_id()
        indexer.create_index_with_topics(conversation_id, chunks, topics)

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


@app.post("/interact", response_model=QuizResponse)
async def generate_interactives(
    topics: Optional[List[str]] = Form(None),
    conversation_id: str = Form(..., description="Unique conversation identifier")
):
    """
    Generate a quiz based on text content or uploaded PDF file.
    The LLM will analyze the content and choose the best quiz subtype.
    """
    
    try:
        if not topics or len(topics) == 0:
            raise HTTPException(
                status_code=400, 
                detail="No topics provided. Please provide at least one topic."
            )
        
        retriever = Retriever(conversation_id=conversation_id)
        
        # retrieve content based on topics
        content = retriever.retrieve_content_with_topics(topics)

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


if __name__ == "__main__":
    # Validate config
    Config.validate_config()
    
    # Use port from config
    uvicorn.run(app, host="0.0.0.0", port=Config.PORT)