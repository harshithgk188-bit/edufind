from .auth import UserRegister, UserLogin, UserResponse, TokenResponse
from .college import CollegeCardSchema, CollegeDetailResponse, CollegeCreateUpdate, FacilitySchema, CourseDetailSchema, PlacementSchema
from .course import CourseSchema, DistrictSchema
from .rating import RatingCreate, RatingResponse, RatingSummaryResponse
from .recommendation import RecommendationRequest, RecommendationResponse, RecommendedCollege
from .chat import ChatRequest, ChatResponse

__all__ = [
    "UserRegister", "UserLogin", "UserResponse", "TokenResponse",
    "CollegeCardSchema", "CollegeDetailResponse", "CollegeCreateUpdate",
    "FacilitySchema", "CourseDetailSchema", "PlacementSchema",
    "CourseSchema", "DistrictSchema",
    "RatingCreate", "RatingResponse", "RatingSummaryResponse",
    "RecommendationRequest", "RecommendationResponse", "RecommendedCollege",
    "ChatRequest", "ChatResponse"
]
