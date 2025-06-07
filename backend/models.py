from pydantic import BaseModel

class QuizRequest(BaseModel):
    content: str
    format_type: str = "quiz"

class QuizResponse(BaseModel):
    quiz_data: dict
    status: str
    message: str
