from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.recommendation import RecommendationRequest, RecommendationResponse
from ..services.recommender import calculate_college_recommendations

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.post("", response_model=RecommendationResponse)
def get_recommendations(req: RecommendationRequest, db: Session = Depends(get_db)):
    return calculate_college_recommendations(req, db)
