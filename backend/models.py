from pydantic import BaseModel

class QuizRequest(BaseModel):
    content: str
    format_type: str = "quiz"

class QuizResponse(BaseModel):
    quiz_data: dict
    status: str
    message: str

class TimelineResponse(BaseModel):
    timeline_data: dict
    status: str
    message: str

class MindmapResponse(BaseModel):
    mindmap_data: dict
    status: str
    message: str

class FlashcardResponse(BaseModel):
    flashcard_data: dict
    status: str
    message: str
