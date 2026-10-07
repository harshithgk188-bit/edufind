from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ChatMessage(BaseModel):
    role: str # user, assistant
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    reply: str
    grounded: bool
    data_source: Optional[str] = "EduFind Verified Knowledge Base"
    related_colleges: Optional[List[Dict[str, Any]]] = []
