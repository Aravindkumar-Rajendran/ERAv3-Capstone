# WhizardLM Interactive Learning Platform

An interactive educational platform that transforms user content into engaging learning experiences through multiple interactive formats including quizzes, timelines, mind maps, and flashcards.

## 🌟 Features

- **Interactive Quiz System**: Multiple question types (MCQ, True/False, Fill-in-the-Blanks, Matching)
- **Dynamic Content Generation**: Transform any content into interactive learning materials
- **Modern React Frontend**: Responsive UI with smooth animations and intuitive navigation
- **AI-Powered Backend**: Python-based agents for content processing and generation
- **Real-time Feedback**: Instant scoring and explanations for learning reinforcement

## 🏗️ Project Structure

```
ERAv3-Capstone/
├── .git/                    # Git version control
├── .gitignore               # Git ignore rules
├── README.md                # Project documentation
├── frontend/                # React application
└── backend/                 # Python backend services
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Python 3.8+
- Git

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# create a virtual environment
python -m venv venv

# activate the virtual environment
venv\Scripts\activate

# Install Python dependencies (when available)
pip install -r requirements.txt

# Run the backend services
python main.py
```


## 🛠️ Technologies Used

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router** - Navigation
- **CSS3** - Styling and animations

### Backend
- **Python** - Backend language
- **AI Agents** - Content processing and generation

## 📝 Development Status

- ✅ Frontend quiz system complete
- ✅ Interactive UI with animations
- ✅ JSON-based configuration
- ✅ TypeScript integration
- 🔄 Backend agents (in development)
- 🔄 Content generation pipeline



### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add your feature"

# Push to repository
git push origin feature/your-feature-name
```


## 🎯 Roadmap

- [ ] Complete backend agent implementation
- [ ] Add timeline and mind map components
- [ ] Implement flashcard system
- [ ] Add user authentication
- [ ] Deploy to production

---

**Built with ❤️ for interactive learning**
