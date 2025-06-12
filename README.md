# WhizardLM Interactive Learning Platform

An advanced AI-powered educational platform that transforms user content (text, PDFs, YouTube videos) into engaging interactive learning experiences through multiple formats including quizzes, timelines, mind maps, and flashcards.

## 🌟 Features

### 📝 Content Input Options
- **Text Input**: Direct text content submission
- **PDF Upload**: Extract and process PDF documents
- **YouTube Video URLs**: Automatic transcript extraction and processing
- **Multi-format Support**: Seamless content processing from various sources

### 🎯 Interactive Learning Components

#### 🧠 Quiz System
- **Multiple Choice Questions (MCQ)**: 4 options with intelligent scoring
- **True/False Questions**: Hint system with star animations
- **Fill-in-the-Blanks**: Advanced fuzzy matching validation
- **Matching Questions**: Interactive click-to-pair interface

#### ⏰ Timeline Generator
- **Historical Events**: Chronological visualization of content
- **Interactive Navigation**: Browse through events with rich descriptions
- **Era Support**: Group events into meaningful time periods
- **Rejection Handling**: Smart alternatives when content isn't timeline-suitable

#### 🗺️ Mind Maps
- **Hierarchical Visualization**: Concept relationships and connections
- **Interactive Exploration**: Expandable nodes and navigation
- **Connection Mapping**: Visual links between related concepts
- **Structured Learning**: Organized knowledge representation

#### 🃏 Flashcards
- **Flip-based Learning**: Interactive front/back card system
- **Difficulty Levels**: Easy, medium, hard categorization
- **Hint System**: Contextual learning assistance
- **Progress Tracking**: Navigate through card decks

### 🤖 AI-Powered Backend
- **Content Processing**: Intelligent text extraction and chunking
- **Topic Generation**: Automatic identification of key learning topics
- **Adaptive Generation**: Context-aware interactive content creation
- **Vector Storage**: Semantic search and retrieval using ChromaDB

## 🏗️ Project Structure

```
ERAv3-Capstone/
├── .git/                     # Git version control
├── .gitignore               # Git ignore rules  
├── README.md                # Project documentation
├── specs/                   # Component specifications
│   ├── quiz.md             # Quiz JSON format specs
│   ├── timeline.md         # Timeline component specs
│   ├── mindmap.md          # Mindmap component specs
│   └── flashcard.md        # Flashcard component specs
├── frontend/                # React TypeScript application
│   ├── public/
│   │   └── index.html      # Main HTML template
│   ├── src/
│   │   ├── components/     # Interactive components
│   │   │   ├── quiz/       # Quiz component variants
│   │   │   ├── timeline/   # Timeline visualization
│   │   │   ├── mindmap/    # Mind map interface
│   │   │   └── flashcard/  # Flashcard system
│   │   ├── pages/          # Page components
│   │   │   ├── WhizardPage.tsx     # Main learning interface
│   │   │   └── InteractivePage.tsx # Component playground
│   │   ├── types/          # TypeScript definitions
│   │   └── styles/         # CSS styling
│   ├── package.json        # Dependencies & scripts
│   └── tsconfig.json       # TypeScript configuration
└── backend/                # Python FastAPI backend
    ├── main.py             # FastAPI application entry point
    ├── config.py           # Application configuration
    ├── models.py           # Pydantic models
    ├── requirements.txt    # Python dependencies
    ├── chroma_db/          # Vector database storage
    ├── sqlite_db/          # Conversation & topics storage
    ├── prompts/            # AI prompt templates
    │   ├── quiz.py         # Quiz generation prompts
    │   ├── timeline.py     # Timeline generation prompts
    │   ├── mindmap.py      # Mindmap generation prompts
    │   └── flashcard.py    # Flashcard generation prompts
    ├── utils/              # Backend utilities
    │   ├── preprocessor.py # Content extraction & processing
    │   ├── vector_store.py # ChromaDB integration
    │   ├── gemini_client.py # Google Gemini API client
    │   └── database.py     # SQLite database operations
    └── bruno/              # API testing files
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** 3.11+ 
- **npm** or yarn
- **Git**
- **Google Gemini API Key** (for AI content generation)

### 🖥️ Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies  
npm install

# Start development server (runs on port 3001)
npm start
```

The frontend will be available at `http://localhost:3001`

### ⚙️ Backend Setup  

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
# Create .env file with your GEMINI_API_KEY

# Run the backend server (runs on port 8000)
python main.py
```

The backend API will be available at `http://localhost:8000`

## 🔄 Application Flow

### Basic Learning Workflow

