from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.chat import ChatRequest, ChatResponse
from ..services.ai_service import answer_college_query

router = APIRouter(prefix="/ai", tags=["AI College Assistant"])

@router.post("/chat", response_model=ChatResponse)
def ai_chat(req: ChatRequest, db: Session = Depends(get_db)):
    return answer_college_query(req.message, db)
