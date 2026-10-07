from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    short_code = Column(String(50), unique=True, index=True, nullable=False)
    category = Column(String(100), index=True, nullable=False)
    duration = Column(String(50), nullable=False)
    general_eligibility = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    college_courses = relationship("CollegeCourse", back_populates="course", cascade="all, delete-orphan")
    searches = relationship("Search", back_populates="course")
