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
    alternate_name = Column(String(150), nullable=True, index=True)
    slug = Column(String(255), unique=True, nullable=False)
    city = Column(String(100), default="Tumakuru", nullable=True, index=True)
    locality = Column(String(150), nullable=True)
    address = Column(String(350), nullable=False)
    pincode = Column(String(20), nullable=True)
    college_type = Column(String(80), default="Affiliated", nullable=False, index=True) # Autonomous, Affiliated, Constituent, Private University, Deemed University
    ownership = Column(String(60), default="Private", nullable=False, index=True) # Government, Government-aided, Private, University
    college_category = Column(String(120), default="Degree College", nullable=False, index=True) # Engineering and Technology, Arts, Science and Commerce, Management, BCA / Degree College
    affiliation = Column(String(200), nullable=True)
    university_name = Column(String(200), nullable=True)
    accreditation = Column(String(100), default="NAAC B", nullable=True)
    established_year = Column(Integer, nullable=True)
    website = Column(String(255), nullable=True)
    phone = Column(String(80), nullable=True)
    email = Column(String(150), nullable=True)
    latitude = Column(Numeric(10, 8), nullable=True)
    longitude = Column(Numeric(11, 8), nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    banner_url = Column(String(500), nullable=True)

    # Facility availability flags
    hostel_available = Column(Boolean, default=False, nullable=False)
    transport_available = Column(Boolean, default=False, nullable=False)
    library_available = Column(Boolean, default=True, nullable=False)
    placement_available = Column(Boolean, default=False, nullable=False)

    # Placement statistics
    average_package = Column(String(60), nullable=True) # e.g. "6.5 LPA" or "4.2 LPA"
    highest_package = Column(String(60), nullable=True) # e.g. "45.0 LPA" or "18.0 LPA"

    # Ratings & Reviews
    rating = Column(Numeric(3, 1), default=4.2, nullable=False)
    rating_source = Column(String(150), default="NAAC / State Assessment", nullable=True)
    review_count = Column(Integer, default=0, nullable=False)

    # Verification & Metadata
    data_source = Column(String(255), default="Official Portal / Affiliation Directory", nullable=True)
    verification_status = Column(String(50), default="Verified", nullable=False, index=True) # "Verified", "Pending verification", "Unverified"
    last_verified_date = Column(String(50), default="2024-2025", nullable=True)
    verified = Column(Boolean, default=True, nullable=False, index=True)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Convenient attribute aliases matching prompt
    @property
    def college_id(self):
        return self.id

    @property
    def college_name(self):
        return self.name

    @property
    def full_address(self):
        return self.address

    @property
    def official_website(self):
        return self.website

    @property
    def contact_number(self):
        return self.phone

    @property
    def official_email(self):
        return self.email

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
    course_name = Column(String(200), nullable=True)
    degree_level = Column(String(50), default="Undergraduate", nullable=False, index=True) # Diploma, Undergraduate, Postgraduate, Doctoral
    specialization = Column(String(150), nullable=True)
    duration_years = Column(Integer, default=3, nullable=True)
    annual_fees = Column(Numeric(12, 2), default=0.00, nullable=False, index=True)
    total_course_fee = Column(Numeric(12, 2), default=0.00, nullable=True)
    tuition_fee = Column(Numeric(12, 2), default=0.00, nullable=True)
    exam_fee = Column(Numeric(12, 2), default=0.00, nullable=True)
    other_charges = Column(Numeric(12, 2), default=0.00, nullable=True)
    fee_category = Column(String(100), default="General / Merit", nullable=True) # Government Quota, Management, Merit
    eligibility = Column(Text, nullable=True)
    admission_process = Column(Text, nullable=True)
    admission_details = Column(Text, nullable=True)
    entrance_exam = Column(String(100), nullable=True) # KCET, COMEDK, PGCET, KMAT, Direct / Merit
    intake_capacity = Column(Integer, default=60, nullable=True)
    seats = Column(Integer, default=60)
    duration = Column(String(50), nullable=True)
    course_availability_status = Column(String(50), default="Available", nullable=True)
    fee_academic_year = Column(String(30), default="2024-2025", nullable=True)
    academic_year = Column(String(20), default="2025-2026", nullable=False)
    course_source = Column(String(255), default="Official College Curriculum / Affiliation List", nullable=True)
    verification_status = Column(String(50), default="Verified", nullable=True)
    last_verified_date = Column(String(50), default="2024-2025", nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Aliases
    @property
    def annual_fee(self):
        return self.annual_fees

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
