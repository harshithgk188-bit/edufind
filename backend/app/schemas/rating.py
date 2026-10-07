from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime

class RatingCreate(BaseModel):
    overall_rating: float = Field(..., ge=1.0, le=5.0)
    academics_rating: Optional[float] = Field(4.0, ge=1.0, le=5.0)
    faculty_rating: Optional[float] = Field(4.0, ge=1.0, le=5.0)
    infrastructure_rating: Optional[float] = Field(4.0, ge=1.0, le=5.0)
    placement_rating: Optional[float] = Field(4.0, ge=1.0, le=5.0)
    hostel_rating: Optional[float] = Field(4.0, ge=1.0, le=5.0)
    value_rating: Optional[float] = Field(4.0, ge=1.0, le=5.0)
    review_title: Optional[str] = None
    review: str

class RatingResponse(BaseModel):
    id: int
    college_id: int
    user_id: int
    user_name: str
    overall_rating: float
    academics_rating: float
    faculty_rating: float
    infrastructure_rating: float
    placement_rating: float
    hostel_rating: float
    value_rating: float
    review_title: Optional[str]
    review: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class RatingSummaryResponse(BaseModel):
    average_overall: float
    total_reviews: int
    distribution: Dict[int, int] # e.g. {5: 70, 4: 20, 3: 7, 2: 2, 1: 1}
    distribution_percentage: Dict[int, float]
    categories: Dict[str, float] # {academics: 4.5, faculty: 4.2, ...}
