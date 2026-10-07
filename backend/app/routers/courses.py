from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Course
from ..schemas.course import CourseSchema

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.get("", response_model=List[CourseSchema])
def list_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).all()
    return courses
