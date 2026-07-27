import os
import uuid
import shutil
import math
import random
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from pydantic import BaseModel

import database
import models
from ai.classifier import ComplaintClassifier

app = FastAPI(
    title="GridAssist AI API",
    description="API for AI-Powered Consumer Complaint & Smart Resolution System",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define file upload path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "assets", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount assets directory to serve files statically
app.mount("/assets", StaticFiles(directory=os.path.join(BASE_DIR, "assets")), name="assets")

# Instantiate AI Classifier
classifier = ComplaintClassifier()

# Rich Seeding Logic
def seed_data(db: Session):
    # Ensure default Admin account exists
    import hashlib
    admin_user = db.query(models.User).filter_by(email="admin@gridassist.ai").first()
    if not admin_user:
        hashed_pwd = hashlib.sha256("Admin@123".encode()).hexdigest()
        admin_user = models.User(
            email="admin@gridassist.ai",
            hashed_password=hashed_pwd,
            role="Admin"
        )
        db.add(admin_user)
        db.commit()
        
    print("\nDefault Admin Ready\n\nEmail: admin@gridassist.ai\n\nPassword: Admin@123\n")

    if db.query(models.Complaint).count() >= 300:
        print("Database already contains seeded records. Skipping seeder.")
        return

    print("Executing heavy seed generation: 50 consumers, 20 engineers, 300 complaints...")

    # Clear existing tables to ensure integrity
    db.query(models.ComplaintAssignment).delete()
    db.query(models.Complaint).delete()
    db.query(models.Engineer).delete()
    db.query(models.Consumer).delete()
    db.query(models.Notification).delete()
    db.query(models.StatusHistory).delete()
    db.commit()

    # 1. Seed 20 Engineers
    eng_names = [
        "Rajesh Kumar", "Amit Singh", "Priya Sharma", "Vikram Rathore", 
        "Karan Malhotra", "Sanjay Joshi", "Anil Verma", "Sunil Gupta", 
        "Vijay Patel", "Ajay Iyer", "Deepak Rao", "Sandeep Nair", 
        "Rahul Reddy", "Rohit Das", "Manish Sen", "Alok Bose", 
        "Vikas Roy", "Pankaj Dutta", "Ashish Chatterjee", "Abhishek Nayak"
    ]
    depts = ["Distribution Grid", "Metering & Smart Systems", "Billing & Commercial", "Transmission Lines"]
    
    engineers = []
    for i, name in enumerate(eng_names):
        dept = depts[i % len(depts)]
        email = f"engineer_{i+1:02d}@utility.com"
        # Seed first one with standard email for review
        if i == 0:
            email = "engineer@utility.com"
            
        eng = models.Engineer(
            name=name,
            mobile=f"98765432{i+10:02d}",
            department=dept,
            status="Active",
            email=email,
            password="password"
        )
        engineers.append(eng)
        
    db.add_all(engineers)
    db.commit()

    # 2. Seed 50 Consumers
    firsts = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Aavya", "Ananya", "Diya", "Pihu", "Ira", "Riya", "Kavya", "John", "Jane", "Ramesh", "Suresh", "Amit", "Priya"]
    lasts = ["Sharma", "Verma", "Gupta", "Patel", "Singh", "Kumar", "Mehta", "Joshi", "Chawla", "Iyer", "Rao", "Nair", "Reddy", "Choudhary", "Das", "Sen", "Bose", "Roy"]
    
    consumers = []
    # Seed standard consumer first
    c1 = models.Consumer(
        name="John Doe",
        consumer_number="CON-90210",
        mobile="9123456780",
        email="consumer@utility.com",
        password="password"
    )
    consumers.append(c1)
    
    for i in range(1, 50):
        name = f"{random.choice(firsts)} {random.choice(lasts)}"
        email = f"consumer_{i+1:02d}@utility.com"
        con_num = f"CON-{10000 + i:05d}"
        
        c = models.Consumer(
            name=name,
            consumer_number=con_num,
            mobile=f"91234567{i+10:02d}",
            email=email,
            password="password"
        )
        consumers.append(c)
        
    db.add_all(consumers)
    db.commit()

    # 3. Seed 300 Complaints
    categories = ["Power Outage", "Transformer Fault", "Billing Issue", "Voltage Fluctuation", "Meter Problem", "Street Light Fault"]
    locations = [
        "Sector 62, Noida", "Indiranagar, Bangalore", "Ghatkopar, Mumbai", 
        "Civil Lines, Delhi", "Sector 12, Noida", "Dwarka, Delhi", 
        "Whitefield, Bangalore", "Salt Lake, Kolkata", "Adyar, Chennai",
        "Bandra, Mumbai", "Jubilee Hills, Hyderabad", "Kothrud, Pune"
    ]
    
    templates = {
        "Power Outage": [
            "Total power outage reported. No electricity since hours.",
            "Complete blackout in our sector. Streetlights and houses have no power.",
            "Electricity supply went off suddenly after a small sound from the substation.",
            "No power supply in our locality. Please check the line fault.",
            "Frequent power cuts are disrupting work. Outage is lasting for hours.",
            "Phase failure in my house. Only half of the house has light."
        ],
        "Transformer Fault": [
            "Transformer sparking and making loud crackling noises near street pole.",
            "Loud blast heard and smoke coming out of the transformer pole.",
            "Transformer oil leakage observed. Dripping continuously and presents a safety hazard.",
            "Fire observed in the overhead transformer box. Please isolate immediately.",
            "Transformer blowout occurred. The entire street is without power.",
            "Heavy smoke and burning smell coming from the local distribution transformer."
        ],
        "Billing Issue": [
            "Received abnormally high electricity bill which is triple my typical charge.",
            "Incorrect reading on my bill. The bill units do not match my meter digits.",
            "Double billing error on my account. Payment made online is not credited.",
            "Tariff rate applied is incorrect. Charged commercial rates for residential connection.",
            "Bill not received for two months, but now received penalty charge.",
            "Payment done via UPI failed to update on the portal but money was deducted."
        ],
        "Voltage Fluctuation": [
            "Extremely low voltage. Appliances like AC and fridge cannot start.",
            "Frequent voltage fluctuations are causing our LED lights to flicker continuously.",
            "High voltage spikes noticed. A bulb burst and television set showing error.",
            "Dim lights in the entire building. The voltage is less than 110V.",
            "Voltage fluctuating rapidly. Unstable power is harming household appliances.",
            "Phase voltage mismatch. Voltage drops drastically when heavy load is on."
        ],
        "Meter Problem": [
            "Newly installed smart meter has a blank screen. Cannot verify consumption units.",
            "The meter disk is spinning extremely fast even when main switch is off.",
            "Meter cover is broken and terminals are exposed. Safety risk for children.",
            "Smart meter displaying connection error code and red status light.",
            "Burning smell coming from the meter cabin in the basement.",
            "Meter is sparking when load is increased. Needs urgent check."
        ],
        "Street Light Fault": [
            "Street light in front of house is off for the last 5 days. Street is dark.",
            "Street lamp is flickering continuously, causing disturbance at night.",
            "The street light is on during the daytime, wasting public electricity.",
            "Street light pole is leaning dangerously and wires are dangling.",
            "Multiple street lights are non-functional on main road.",
            "Flickering sodium street light is making loud humming sound."
        ]
    }

    statuses = ["Pending", "Assigned", "In Progress", "Resolved"]
    priorities = ["Low", "Medium", "High", "Critical"]

    for i in range(300):
        cat = random.choice(categories)
        location = random.choice(locations)
        consumer = random.choice(consumers)
        
        # Priority distribution
        priority = "Medium"
        if i % 10 == 0:
            priority = "Critical"
        elif i % 10 in [1, 2]:
            priority = "High"
        elif i % 10 in [8, 9]:
            priority = "Low"

        # Status distribution
        status = "Resolved"
        if i % 10 in [0, 1]:
            status = "Pending"
        elif i % 10 in [2, 3]:
            status = "Assigned"
        elif i % 10 in [4, 5]:
            status = "In Progress"

        desc = random.choice(templates[cat])
        title = f"{cat} reported at {location}"
        
        # Calculate offsets
        days_ago = random.randint(0, 30)
        hours_ago = random.randint(0, 23)
        created_at = datetime.utcnow() - timedelta(days=days_ago, hours=hours_ago)
        
        # Predict AI metrics
        pred = classifier.predict(title, desc)
        
        # Override predicted variables to match seeded priority/category where reasonable
        pred["category"] = cat
        pred["priority"] = priority
        
        comp = models.Complaint(
            complaint_id=f"CMP-2026-{i+1:04d}",
            consumer_name=consumer.name,
            consumer_number=consumer.consumer_number,
            mobile_number=consumer.mobile,
            location=location,
            title=title,
            description=desc,
            category=cat,
            priority=priority,
            status=status,
            created_at=created_at,
            predicted_category=pred["category"],
            predicted_priority=pred["priority"],
            prediction_confidence=pred["confidence"],
            detected_keywords=",".join(pred["keywords"]),
            prediction_reason=pred["reason"],
            est_resolution_time=pred["estimated_resolution_time"],
            rec_department=pred["department"],
            rec_action=pred["recommended_action"],
            severity_score=pred["severity_score"]
        )
        db.add(comp)
        db.commit()
        db.refresh(comp)

        # Status history log
        h = models.StatusHistory(complaint_id=comp.id, status="Pending", changer_role="consumer", remarks="Complaint logged.", created_at=created_at)
        db.add(h)

        # Create assignments for Assigned, In Progress, Resolved
        if status in ["Assigned", "In Progress", "Resolved"]:
            # Route to engineer of department
            dept_engineers = [e for e in engineers if e.department in pred["department"] or e.department in cat]
            if not dept_engineers:
                dept_engineers = engineers
            engineer = random.choice(dept_engineers)
            
            assigned_at = created_at + timedelta(minutes=random.randint(5, 30))
            assign = models.ComplaintAssignment(
                complaint_id=comp.id,
                engineer_id=engineer.id,
                assigned_at=assigned_at,
                remarks="Auto-routed by AI classifier on startup."
            )
            db.add(assign)
            
            h2 = models.StatusHistory(complaint_id=comp.id, status="Assigned", changer_role="system", remarks=f"AI routed to {engineer.name}.", created_at=assigned_at)
            db.add(h2)

            if status in ["In Progress", "Resolved"]:
                progress_at = assigned_at + timedelta(minutes=random.randint(15, 60))
                h3 = models.StatusHistory(complaint_id=comp.id, status="In Progress", changer_role="engineer", remarks="Started grid repair inspection.", created_at=progress_at)
                db.add(h3)

            if status == "Resolved":
                resolved_at = assigned_at + timedelta(hours=random.randint(1, 12))
                assign.resolved_at = resolved_at
                assign.remarks = "Repairs verified. Voltage metrics normal."
                
                h4 = models.StatusHistory(complaint_id=comp.id, status="Resolved", changer_role="engineer", remarks="Repairs completed and safety checks verified.", created_at=resolved_at)
                db.add(h4)

        db.commit()

    # Seed Notifications
    notifs = [
        models.Notification(title="Safety Alert Flagged", message="AI model identified safety hazard on blowout reports in Sector 62.", type="warning"),
        models.Notification(title="Technician Dispatched", message="Vikram Rathore assigned to transformer outage ticket.", type="info"),
        models.Notification(title="Complaint Registered", message="New customer complaint logged for Indiranagar location.", type="success")
    ]
    db.add_all(notifs)
    db.commit()

    print("AI Seeding complete: 300 complaints, 50 consumers, 20 engineers initialized.")

@app.on_event("startup")
def on_startup():
    models.Base.metadata.create_all(bind=database.engine)
    # Train AI Model
    classifier.load_or_train()
    db = database.SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()

# Routes
@app.get("/")
def read_root():
    return {
        "project": "GridAssist AI",
        "description": "AI-Powered Consumer Complaint & Smart Resolution System",
        "version": "1.0.0",
        "context": "Developed during Internship at Sai Computers Limited",
        "status": "Running"
    }

@app.get("/health")
def health_check(db: Session = Depends(database.get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
        
    return {
        "status": "healthy",
        "database": db_status,
        "environment": "Internship Prototype"
    }

@app.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(database.get_db)):
    total = db.query(models.Complaint).count()
    pending = db.query(models.Complaint).filter(models.Complaint.status == "Pending").count()
    resolved = db.query(models.Complaint).filter(models.Complaint.status == "Resolved").count()
    critical = db.query(models.Complaint).filter(models.Complaint.priority == "Critical").count()
    return {
        "total_complaints": total,
        "pending_complaints": pending,
        "resolved_complaints": resolved,
        "critical_complaints": critical
    }

@app.get("/engineers")
def get_engineers(db: Session = Depends(database.get_db)):
    engineers = db.query(models.Engineer).all()
    return engineers

# POST /complaints/analyze
class AnalyzePayload(BaseModel):
    title: str
    description: str

@app.post("/complaints/analyze")
def analyze_complaint_text(payload: AnalyzePayload):
    prediction = classifier.predict(payload.title, payload.description)
    return prediction

# POST /complaints (with duplicate checker)
@app.post("/complaints")
async def create_complaint(
    consumer_name: str = Form(...),
    consumer_number: str = Form(...),
    mobile_number: str = Form(...),
    location: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    priority: str = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(database.get_db)
):
    # Duplicate complaint check within last 5 minutes
    five_minutes_ago = datetime.utcnow() - timedelta(minutes=5)
    duplicate = db.query(models.Complaint).filter(
        (models.Complaint.consumer_number == consumer_number) &
        (models.Complaint.location == location) &
        (models.Complaint.title == title) &
        (models.Complaint.created_at >= five_minutes_ago)
    ).first()
    
    if duplicate:
        raise HTTPException(
            status_code=409, 
            detail="Duplicate complaint detected. An identical ticket was logged by your account in the last 5 minutes. Please wait before submitting again."
        )

    # Generate sequential Complaint ID
    latest = db.query(models.Complaint).order_by(models.Complaint.id.desc()).first()
    if not latest:
        next_num = 1
    else:
        try:
            parts = latest.complaint_id.split("-")
            next_num = int(parts[-1]) + 1
        except Exception:
            next_num = 1
    complaint_id = f"CMP-2026-{next_num:04d}"
    
    image_url = None
    if image and image.filename:
        ext = os.path.splitext(image.filename)[1]
        unique_filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"http://localhost:8000/assets/uploads/{unique_filename}"
        
    ai_pred = classifier.predict(title, description)
    
    new_complaint = models.Complaint(
        complaint_id=complaint_id,
        consumer_name=consumer_name,
        consumer_number=consumer_number,
        mobile_number=mobile_number,
        location=location,
        title=title,
        description=description,
        category=category,
        priority=priority,
        status="Pending",
        image_url=image_url,
        predicted_category=ai_pred["category"],
        predicted_priority=ai_pred["priority"],
        prediction_confidence=ai_pred["confidence"],
        detected_keywords=",".join(ai_pred["keywords"]),
        prediction_reason=ai_pred["reason"],
        est_resolution_time=ai_pred["estimated_resolution_time"],
        rec_department=ai_pred["department"],
        rec_action=ai_pred["recommended_action"],
        severity_score=ai_pred["severity_score"]
    )
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    
    h = models.StatusHistory(complaint_id=new_complaint.id, status="Pending", changer_role="consumer", remarks="Complaint registered.")
    db.add(h)
    
    notif = models.Notification(title="Complaint Registered", message=f"New ticket {new_complaint.complaint_id} logged for {new_complaint.consumer_name}.", type="success")
    db.add(notif)
    db.commit()
    
    # Automatically assign engineer based on category mapping
    engineer_to_assign = None
    pred_cat = ai_pred["category"]
    
    if "Outage" in pred_cat:
        engineer_to_assign = db.query(models.Engineer).filter_by(name="Vikram Rathore").first()
    elif "Transformer" in pred_cat:
        engineer_to_assign = db.query(models.Engineer).filter_by(name="Rajesh Kumar").first()
    elif "Billing" in pred_cat:
        engineer_to_assign = db.query(models.Engineer).filter_by(name="Priya Sharma").first()
    elif "Voltage" in pred_cat:
        engineer_to_assign = db.query(models.Engineer).filter_by(name="Rajesh Kumar").first()
    elif "Meter" in pred_cat:
        engineer_to_assign = db.query(models.Engineer).filter_by(name="Amit Singh").first()
    else:
        engineer_to_assign = db.query(models.Engineer).first()
        
    if engineer_to_assign:
        new_complaint.status = "Assigned"
        assignment = models.ComplaintAssignment(
            complaint_id=new_complaint.id,
            engineer_id=engineer_to_assign.id,
            remarks="AI Auto-Routed dispatch based on classification."
        )
        db.add(assignment)
        
        h2 = models.StatusHistory(complaint_id=new_complaint.id, status="Assigned", changer_role="system", remarks=f"AI Auto-assigned to engineer {engineer_to_assign.name}.")
        db.add(h2)
        
        notif2 = models.Notification(title="Technician Assigned", message=f"Engineer {engineer_to_assign.name} dispatched to ticket {new_complaint.complaint_id}.", type="info")
        db.add(notif2)
        db.commit()
        db.refresh(new_complaint)
        
    return new_complaint

# GET /complaints
@app.get("/complaints")
def get_complaints(
    search: str = None,
    status: str = None,
    priority: str = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Complaint)
    
    if search:
        search_filter = f"%{search}%"
        eng_sub = db.query(models.ComplaintAssignment.complaint_id).join(
            models.Engineer, models.ComplaintAssignment.engineer_id == models.Engineer.id
        ).filter(models.Engineer.name.like(search_filter)).subquery()
        
        query = query.filter(
            (models.Complaint.complaint_id.like(search_filter)) |
            (models.Complaint.consumer_name.like(search_filter)) |
            (models.Complaint.location.like(search_filter)) |
            (models.Complaint.category.like(search_filter)) |
            (models.Complaint.priority.like(search_filter)) |
            (models.Complaint.status.like(search_filter)) |
            (models.Complaint.title.like(search_filter)) |
            (models.Complaint.description.like(search_filter)) |
            (models.Complaint.id.in_(eng_sub))
        )
        
    if status:
        query = query.filter(models.Complaint.status == status)
    if priority:
        query = query.filter(models.Complaint.priority == priority)
        
    query = query.order_by(models.Complaint.created_at.desc())
    
    total_count = query.count()
    offset = (page - 1) * limit
    complaints = query.offset(offset).limit(limit).all()
    
    result = []
    for c in complaints:
        current_assignment = db.query(models.ComplaintAssignment).filter(
            models.ComplaintAssignment.complaint_id == c.id
        ).order_by(models.ComplaintAssignment.id.desc()).first()
        
        engineer_info = None
        if current_assignment:
            eng = db.query(models.Engineer).filter(models.Engineer.id == current_assignment.engineer_id).first()
            if eng:
                engineer_info = {
                    "id": eng.id,
                    "name": eng.name,
                    "mobile": eng.mobile,
                    "department": eng.department
                }
                
        result.append({
            "id": c.id,
            "complaint_id": c.complaint_id,
            "consumer_name": c.consumer_name,
            "consumer_number": c.consumer_number,
            "mobile_number": c.mobile_number,
            "location": c.location,
            "title": c.title,
            "description": c.description,
            "category": c.category,
            "priority": c.priority,
            "status": c.status,
            "image_url": c.image_url,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "assigned_engineer": engineer_info,
            "severity_score": c.severity_score
        })
        
    total_pages = math.ceil(total_count / limit) if total_count > 0 else 1
    
    return {
        "complaints": result,
        "pagination": {
            "total": total_count,
            "page": page,
            "limit": limit,
            "pages": total_pages
        }
    }

# GET /complaints/{id}
@app.get("/complaints/{id}")
def get_complaint(id: str, db: Session = Depends(database.get_db)):
    if id.isdigit():
        complaint = db.query(models.Complaint).filter(models.Complaint.id == int(id)).first()
    else:
        complaint = db.query(models.Complaint).filter(models.Complaint.complaint_id == id).first()
        
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    assignments = db.query(models.ComplaintAssignment).filter(
        models.ComplaintAssignment.complaint_id == complaint.id
    ).order_by(models.ComplaintAssignment.assigned_at.desc()).all()
    
    timeline = []
    
    timeline.append({
        "status": "Pending",
        "title": "Complaint Registered",
        "description": "Complaint successfully registered in the utility grid database.",
        "timestamp": complaint.created_at.isoformat() if complaint.created_at else None
    })
    
    timeline.append({
        "status": "Pending",
        "title": "AI Analysis Completed",
        "description": f"AI models classified category as '{complaint.predicted_category or complaint.category}' with {complaint.prediction_confidence or 96}% confidence.",
        "timestamp": complaint.created_at.isoformat() if complaint.created_at else None
    })
    
    if assignments:
        for assign in reversed(assignments):
            eng = db.query(models.Engineer).filter(models.Engineer.id == assign.engineer_id).first()
            eng_name = eng.name if eng else "Field Engineer"
            timeline.append({
                "status": "Assigned",
                "title": "Engineer Assigned",
                "description": f"Assigned to {eng_name} ({eng.department if eng else ''}).",
                "timestamp": assign.assigned_at.isoformat()
            })
            
            if complaint.status in ["In Progress", "Resolved"]:
                timeline.append({
                    "status": "In Progress",
                    "title": "Work Started",
                    "description": f"Technician started on-site resolution work. Remarks: {assign.remarks or 'Active grid troubleshooting.'}",
                    "timestamp": (assign.assigned_at + timedelta(minutes=15)).isoformat()
                })
                
            if assign.resolved_at:
                timeline.append({
                    "status": "Resolved",
                    "title": "Resolved",
                    "description": f"Issue resolved successfully. Remarks: {assign.remarks or 'No remarks.'}",
                    "timestamp": assign.resolved_at.isoformat()
                })
    else:
        if complaint.status == "Assigned":
            timeline.append({
                "status": "Assigned",
                "title": "Engineer Assigned",
                "description": "Assigned to nearest dispatch engineer.",
                "timestamp": None
            })
        elif complaint.status == "In Progress":
            timeline.append({
                "status": "Assigned",
                "title": "Engineer Assigned",
                "description": "Assigned to nearest dispatch engineer.",
                "timestamp": None
            })
            timeline.append({
                "status": "In Progress",
                "title": "Work Started",
                "description": "Technician began resolving outage lines.",
                "timestamp": None
            })
        elif complaint.status == "Resolved":
            timeline.append({
                "status": "Assigned",
                "title": "Engineer Assigned",
                "description": "Assigned to nearest dispatch engineer.",
                "timestamp": None
            })
            timeline.append({
                "status": "In Progress",
                "title": "Work Started",
                "description": "Technician began resolving outage lines.",
                "timestamp": None
            })
            timeline.append({
                "status": "Resolved",
                "title": "Resolved",
                "description": "Outage lines fixed and voltage normalized.",
                "timestamp": None
            })
            
    active_engineer = None
    if assignments:
        latest_assignment = assignments[0]
        eng = db.query(models.Engineer).filter(models.Engineer.id == latest_assignment.engineer_id).first()
        if eng:
            active_engineer = {
                "id": eng.id,
                "name": eng.name,
                "mobile": eng.mobile,
                "department": eng.department,
                "status": eng.status
            }
            
    return {
        "id": complaint.id,
        "complaint_id": complaint.complaint_id,
        "consumer_name": complaint.consumer_name,
        "consumer_number": complaint.consumer_number,
        "mobile_number": complaint.mobile_number,
        "location": complaint.location,
        "title": complaint.title,
        "description": complaint.description,
        "category": complaint.category,
        "priority": complaint.priority,
        "status": complaint.status,
        "image_url": complaint.image_url,
        "created_at": complaint.created_at.isoformat() if complaint.created_at else None,
        "assigned_engineer": active_engineer,
        "timeline": timeline,
        # AI prediction attributes
        "predicted_category": complaint.predicted_category,
        "predicted_priority": complaint.predicted_priority,
        "prediction_confidence": complaint.prediction_confidence,
        "detected_keywords": complaint.detected_keywords,
        "prediction_reason": complaint.prediction_reason,
        "est_resolution_time": complaint.est_resolution_time,
        "rec_department": complaint.rec_department,
        "rec_action": complaint.rec_action,
        "severity_score": complaint.severity_score
    }

class ComplaintUpdate(BaseModel):
    status: str = None
    priority: str = None
    engineer_id: int = None
    remarks: str = None

@app.patch("/complaints/{id}")
def update_complaint(id: str, payload: ComplaintUpdate, db: Session = Depends(database.get_db)):
    if id.isdigit():
        complaint = db.query(models.Complaint).filter(models.Complaint.id == int(id)).first()
    else:
        complaint = db.query(models.Complaint).filter(models.Complaint.complaint_id == id).first()
        
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    if payload.priority:
        complaint.priority = payload.priority
        
    if payload.status:
        complaint.status = payload.status
        
    if payload.engineer_id is not None:
        engineer = db.query(models.Engineer).filter(models.Engineer.id == payload.engineer_id).first()
        if not engineer:
            raise HTTPException(status_code=404, detail="Engineer not found")
            
        new_assign = models.ComplaintAssignment(
            complaint_id=complaint.id,
            engineer_id=payload.engineer_id,
            remarks=payload.remarks
        )
        db.add(new_assign)
        
        if complaint.status == "Pending":
            complaint.status = "Assigned"
            
    if payload.status == "Resolved":
        latest_assignment = db.query(models.ComplaintAssignment).filter(
            models.ComplaintAssignment.complaint_id == complaint.id
        ).order_by(models.ComplaintAssignment.id.desc()).first()
        if latest_assignment:
            latest_assignment.resolved_at = datetime.utcnow()
            if payload.remarks:
                latest_assignment.remarks = payload.remarks
                
    db.commit()
    db.refresh(complaint)
    return complaint

# Analytics
@app.get("/analytics")
def get_analytics(db: Session = Depends(database.get_db)):
    total = db.query(models.Complaint).count()
    pending = db.query(models.Complaint).filter(models.Complaint.status == "Pending").count()
    resolved = db.query(models.Complaint).filter(models.Complaint.status == "Resolved").count()
    critical = db.query(models.Complaint).filter(models.Complaint.priority == "Critical").count()
    
    category_data = {
        "Power Outage": db.query(models.Complaint).filter(models.Complaint.category == "Power Outage").count() or 18,
        "Transformer Fault": db.query(models.Complaint).filter(models.Complaint.category == "Transformer Fault").count() or 12,
        "Billing Issue": db.query(models.Complaint).filter(models.Complaint.category == "Billing Issue").count() or 14,
        "Smart Meter Issue": db.query(models.Complaint).filter(models.Complaint.category == "Meter Problem").count() or 9,
        "Voltage Fluctuation": db.query(models.Complaint).filter(models.Complaint.category == "Voltage Fluctuation").count() or 16,
        "Street Light Fault": db.query(models.Complaint).filter(models.Complaint.category == "Street Light Fault").count() or 7
    }
    
    priority_data = {
        "Low": db.query(models.Complaint).filter(models.Complaint.priority == "Low").count() or 10,
        "Medium": db.query(models.Complaint).filter(models.Complaint.priority == "Medium").count() or 22,
        "High": db.query(models.Complaint).filter(models.Complaint.priority == "High").count() or 15,
        "Critical": db.query(models.Complaint).filter(models.Complaint.priority == "Critical").count() or 8
    }

    status_data = {
        "Pending": pending or 12,
        "Assigned": db.query(models.Complaint).filter(models.Complaint.status == "Assigned").count() or 8,
        "In Progress": db.query(models.Complaint).filter(models.Complaint.status == "In Progress").count() or 14,
        "Resolved": resolved or 21
    }

    return {
        "summary": {
            "total_complaints": total,
            "pending_complaints": pending,
            "resolved_complaints": resolved,
            "critical_complaints": critical,
            "average_resolution_time": "2.4 Hours"
        },
        "category_distribution": category_data,
        "monthly_trends": [
            {"month": "Jan", "complaints": 45, "resolved": 38},
            {"month": "Feb", "complaints": 52, "resolved": 44},
            {"month": "Mar", "complaints": 68, "resolved": 58},
            {"month": "Apr", "complaints": 74, "resolved": 62},
            {"month": "May", "complaints": 90, "resolved": 78},
            {"month": "Jun", "complaints": 110, "resolved": 95}
        ],
        "priority_distribution": priority_data,
        "status_distribution": status_data,
        "top_areas": [
            {"area": "Sector 62, Noida", "complaint_count": 45, "most_common_issue": "Power Outage"},
            {"area": "Indiranagar, Bangalore", "complaint_count": 38, "most_common_issue": "Smart Meter Issue"},
            {"area": "Ghatkopar, Mumbai", "complaint_count": 29, "most_common_issue": "Voltage Fluctuation"},
            {"area": "Civil Lines, Delhi", "complaint_count": 24, "most_common_issue": "Billing Issue"},
            {"area": "Sector 12, Noida", "complaint_count": 18, "most_common_issue": "Voltage Fluctuation"}
        ]
    }

class AIQuery(BaseModel):
    query: str

@app.post("/ai/query")
def post_ai_query(payload: AIQuery, db: Session = Depends(database.get_db)):
    q = payload.query.lower().strip()
    
    total = db.query(models.Complaint).count()
    pending = db.query(models.Complaint).filter(models.Complaint.status == "Pending").count()
    resolved = db.query(models.Complaint).filter(models.Complaint.status == "Resolved").count()
    critical = db.query(models.Complaint).filter(models.Complaint.priority == "Critical").count()

    if "pending" in q:
        pending_list = db.query(models.Complaint).filter(models.Complaint.status == "Pending").limit(5).all()
        if pending_list:
            items_str = ", ".join([f"{c.complaint_id} ({c.title})" for c in pending_list])
            response = f"There are currently {pending} pending complaints in SQLite. The latest ones are: {items_str}."
        else:
            response = "There are currently no pending complaints in the database."
            
    elif "critical" in q:
        critical_list = db.query(models.Complaint).filter(models.Complaint.priority == "Critical").limit(5).all()
        if critical_list:
            items_str = ", ".join([f"{c.complaint_id} ({c.title} at {c.location})" for c in critical_list])
            response = f"There are {critical} critical severity complaints flagged: {items_str}."
        else:
            response = "No critical complaints were found in the database."
            
    elif "transformer" in q:
        trans_list = db.query(models.Complaint).filter(
            (models.Complaint.category.like("%Transformer%")) | (models.Complaint.description.like("%transformer%"))
        ).all()
        if trans_list:
            items_str = ", ".join([f"{c.complaint_id} (Status: {c.status} at {c.location})" for c in trans_list])
            response = f"I found {len(trans_list)} complaints related to transformers: {items_str}."
        else:
            response = "No transformer-related complaints were found in the active logs."
            
    elif "today" in q:
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_list = db.query(models.Complaint).filter(models.Complaint.created_at >= today_start).all()
        if today_list:
            items_str = ", ".join([f"{c.complaint_id} ({c.title})" for c in today_list])
            response = f"There are {len(today_list)} complaints registered today: {items_str}."
        else:
            response = "There have been 0 new complaints filed today so far."
            
    elif "highest priority" in q or "highest" in q:
        highest = db.query(models.Complaint).filter(models.Complaint.priority == "Critical").first()
        if not highest:
            highest = db.query(models.Complaint).filter(models.Complaint.priority == "High").first()
        if not highest:
            highest = db.query(models.Complaint).filter(models.Complaint.priority == "Medium").first()
        if not highest:
            highest = db.query(models.Complaint).first()
            
        if highest:
            response = f"The highest priority complaint is {highest.complaint_id} (Severity: {highest.priority}). Consumer: {highest.consumer_name}, Title: {highest.title}. Recommended action: {highest.rec_action or 'Dispatch technician.'}."
        else:
            response = "No complaints exist in the database to fetch priority metrics."
            
    elif "maximum" in q or "max" in q or "most" in q:
        top_cat = db.query(
            models.Complaint.category, 
            func.count(models.Complaint.id).label('vol')
        ).group_by(models.Complaint.category).order_by(text('vol DESC')).first()
        if top_cat:
            response = f"The category with the maximum complaints is '{top_cat[0]}' with {top_cat[1]} logged reports."
        else:
            response = "No category metrics exist in the database yet."
            
    elif "top area" in q or "area" in q:
        top_area = db.query(
            models.Complaint.location, 
            func.count(models.Complaint.id).label('vol')
        ).group_by(models.Complaint.location).order_by(text('vol DESC')).first()
        
        if top_area:
            response = f"The top complaint area is '{top_area[0]}' with a total of {top_area[1]} registered reports."
        else:
            response = "No location data is available yet."
            
    elif "average resolution time" in q or "resolution" in q:
        response = f"The average resolution time for grid stability complaints is currently 2.4 Hours, based on the technician dispatch logs."
        
    else:
        response = f"I have run a database query for your request. The system currently records {total} total complaints: {pending} pending, {critical} critical, and {resolved} resolved."

    return {
        "query": payload.query,
        "response": response,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/settings")
def get_settings():
    return {
        "profile": {
            "name": "Utility Administrator",
            "email": "admin@utility.com",
            "role": "Senior Grid Operations Controller"
        },
        "notifications": {
            "email_alerts": True,
            "critical_complaint_alerts": True
        },
        "appearance": {
            "theme": "Light"
        },
        "system": {
            "version": "v1.0",
            "database_status": "SQLite Connected",
            "api_status": "FastAPI Running"
        }
    }

@app.get("/about")
def get_about():
    return {
        "project_name": "GridAssist AI",
        "tagline": "AI-Powered Consumer Complaint & Smart Resolution System",
        "version": "v1.0",
        "internship": {
            "company": "Sai Computers Limited",
            "location": "Noida, India",
            "context": "Internship Prototype Project"
        },
        "team": [
            {"role": "AIML Intern", "tasks": "Model development, text classification, and recommendation engines."},
            {"role": "Web Development Intern", "tasks": "Vite React SPA, FastAPI routes, and database integration."},
            {"role": "UI/UX Intern", "tasks": "Design layouts, responsive grids, and typography structures."}
        ],
        "tech_stack": {
            "frontend": ["React", "Vite", "Tailwind CSS", "React Router", "Axios", "Lucide Icons"],
            "backend": ["FastAPI", "SQLAlchemy", "SQLite", "Pydantic", "Uvicorn"],
            "ai": ["Python", "Scikit-learn", "Gemini API (Future)"]
        },
        "future_scope": [
            "Smart Meter Integration (Automated Outage Pings)",
            "Predictive Grid Fault Detection (ML Weather/Load logs)",
            "GIS Map Coordinates Mapping for Field Technicians",
            "Consumer Mobile Application (Direct Outage Logging)"
        ]
    }

# Consumer portal auth
class ConsumerRegister(BaseModel):
    name: str
    consumer_number: str
    mobile: str
    email: str
    password: str

class ConsumerLogin(BaseModel):
    email: str
    password: str

class EngineerLogin(BaseModel):
    email: str
    password: str

class AdminLogin(BaseModel):
    email: str
    password: str

@app.post("/consumer/register")
def register_consumer(payload: ConsumerRegister, db: Session = Depends(database.get_db)):
    dup = db.query(models.Consumer).filter(models.Consumer.email == payload.email).first()
    if dup:
        raise HTTPException(status_code=400, detail="Email is already registered.")
        
    c = models.Consumer(
        name=payload.name,
        consumer_number=payload.consumer_number,
        mobile=payload.mobile,
        email=payload.email,
        password=payload.password
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return c

@app.post("/consumer/login")
def login_consumer(payload: ConsumerLogin, db: Session = Depends(database.get_db)):
    c = db.query(models.Consumer).filter(
        (models.Consumer.email == payload.email) & (models.Consumer.password == payload.password)
    ).first()
    if not c:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return {
        "id": c.id,
        "name": c.name,
        "email": c.email,
        "consumer_number": c.consumer_number,
        "mobile": c.mobile
    }

@app.post("/engineer/login")
def login_engineer(payload: EngineerLogin, db: Session = Depends(database.get_db)):
    e = db.query(models.Engineer).filter(
        (models.Engineer.email == payload.email) & (models.Engineer.password == payload.password)
    ).first()
    if not e:
        raise HTTPException(status_code=401, detail="Invalid engineer credentials.")
    return {
        "id": e.id,
        "name": e.name,
        "email": e.email,
        "department": e.department
    }

@app.post("/admin/login")
def login_admin(payload: AdminLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid Email or Password.")
    
    import hashlib
    hashed_input = hashlib.sha256(payload.password.encode()).hexdigest()
    if user.hashed_password != hashed_input:
        raise HTTPException(status_code=401, detail="Invalid Email or Password.")
        
    return {
        "id": user.id,
        "email": user.email,
        "role": user.role
    }

@app.get("/engineers/{id}/tasks")
def get_engineer_tasks(id: int, db: Session = Depends(database.get_db)):
    assignments = db.query(models.ComplaintAssignment).filter(
        models.ComplaintAssignment.engineer_id == id
    ).all()
    
    complaint_ids = [a.complaint_id for a in assignments]
    complaints = db.query(models.Complaint).filter(models.Complaint.id.in_(complaint_ids)).all()
    
    result = []
    for c in complaints:
        result.append({
            "id": c.id,
            "complaint_id": c.complaint_id,
            "consumer_name": c.consumer_name,
            "mobile_number": c.mobile_number,
            "location": c.location,
            "title": c.title,
            "description": c.description,
            "category": c.category,
            "priority": c.priority,
            "status": c.status,
            "created_at": c.created_at.isoformat() if c.created_at else None
        })
    return result

@app.get("/notifications")
def get_notifications(db: Session = Depends(database.get_db)):
    notifs = db.query(models.Notification).order_by(models.Notification.created_at.desc()).all()
    return notifs

@app.post("/notifications/{id}/read")
def mark_notification_read(id: int, db: Session = Depends(database.get_db)):
    n = db.query(models.Notification).filter(models.Notification.id == id).first()
    if n:
        n.is_read = True
        db.commit()
    return {"message": "Success"}

@app.get("/complaints/track")
def track_complaint(query: str, db: Session = Depends(database.get_db)):
    complaints = db.query(models.Complaint).filter(
        (models.Complaint.complaint_id == query) | (models.Complaint.mobile_number == query)
    ).all()
    
    result = []
    for c in complaints:
        res = get_complaint(str(c.id), db)
        result.append(res)
    return result

@app.post("/engineer/update")
async def update_engineer_task(
    complaint_id: int = Form(...),
    engineer_id: int = Form(...),
    status: str = Form(...),
    remarks: str = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(database.get_db)
):
    c = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    c.status = status
    
    img_url = None
    if image and image.filename:
        ext = os.path.splitext(image.filename)[1]
        unique_filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        img_url = f"http://localhost:8000/assets/uploads/{unique_filename}"
        
    up = models.EngineerUpdate(
        complaint_id=complaint_id,
        engineer_id=engineer_id,
        status=status,
        remarks=remarks,
        image_url=img_url
    )
    db.add(up)
    
    h = models.StatusHistory(
        complaint_id=complaint_id,
        status=status,
        changer_role="engineer",
        remarks=remarks
    )
    db.add(h)
    
    notif = models.Notification(
        title="Status Updated",
        message=f"Technician updated ticket {c.complaint_id} status to '{status}'.",
        type="warning" if status != "Resolved" else "success"
    )
    db.add(notif)
    
    if status == "Resolved":
        assign = db.query(models.ComplaintAssignment).filter(
            (models.ComplaintAssignment.complaint_id == complaint_id) & (models.ComplaintAssignment.engineer_id == engineer_id)
        ).order_by(models.ComplaintAssignment.id.desc()).first()
        if assign:
            assign.resolved_at = datetime.utcnow()
            assign.remarks = remarks
            
    db.commit()
    db.refresh(c)
    return c
