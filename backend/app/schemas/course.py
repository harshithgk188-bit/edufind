from pydantic import BaseModel
from typing import Optional

class CourseSchema(BaseModel):
    id: int
    name: str
    short_code: str
    category: str
    duration: str
    general_eligibility: str

    class Config:
        from_attributes = True

class DistrictSchema(BaseModel):
    id: int
    state: str
    district_name: str
    code: Optional[str]
    college_count: Optional[int] = 0
    average_rating: Optional[float] = 0.0

    class Config:
        from_attributes = True
