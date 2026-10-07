from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True)
    state = Column(String(100), default="Karnataka", nullable=False)
    district_name = Column(String(120), index=True, nullable=False)
    code = Column(String(10), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    colleges = relationship("College", back_populates="district", cascade="all, delete-orphan")
    searches = relationship("Search", back_populates="district")
