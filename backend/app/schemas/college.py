from pydantic import BaseModel
from typing import Optional, List, Dict, Any
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
    degree_level: Optional[str] = "Undergraduate"
    specialization: Optional[str] = None
    duration_years: Optional[int] = 3
    annual_fees: Decimal
    total_course_fee: Optional[Decimal] = None
    tuition_fee: Optional[Decimal] = Decimal("0.00")
    exam_fee: Optional[Decimal] = Decimal("0.00")
    other_charges: Optional[Decimal] = Decimal("0.00")
    fee_category: Optional[str] = "General / Merit"
    seats: int
    duration: Optional[str]
    eligibility: Optional[str]
    admission_details: Optional[str]
    admission_process: Optional[str] = None
    entrance_exam: Optional[str] = None
    intake_capacity: Optional[int] = 60
    course_availability_status: Optional[str] = "Available"
    fee_academic_year: Optional[str] = "2024-2025"
    academic_year: str
    course_source: Optional[str] = None
    verification_status: Optional[str] = "Verified"
    last_verified_date: Optional[str] = None

    class Config:
        from_attributes = True

class PlacementSchema(BaseModel):
    id: int
    academic_year: str
    average_package: Optional[Decimal] = None
    highest_package: Optional[Decimal] = None
    placement_percentage: Optional[Decimal] = None
    recruiting_companies: Optional[str] = None

    class Config:
        from_attributes = True

class CollegeCardSchema(BaseModel):
    id: int
    college_id: Optional[int] = None
    name: str
    alternate_name: Optional[str] = None
    slug: str
    district_id: int
    district_name: str
    city: Optional[str] = "Tumakuru"
    locality: Optional[str] = None
    address: str
    pincode: Optional[str] = None
    college_type: str
    ownership: Optional[str] = "Private"
    college_category: Optional[str] = "Degree College"
    university_name: Optional[str] = None
    accreditation: Optional[str] = None
    image_url: Optional[str] = None
    verified: bool = True
    verification_status: Optional[str] = "Verified"
    last_updated: datetime
    last_verified_date: Optional[str] = None
    overall_rating: float
    rating_source: Optional[str] = "NAAC / State Assessment"
    review_count: int
    min_fees: Optional[Decimal] = None
    min_total_fee: Optional[Decimal] = None
    courses_offered: List[str]
    hostel_available: Optional[bool] = False
    transport_available: Optional[bool] = False
    library_available: Optional[bool] = True
    placement_available: Optional[bool] = False
    average_package: Optional[str] = None
    highest_package: Optional[str] = None

class PaginatedCollegesResponse(BaseModel):
    items: List[CollegeCardSchema]
    total: int
    page: int
    page_size: int
    total_pages: int

class CollegeDetailResponse(BaseModel):
    id: int
    college_id: Optional[int] = None
    district_id: int
    district_name: str
    state: str
    name: str
    alternate_name: Optional[str] = None
    slug: str
    city: Optional[str] = "Tumakuru"
    locality: Optional[str] = None
    description: Optional[str] = None
    address: str
    pincode: Optional[str] = None
    college_type: str
    ownership: Optional[str] = "Private"
    college_category: Optional[str] = "Degree College"
    established_year: Optional[int] = None
    affiliation: Optional[str] = None
    university_name: Optional[str] = None
    accreditation: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    banner_url: Optional[str] = None
    hostel_available: bool = False
    transport_available: bool = False
    library_available: bool = True
    placement_available: bool = False
    average_package: Optional[str] = None
    highest_package: Optional[str] = None
    overall_rating: float = 4.2
    rating_source: Optional[str] = "NAAC / State Assessment"
    review_count: int = 0
    data_source: Optional[str] = "Official Portal / Affiliation Directory"
    verification_status: str = "Verified"
    last_verified_date: Optional[str] = None
    verified: bool = True
    last_updated: datetime
    facilities: List[FacilitySchema] = []
    courses: List[CourseDetailSchema] = []
    placements: List[PlacementSchema] = []

class CollegeCreateUpdate(BaseModel):
    name: str
    alternate_name: Optional[str] = None
    district_id: int
    city: Optional[str] = None
    locality: Optional[str] = None
    address: str
    pincode: Optional[str] = None
    college_type: str = "Affiliated"
    ownership: str = "Private"
    college_category: str = "Degree College"
    established_year: Optional[int] = None
    affiliation: Optional[str] = None
    university_name: Optional[str] = None
    accreditation: Optional[str] = "NAAC B"
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    banner_url: Optional[str] = None
    hostel_available: Optional[bool] = False
    transport_available: Optional[bool] = False
    library_available: Optional[bool] = True
    placement_available: Optional[bool] = False
    average_package: Optional[str] = None
    highest_package: Optional[str] = None
    rating: Optional[float] = 4.0
    rating_source: Optional[str] = "NAAC / State Assessment"
    data_source: Optional[str] = "Manual Entry / Official Portal"
    verification_status: Optional[str] = "Verified"
    verified: Optional[bool] = True

class CourseCreateUpdate(BaseModel):
    course_id: Optional[int] = None
    course_name: str
    short_code: Optional[str] = None
    degree_level: str = "Undergraduate"
    specialization: Optional[str] = None
    duration_years: int = 3
    annual_fee: Decimal
    total_course_fee: Optional[Decimal] = None
    fee_category: Optional[str] = "General / Merit"
    eligibility: Optional[str] = None
    admission_process: Optional[str] = None
    entrance_exam: Optional[str] = None
    intake_capacity: Optional[int] = 60
    course_availability_status: Optional[str] = "Available"
    fee_academic_year: Optional[str] = "2024-2025"
    course_source: Optional[str] = "Official Affiliation Directory"
    verification_status: Optional[str] = "Verified"
