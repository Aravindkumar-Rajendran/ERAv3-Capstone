# WizardLM Interactive Learning Platform

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
├── .git/                     # Git version control
├── .gitignore               # Git ignore rules
├── README.md                # Project documentation
├── frontend/                # React application
│   ├── public/
│   │   └── index.html       # Main HTML template
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   │   ├── WizardPage.tsx
│   │   │   └── InteractivePage.tsx
│   │   ├── styles/          # CSS stylesheets
│   │   │   └── index.css
│   │   ├── types/           # TypeScript definitions
│   │   ├── App.tsx          # Main app component
│   │   └── index.tsx        # React entry point
│   ├── package.json         # Dependencies & scripts
│   ├── tsconfig.json        # TypeScript config
│   └── QUIZ_JSON_SPECIFICATION.md  # Quiz format docs
└── backend/                 # Python backend services
    ├── coding_agent/        # Code generation agent
    │   └── main.py
    ├── rag_agent/          # RAG processing agent
    │   └── main.py
    └── socratic_agent/     # Socratic learning agent
        └── main.py
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

# Install Python dependencies (when available)
pip install -r requirements.txt

# Run the backend services
python main.py
```

## 📚 Quiz System

The platform supports four types of interactive quizzes:

### 1. Multiple Choice Questions (MCQ)
- 4 options (A-D)
- Indirect hints on wrong answers
- Scoring: 1.0 point (first correct), 0.5 points (second attempt)

### 2. True/False Questions
- Hint button available before answering
- 0.5 points if hint is used, 1.0 point without hint
- Star animations for correct answers

### 3. Fill-in-the-Blanks
- Advanced validation with fuzzy matching
- Case-insensitive and flexible number formats
- Multiple acceptable answers support

### 4. Matching Questions
- Click-to-pair interface
- Fixed positioning with shuffled initial state
- Submit when all pairs are matched

## 🎨 Customization

Quiz themes and styling are controlled through JSON configuration:

```json
{
  "theme": {
    "primaryColor": "#8B5CF6",
    "secondaryColor": "#3B82F6",
    "backgroundColor": "#F8FAFC",
    "textColor": "#1F2937"
  }
}
```

See `QUIZ_JSON_SPECIFICATION.md` for complete format documentation.

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

## 🤝 Contributing

This project is part of the ERAv3 Capstone program. 

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

## 📄 License

This project is part of the ERAv3 Capstone program.

## 🎯 Roadmap

- [ ] Complete backend agent implementation
- [ ] Add timeline and mind map components
- [ ] Implement flashcard system
- [ ] Add user authentication
- [ ] Deploy to production

---

**Built with ❤️ for interactive learning**
