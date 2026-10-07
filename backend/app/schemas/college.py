from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class FacilitySchema(BaseModel):
    id: int
    name: str
    icon: Optional[str] = "check-circle"

    class Config:
        from_attributes = True

class CourseDetailSchema(BaseModel):
    id: int
    course_id: int
    name: str
    short_code: str
    category: str
    annual_fees: Decimal
    tuition_fee: Optional[Decimal] = Decimal("0.00")
    exam_fee: Optional[Decimal] = Decimal("0.00")
    other_charges: Optional[Decimal] = Decimal("0.00")
    seats: int
    duration: Optional[str]
    eligibility: Optional[str]
    admission_details: Optional[str]
    academic_year: str

    class Config:
        from_attributes = True

class PlacementSchema(BaseModel):
    id: int
    academic_year: str
    average_package: Optional[Decimal]
    highest_package: Optional[Decimal]
    placement_percentage: Optional[Decimal]
    recruiting_companies: Optional[str]

    class Config:
        from_attributes = True

class CollegeCardSchema(BaseModel):
    id: int
    name: str
    slug: str
    district_id: int
    district_name: str
    address: str
    college_type: str
    accreditation: Optional[str]
    image_url: Optional[str]
    verified: bool
    last_updated: datetime
    overall_rating: float
    review_count: int
    min_fees: Optional[Decimal]
    courses_offered: List[str]

class CollegeDetailResponse(BaseModel):
    id: int
    district_id: int
    district_name: str
    state: str
    name: str
    slug: str
    description: Optional[str]
    address: str
    college_type: str
    established_year: Optional[int]
    affiliation: Optional[str]
    accreditation: Optional[str]
    website: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    image_url: Optional[str]
    banner_url: Optional[str]
    verified: bool
    last_updated: datetime
    overall_rating: float
    review_count: int
    facilities: List[FacilitySchema]
    courses: List[CourseDetailSchema]
    placements: List[PlacementSchema]

class CollegeCreateUpdate(BaseModel):
    name: str
    district_id: int
    description: Optional[str] = None
    address: str
    college_type: str = "Private"
    established_year: Optional[int] = None
    affiliation: Optional[str] = None
    accreditation: Optional[str] = "NAAC B"
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    banner_url: Optional[str] = None
    verified: Optional[bool] = False
