# WhizardLM Interactive Learning Platform - Backend

## 🎯 Project Overview

WhizardLM is an AI-powered educational platform that transforms learning content (PDFs, text, YouTube videos) into interactive learning experiences using **Socratic method** for intelligent tutoring.

## 🔥 Features

### ✅ **Authentication & Sessions**
- **Google OAuth** via Firebase authentication
- **JWT-based sessions** - Each login creates a Firebase JWT token that expires in 1 hour
- **Session = JWT Token** - Users authenticate once, backend validates token on every request
- **User isolation** - All data filtered by user_id from JWT token
- **Multi-user support** - Each user has separate sessions and sees only their own data

### ✅ **Socratic Method AI Tutoring**
- **Intelligent questioning** that guides students to discover answers
- **Adaptive responses** based on question type
- **Progressive learning** with encouragement and support
- **Natural conversation flow** without mechanical prompts

### ✅ **Interactive Content Generation**
- **Quiz Generation** - Multiple choice, true/false, fill blanks, matching
- **Timeline Creation** - Visual chronological events
- **Mind Map Generation** - Concept relationship mapping
- **Flashcard Creation** - Key term memorization

### ✅ **Database Architecture**
- **Authentication:** Firebase (JWT token validation only)
- **Data Storage:** SQLite database (users, conversations, messages, interactive content)
- **Vector Storage:** ChromaDB (content embeddings for semantic search)
- **User Management:** User profiles stored in SQLite, authenticated via Firebase JWT

## 🚀 Setup Instructions

### **1. Prerequisites**
```bash
Python 3.8+
Git
```

### **2. Clone Repository**
```bash
git clone <repository-url>
cd backend
```

### **3. Virtual Environment Setup**
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### **4. Install Dependencies**
```bash
# Install Firebase dependencies first (required for authentication)
pip install firebase-admin python-jose[cryptography]

# Install all requirements
pip install -r requirements.txt
```

### **5. Environment Configuration**
Create `.env` file in backend directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### **6. Firebase Setup**
Make sure you have `firebase-service-account.json` file in the `backend/` directory.
This file contains your Firebase project credentials for authentication.

### **7. Run the Application**
```bash
# Option 1: Using uvicorn (recommended for development)
uvicorn main:app --reload --port 8000

# Option 2: Using Python directly
python main.py
```

### **8. Test Authentication**
1. Open browser to `http://localhost:8000/test-auth`
2. Click "Login with Google" to test authentication
3. Copy the generated JWT token for API testing

### **9. API Testing with Bruno**
1. Install Bruno API client from https://www.usebruno.com/
2. Open Bruno and import the collection: `backend/bruno/WhiZardLM/`
3. Go to Environments → "Local Test" 
4. Paste your JWT token in the `auth_token` field
5. Now you can test all API endpoints with authentication

*Note: Database tables are created automatically when the app starts*

## 📚 API Endpoints

### **Authentication**
- `GET /test-auth` - Google login page for getting JWT tokens
- `POST /auth/verify` - Verify JWT token validity
- `GET /auth/me` - Get current user profile

### **Content Management**
- `POST /upload` - Upload PDFs, text, or YouTube URLs for processing
- `GET /topics/{conversation_id}` - Get generated topics from uploaded content
- `GET /conversations/{conversation_id}` - Get chat history for a conversation
- `GET /interactive-history/{conversation_id}` - Get all interactive content history

### **Interactive Learning Generation**
- `POST /interact` - Generate interactive quiz from topics
- `POST /interact-timeline` - Generate timeline visualization
- `POST /interact-mindmap` - Generate mind map structure
- `POST /interact-flashcard` - Generate flashcards for memorization

### **Socratic Method Chat**
- `POST /chat` - Intelligent tutoring chat using Socratic method

## 🧪 API Testing

### **Step-by-Step Bruno Testing:**
1. **Get Authentication Token:**
   - Open `http://localhost:8000/test-auth`
   - Login with Google and copy the JWT token

2. **Setup Bruno Environment:**
   - Open Bruno and import `backend/bruno/WhiZardLM/` collection
   - Go to Environments → "Local Test"
   - Paste your JWT token in the `auth_token` field

3. **Run Tests in Sequence:**
   - `Health.bru` - Test basic connectivity
   - `Upload.bru` - Upload a PDF or text content
   - `Topics.bru` - Generate topics from uploaded content
   - `Chat.bru` - Test Socratic method chat
   - `Interact.bru` - Generate quiz content
   - `InteractFlashcard.bru` - Generate flashcards
   - `InteractMindmap.bru` - Generate mind maps
   - `InteractTimeline.bru` - Generate timelines
   - `ConversationHistory.bru` - View chat history
   - `InteractiveHistory.bru` - View all interactive content

### **Manual Testing Flow (Alternative)**
1. Get JWT token from `/test-auth`
2. Upload content via `/upload`
3. Generate topics via `/topics/{conversation_id}`
4. Test chat via `/chat`
5. Generate interactive content via `/interact*` endpoints

