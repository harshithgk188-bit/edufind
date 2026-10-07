from sqlalchemy import Column, Integer, String, Text, Boolean, Numeric, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

# Association Table for College & Facility Many-to-Many
college_facilities = Table(
    "college_facilities",
    Base.metadata,
    Column("college_id", Integer, ForeignKey("colleges.id", ondelete="CASCADE"), primary_key=True),
    Column("facility_id", Integer, ForeignKey("facilities.id", ondelete="CASCADE"), primary_key=True)
)

class Facility(Base):
    __tablename__ = "facilities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    icon = Column(String(50), default="check-circle")

    # Relationships
    colleges = relationship("College", secondary=college_facilities, back_populates="facilities")

class College(Base):
    __tablename__ = "colleges"

    id = Column(Integer, primary_key=True, index=True)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), index=True, nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    address = Column(String(300), nullable=False)
    college_type = Column(String(50), default="Private", nullable=False, index=True) # Government, Private, Autonomous, University
    established_year = Column(Integer, nullable=True)
    affiliation = Column(String(200), nullable=True)
    accreditation = Column(String(100), default="NAAC B", nullable=True)
    website = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(150), nullable=True)
    latitude = Column(Numeric(10, 8), nullable=True)
    longitude = Column(Numeric(11, 8), nullable=True)
    image_url = Column(String(500), nullable=True)
    banner_url = Column(String(500), nullable=True)
    verified = Column(Boolean, default=False, nullable=False, index=True)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    district = relationship("District", back_populates="colleges")
    courses = relationship("CollegeCourse", back_populates="college", cascade="all, delete-orphan")
    facilities = relationship("Facility", secondary=college_facilities, back_populates="colleges")
    ratings = relationship("Rating", back_populates="college", cascade="all, delete-orphan")
    placements = relationship("Placement", back_populates="college", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="college", cascade="all, delete-orphan")

class CollegeCourse(Base):
    __tablename__ = "college_courses"

    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    annual_fees = Column(Numeric(12, 2), default=0.00, nullable=False, index=True)
    tuition_fee = Column(Numeric(12, 2), default=0.00, nullable=True)
    exam_fee = Column(Numeric(12, 2), default=0.00, nullable=True)
    other_charges = Column(Numeric(12, 2), default=0.00, nullable=True)
    seats = Column(Integer, default=60)
    duration = Column(String(50), nullable=True)
    eligibility = Column(Text, nullable=True)
    admission_details = Column(Text, nullable=True)
    academic_year = Column(String(20), default="2025-2026", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    college = relationship("College", back_populates="courses")
    course = relationship("Course", back_populates="college_courses")

class Placement(Base):
    __tablename__ = "placements"

    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id", ondelete="CASCADE"), nullable=False, index=True)
    academic_year = Column(String(20), default="2024-2025", nullable=False)
    average_package = Column(Numeric(6, 2), nullable=True) # in LPA
    highest_package = Column(Numeric(6, 2), nullable=True) # in LPA
    placement_percentage = Column(Numeric(5, 2), nullable=True) # percentage e.g. 85.0
    recruiting_companies = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    college = relationship("College", back_populates="placements")
