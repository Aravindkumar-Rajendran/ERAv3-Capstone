# WhizardLM Interactive Learning Platform

An advanced AI-powered educational platform that transforms user content (text, PDFs, YouTube videos) into engaging interactive learning experiences through multiple formats including quizzes, timelines, mind maps, and flashcards, powered by intelligent Socratic-style tutoring.

## 🌐 Live Demo & Resources

- **Live App**: [https://whizardlm.vercel.app/](https://whizardlm.vercel.app/)
- **Demo Video**: [WhizardLM Demo Video](https://youtu.be/GchGbdqR_RM?si=lP8JJBZ2Gunfpqb7)

## 🌟 Features

### 📝 Content Processing
- Text input
- PDF upload
- YouTube URL transcript processing
- Multi-format content support

### 🎓 Socratic Learning Method
- Guided discovery through thoughtful questions
- Progressive learning with hints and encouragement
- Efficient 2-3 exchange topic completion
- Natural, conversational dialogue
- Complete understanding verification

### 🎯 Interactive Learning Components
- **Quiz System**: MCQ, True/False, Fill-in-Blanks, Matching
- **Timeline**: Chronological visualization with rich descriptions
- **Mind Maps**: Hierarchical concept relationships
- **Flashcards**: Flip-based learning with difficulty levels

## 🚀 Setup & Deployment

### Prerequisites
- Node.js (v16+)
- Python 3.11+
- Git

### Required API Keys
1. **Firebase Configuration**
   - Create project at [Firebase Console](https://console.firebase.google.com/)
   - Get frontend config
   - Download service account JSON

2. **Google Gemini API Key**
   - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Frontend Setup

1. **Environment Variables** (frontend/.env)
```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id

# API Configuration
REACT_APP_API_URL=http://localhost:8000
```

2. **Local Development**
```bash
cd frontend
npm install
npm start
```

3. **Vercel Deployment**
- Connect repository to Vercel
- Configure environment variables
- Deploy

### Backend Setup

1. **Environment Files**
- Place `firebase-service-account.json` in `backend/`
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "your-private-key",
  "client_email": "your-client-email",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "your-cert-url"
}
```

- Create `backend/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8000
```

2. **Local Development**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python main.py
```

3. **EC2 Deployment**
```bash
# Install dependencies
sudo apt update
sudo apt install git python3-pip
pip install uv

# Setup project
git clone <repository-url>
cd ERAv3-Capstone/backend

# Copy configuration files
scp -i /path/to/key.pem .env ubuntu@ec2-ip:/ERAv3-Capstone/backend/
scp -i /path/to/key.pem firebase-service-account.json ubuntu@ec2-ip:/ERAv3-Capstone/backend/

# Setup Gunicorn
gunicorn main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Session Management
tmux attach -t server    # Attach to existing session
tmux session -s server   # Create new session

# HTTPS Setup
sudo certbot --nginx -d whizard.xyz
```

### CORS Configuration
Update `backend/main.py` with your domains:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-domain.com",
        "http://your-ip:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### PWA Features
- Add to home screen
- Native app-like experience
- Service worker for caching

## 🔄 Application Flow

1. **Content Upload & Processing**
   - User uploads content (Text/PDF/URLs)
   - Backend processes and chunks content
   - AI generates topics

2. **Interactive Learning**
   - User selects topics
   - AI generates interactive content
   - Frontend renders components

3. **Socratic Learning**
   - User posts query
   - AI guides with thoughtful questions
   - User discovers through reasoning
   - AI confirms and explains

## 🛠️ Technologies

### Frontend
- React 18
- TypeScript
- PWA capabilities
- Vercel hosting

### Backend
- Python 3.11
- FastAPI
- Google Gemini AI
- ChromaDB
- SQLite
- EC2 hosting


### 📄 License
This project is part of the ERAv3 Capstone program.

### 👥 Team
- [Aravindkumar Rajendran](https://github.com/Aravindkumar-Rajendran) 
- [Rakavi RP](https://github.com/Rakavi-RP)

**Built with ❤️ for intelligent interactive learning**

Transform any content into engaging educational experiences with AI-powered interactive components.