## 🔒 How Sessions Work

### **Session Flow:**
1. **User Login:** User clicks Google login → Gets Firebase JWT token
2. **API Requests:** Frontend sends JWT token in Authorization header
3. **Backend Validation:** Every API call validates JWT token with Firebase
4. **User Isolation:** Backend extracts user_id from token, filters all data by user_id
5. **Auto-Logout:** JWT tokens expire after 1 hour, user must login again

### **Security Features:**
- JWT token validation on every API request
- User data isolation at database level
- Firebase credentials secured (never commit service account JSON to Git)
- Automatic token expiration (1 hour)

## 🗄️ Database Schema

### **Architecture:**
```
Authentication: Firebase (JWT token validation only)
Database: SQLite (all data storage)
Vector Store: ChromaDB (content embeddings)
```

### **SQLite Tables:**
- **Users:** user_id, email, name, timestamps
- **Conversations:** conversation_id, user_id, title, timestamps
- **Chat Messages:** message_id, conversation_id, user_id, content
- **Interactive Content:** content_id, conversation_id, content_type, JSON data
- **Topics:** conversation_id, user_id, topics_json

## 🚦 Production Notes

### **Current Setup:**
- Works for development and small-scale deployment
- SQLite handles thousands of users efficiently
- Can be deployed to cloud platforms as-is

### **Environment Variables for Production:**
```env
GEMINI_API_KEY=production_key
PORT=8000
```

## 🔧 Complete File Structure

```
backend/
├── main.py                     # FastAPI app with all routes
├── config.py                   # Configuration settings
├── models.py                   # Data models
├── requirements.txt            # Python dependencies
├── pyproject.toml              # Project configuration
├── uv.lock                     # Lock file for dependencies
├── setup.bat                   # Windows setup script
├── .python-version             # Python version specification
├── firebase-service-account.json # Firebase credentials (DO NOT COMMIT)
├── simple_test.html            # Google authentication test page
├── test_result.html            # Authentication result page
├── test_chapter.pdf            # Sample PDF for testing
├── 
├── utils/                      # Core utilities
│   ├── auth.py                 # Firebase JWT authentication
│   ├── database.py             # SQLite operations
│   ├── gemini_client.py        # AI client with Socratic method
│   ├── preprocessor.py         # Content processing
│   └── vector_store.py         # ChromaDB vector operations
├── 
├── prompts/                    # AI prompt templates
│   ├── chunk_n_topics.py       # Content chunking and topic extraction
│   ├── socratic_chat.py        # Socratic method prompts
│   ├── quiz.py                 # Quiz generation prompts
│   ├── flashcard.py            # Flashcard prompts
│   ├── mindmap.py              # Mind map prompts
│   └── timeline.py             # Timeline prompts
├── 
├── bruno/WhiZardLM/            # API testing collection
│   ├── bruno.json              # Bruno configuration
│   ├── Health.bru              # Health check endpoint
│   ├── Upload.bru              # Content upload testing
│   ├── Topics.bru              # Topic generation testing
│   ├── Chat.bru                # Chat functionality testing
│   ├── Interact.bru            # Quiz generation testing
│   ├── InteractFlashcard.bru   # Flashcard generation testing
│   ├── InteractMindmap.bru     # Mindmap generation testing
│   ├── InteractTimeline.bru    # Timeline generation testing
│   ├── ConversationHistory.bru # Chat history testing
│   ├── InteractiveHistory.bru  # Interactive content history testing
│   ├── DebugUserInfo.bru       # User debug information
│   └── environments/
│       └── Local Test.bru      # Environment variables (PUT JWT TOKEN HERE)
├── 
├── research/                   # Research and experiments
│   └── pdf_extraction_and_chunking/
│       ├── research.ipynb      # Jupyter notebook for PDF 
│       └── recursive_text_character_splitter.png # Diagram
├── 
├── sqlite_db/                  # SQLite database storage
│   └── whizardlm.db           # Main application database
├── 
├── chroma_db/                  # ChromaDB vector storage (auto-created)
├── env/                        # Virtual environment folder
└── __pycache__/               # Python cache files
```

## 🐛 Troubleshooting

### **Common Issues:**

**Firebase Authentication Error:**
```
"aud" (audience) claim mismatch
```
**Solution:** Make sure your `firebase-service-account.json` project ID matches the project ID in your HTML test files.

**Module Import Errors:**
```
ModuleNotFoundError: No module named 'cryptography'
```
**Solution:** Install Firebase dependencies first: `pip install firebase-admin python-jose[cryptography]`

**Database Connection Issues:**
- Check if `sqlite_db/` directory exists (created automatically)
- Ensure proper file permissions

### **Development Tips:**
- Use `--reload` flag with uvicorn for auto-restart during development
- Check browser console for Firebase authentication errors
- Use Bruno collection for systematic API testing
- JWT tokens expire after 1 hour - get new ones from `/test-auth` when needed
