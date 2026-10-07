from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    overall_rating = Column(Numeric(2, 1), nullable=False) # 1.0 to 5.0
    academics_rating = Column(Numeric(2, 1), default=4.0)
    faculty_rating = Column(Numeric(2, 1), default=4.0)
    infrastructure_rating = Column(Numeric(2, 1), default=4.0)
    placement_rating = Column(Numeric(2, 1), default=4.0)
    hostel_rating = Column(Numeric(2, 1), default=4.0)
    value_rating = Column(Numeric(2, 1), default=4.0)
    review_title = Column(String(200), nullable=True)
    review = Column(Text, nullable=False)
    status = Column(String(20), default="approved", nullable=False, index=True) # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    college = relationship("College", back_populates="ratings")
    user = relationship("User", back_populates="ratings")