```bash
# 1. Content Upload
User uploads content → [Text/PDF/YouTube URL] → Backend processes content

# 2. Content Processing  
Backend extracts text → Chunks content → Generates topics → Stores in vector DB

# 3. Interactive Generation
User selects topics → AI generates interactive content → Frontend renders component

# 4. Learning Experience
User interacts with → [Quiz/Timeline/Mindmap/Flashcard] → Receives feedback
```

### Detailed Process Flow

1. **Content Submission**
   - User provides text, uploads PDF, or enters YouTube URL
   - Backend validates and processes input using `preprocessor.py`
   - Content is extracted and cleaned

2. **Content Processing**
   - Text is chunked into manageable segments
   - AI generates relevant learning topics 
   - Content and topics stored in ChromaDB for semantic search

3. **Topic Selection**
   - User views generated topics
   - Selects specific topics for interactive content generation

4. **Interactive Content Generation**
   - AI creates format-specific content (quiz/timeline/mindmap/flashcard)
   - JSON response validated against component specifications
   - Frontend receives structured data

5. **Learning Experience**
   - User interacts with generated content
   - Real-time feedback and scoring
   - Progress tracking and completion handling

## 📚 Component Specifications

### Quiz System (4 Types)

#### Multiple Choice Questions (MCQ)
- 4 options (A-D) with single correct answer
- Intelligent scoring: 1.0 point (first attempt), 0.5 points (second attempt)
- Indirect hints on wrong answers

#### True/False Questions  
- Boolean answer with hint system
- Scoring: 1.0 point (no hint), 0.5 points (with hint)
- Star animations for correct answers

#### Fill-in-the-Blanks
- Advanced fuzzy matching validation
- Case-insensitive with flexible formatting
- Multiple acceptable answers support
- `[BLANK]` placeholder system

#### Matching Questions
- Interactive click-to-pair interface
- Fixed positioning with shuffled options
- Complete all pairs before submission
- Visual feedback for correct/incorrect matches

### Timeline Component
- Chronological event visualization
- Rich event descriptions with media support
- Era grouping and navigation
- Rejection handling for non-timeline content

### Mind Map Component  
- Hierarchical node structure with root and concept nodes
- Interactive expansion/collapse functionality
- Connection visualization between related concepts
- Node selection and detailed exploration

### Flashcard Component
- Flip-based front/back card system
- Difficulty-based categorization (easy/medium/hard)
- Hint system for learning assistance
- Deck navigation with progress tracking

## 🛠️ Technologies Used

### Frontend Stack
- **React 18** - Modern UI framework with hooks
- **TypeScript** - Type-safe development
- **React Router** - Client-side navigation
- **CSS3** - Custom styling with animations
- **Responsive Design** - Mobile-friendly interface

### Backend Stack  
- **Python 3.11** - Core backend language
- **FastAPI** - High-performance async web framework
- **Google Gemini AI** - Advanced content generation
- **ChromaDB** - Vector database for semantic search
- **SQLite** - Conversation and topic storage
- **YouTube Transcript API** - Video content extraction
- **PyPDF2** - PDF text extraction
- **CORS** - Cross-origin resource sharing

### Development Tools
- **Bruno** - API testing and documentation
- **Git** - Version control
- **npm** - Package management
- **pip** - Python package management

## 🎨 Customization

All interactive components support theme customization:

```json
{
  "theme": {
    "primaryColor": "#8B5CF6",
    "secondaryColor": "#3B82F6", 
    "backgroundColor": "#F8FAFC",
    "textColor": "#1F2937",
    "fontFamily": "Arial, sans-serif"
  }
}
```

Detailed specifications available in `/specs/` directory.

## 📝 Development Status

### ✅ Completed Features
- Complete quiz system with 4 question types
- Timeline visualization with era support
- Interactive mind map component
- Flashcard learning system
- PDF upload and processing
- YouTube URL transcript extraction
- Vector database integration
- Topic generation and selection
- Real-time AI content generation
- CORS configuration and error handling
- TypeScript integration throughout

### 🔄 Current Capabilities
- Multi-format content processing (text, PDF, YouTube)
- AI-powered interactive content generation
- Semantic search and content retrieval
- Conversation state management
- Component rejection handling
- Mobile-responsive design

## 🔧 Configuration

### Environment Variables
Create `.env` file in backend directory:
```
GEMINI_API_KEY=your_google_gemini_api_key_here
PORT=8000
```

### CORS Configuration
Backend configured to accept requests from:
- `http://localhost:3000`
- `http://localhost:3001` 
- `http://127.0.0.1:3000`
- `http://127.0.0.1:3001`

## 🤝 Contributing

This project is part of the ERAv3 Capstone program.

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: Add your feature description"

# Push to repository  
git push origin feature/your-feature-name
```

## 📄 License

This project is part of the ERAv3 Capstone program.

---

**Built with ❤️ for intelligent interactive learning**

Transform any content into engaging educational experiences with AI-powered interactive components.
