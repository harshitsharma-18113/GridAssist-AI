from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="staff")

class Engineer(Base):
    __tablename__ = "engineers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    mobile = Column(String, nullable=False)
    department = Column(String, nullable=False)
    status = Column(String, default="Active")
    email = Column(String, unique=True, index=True, nullable=True)
    password = Column(String, nullable=True)
    
    assignments = relationship("ComplaintAssignment", back_populates="engineer")

class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(String, unique=True, index=True, nullable=False)
    consumer_name = Column(String, nullable=False)
    consumer_number = Column(String, nullable=False)
    mobile_number = Column(String, nullable=False)
    location = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False)
    priority = Column(String, default="Medium")
    status = Column(String, default="Pending")
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # AI prediction attributes
    predicted_category = Column(String, nullable=True)
    predicted_priority = Column(String, nullable=True)
    prediction_confidence = Column(Float, nullable=True)
    detected_keywords = Column(String, nullable=True)
    prediction_reason = Column(String, nullable=True)
    est_resolution_time = Column(String, nullable=True)
    rec_department = Column(String, nullable=True)
    rec_action = Column(String, nullable=True)
    severity_score = Column(Integer, nullable=True)
    
    assignments = relationship("ComplaintAssignment", back_populates="complaint", cascade="all, delete-orphan")

class ComplaintAssignment(Base):
    __tablename__ = "complaint_assignments"
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    engineer_id = Column(Integer, ForeignKey("engineers.id"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    remarks = Column(String, nullable=True)

    complaint = relationship("Complaint", back_populates="assignments")
    engineer = relationship("Engineer", back_populates="assignments")

class Consumer(Base):
    __tablename__ = "consumers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    consumer_number = Column(String, unique=True, index=True, nullable=False)
    mobile = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, default="info") # info, warning, success
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class EngineerUpdate(Base):
    __tablename__ = "engineer_updates"
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    engineer_id = Column(Integer, ForeignKey("engineers.id"), nullable=False)
    status = Column(String, nullable=False)
    remarks = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class StatusHistory(Base):
    __tablename__ = "status_history"
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    status = Column(String, nullable=False)
    changer_role = Column(String, nullable=False) # admin, consumer, engineer
    remarks = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
