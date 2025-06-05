# WizardLM Quiz Generator Backend

FastAPI backend service that generates interactive quizzes using Gemini 2.0 Flash AI.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend/coding_agent
pip install -r requirements.txt
```

### 2. Environment Setup

Create a `.env` file in this directory:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8000
```

### 3. Run the Server

```bash
python main.py
```

The API will be available at `http://localhost:8000`

## 📡 API Endpoints

### Generate Quiz
```http
POST /generate-quiz
Content-Type: multipart/form-data

# Form data options:
# Option 1: Text content
content: "Your text content here"

# Option 2: PDF file upload  
file: [PDF file]
```

**Response:**
```json
{
  "quiz_data": {
    "subtype": "MCQ",
    "theme": { ... },
    "title": "Generated Quiz",
    "questions": [ ... ]
  },
  "status": "success", 
  "message": "Quiz generated successfully"
}
```

### Health Check
```http
GET /health
```

## 🧠 How It Works

1. **Content Input**: User provides text or uploads PDF
2. **Text Extraction**: PDF content is extracted if needed
3. **AI Analysis**: Gemini 2.0 Flash analyzes content
4. **Format Selection**: AI chooses best quiz format:
   - **MCQ**: Multiple choice questions
   - **TrueFalse**: True/false statements  
   - **FillBlanks**: Fill-in-the-blank questions
   - **MatchFollowing**: Matching pairs
5. **Quiz Generation**: AI creates 10 questions with dark theme styling
6. **JSON Response**: Complete quiz JSON returned to frontend

## 🎨 Quiz Types Generated

### MCQ (Multiple Choice)
- 4 options per question
- 1 correct answer
- Explanations included
- Purple/blue dark theme

### True/False  
- Boolean statements
- Hints provided
- Explanations included
- Green dark theme

### Fill in the Blanks
- Missing word completion
- Multiple correct answers supported
- Hints available
- Orange/amber dark theme

### Match Following
- 5 pairs per question
- Category relationships
- Clear instructions
- Red dark theme

## 🔧 Configuration

Edit `config.py` to modify:
- File size limits
- Content length limits  
- CORS origins
- Quiz parameters

## 🐛 Troubleshooting

**Error: GEMINI_API_KEY not found**
- Make sure `.env` file exists with your API key

**Error: PDF extraction failed** 
- Ensure PDF contains extractable text
- Check file size (max 10MB)

**Error: Invalid JSON response**
- Content may be too short or unclear
- Try providing more detailed content

## 📝 Example Usage

```python
import requests

# Text content
response = requests.post(
    "http://localhost:8000/generate-quiz",
    data={"content": "Python is a programming language..."}
)

# PDF file
files = {"file": open("document.pdf", "rb")}
response = requests.post(
    "http://localhost:8000/generate-quiz", 
    files=files
) 