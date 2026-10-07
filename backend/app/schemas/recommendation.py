from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal

class RecommendationRequest(BaseModel):
    district_id: Optional[int] = None
    course_code: Optional[str] = None
    max_budget: Optional[float] = None
    min_rating: Optional[float] = 3.5
    hostel_required: Optional[bool] = False
    placement_importance: Optional[str] = "High" # High, Medium, Low
    college_type: Optional[str] = None # Government, Private, Autonomous, University, or Any

class RecommendedCollege(BaseModel):
    college_id: int
    name: str
    slug: str
    district_name: str
    college_type: str
    image_url: Optional[str]
    overall_rating: float
    course_name: str
    annual_fees: float
    match_score: int # e.g. 94%
    has_hostel: bool
    placement_package: Optional[float]
    reasoning: str

class RecommendationResponse(BaseModel):
    total_matches: int
    recommendations: List[RecommendedCollege]
