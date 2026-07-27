import os
import json
import pickle
import random
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

# Dataset Generator for 300+ entries
def generate_dataset():
    categories = ["Power Outage", "Transformer Fault", "Billing Issue", "Voltage Fluctuation", "Meter Problem", "Street Light Fault"]
    priorities = {
        "Power Outage": "High",
        "Transformer Fault": "Critical",
        "Billing Issue": "Low",
        "Voltage Fluctuation": "Medium",
        "Meter Problem": "Medium",
        "Street Light Fault": "Low"
    }
    
    templates = {
        "Power Outage": [
            "Total power outage reported in {location}. No electricity since {time} hours.",
            "Complete blackout in our sector. Streetlights and houses have no power.",
            "Electricity supply went off suddenly after a small sound from the substation. Please restore it.",
            "No power supply in {location} for the last {time} hours. Please check the line fault.",
            "Frequent power cuts in {location} are disrupting work. Outage is lasting for hours.",
            "Phase failure in my house. Only half of the house has light, rest is blacked out."
        ],
        "Transformer Fault": [
            "Transformer sparking and making loud crackling noises near {location}.",
            "Loud blast heard and smoke coming out of the transformer pole.",
            "Transformer oil leakage observed. It is dripping continuously and presents a safety hazard.",
            "Fire observed in the overhead transformer box in {location}. Please isolate immediately.",
            "Transformer blowout occurred. The entire street is without power.",
            "Heavy smoke and burning smell coming from the local distribution transformer."
        ],
        "Billing Issue": [
            "Received abnormally high electricity bill of Rs {amount} which is triple my typical charge.",
            "Incorrect reading on my bill. The bill says {reading} units but my meter shows much less.",
            "Double billing error on my account. Payment made online is not credited.",
            "Tariff rate applied is incorrect. I am being charged commercial rates for a residential connection.",
            "Bill not received for the last two months, but now received a heavy penalty charge.",
            "Payment done via UPI failed to update on the portal but money was deducted."
        ],
        "Voltage Fluctuation": [
            "Extremely low voltage in {location}. Appliances like AC and fridge cannot start.",
            "Frequent voltage fluctuations are causing our LED lights to flicker continuously.",
            "High voltage spikes noticed. A bulb burst and television set is showing error.",
            "Dim lights in the entire building. The voltage is less than 110V.",
            "Voltage is fluctuating rapidly. Unstable power is harming our household appliances.",
            "Phase voltage mismatch. Voltage drops drastically when heavy load is turned on."
        ],
        "Meter Problem": [
            "Newly installed smart meter has a blank screen. Cannot verify consumption units.",
            "The meter disk is spinning extremely fast even when main switch is off.",
            "Meter cover is broken and terminals are exposed. Safety risk for children.",
            "Smart meter displaying error code {error} and connection status is red.",
            "Burning smell coming from the meter cabin in the basement.",
            "Meter is sparking when load is increased. Needs urgent check."
        ],
        "Street Light Fault": [
            "Street light in front of house #{house} is off for the last 5 days. Street is dark.",
            "Street lamp is flickering continuously, causing disturbance at night.",
            "The street light is on during the daytime, wasting public electricity.",
            "Street light pole is leaning dangerously and wires are dangling.",
            "Multiple street lights are non-functional on main road of {location}.",
            "Flickering sodium street light is making humming sound."
        ]
    }
    
    locations = [
        "Sector 62, Noida", "Indiranagar, Bangalore", "Ghatkopar, Mumbai", 
        "Civil Lines, Delhi", "Sector 12, Noida", "Dwarka, Delhi", 
        "Whitefield, Bangalore", "Salt Lake, Kolkata", "Adyar, Chennai",
        "Bandra, Mumbai", "Jubilee Hills, Hyderabad", "Kothrud, Pune"
    ]
    
    dataset = []
    
    for i in range(320):
        category = random.choice(categories)
        priority = priorities[category]
        
        # Add variation
        if priority == "High" and random.random() < 0.2:
            priority = "Critical"
        elif priority == "Medium" and random.random() < 0.2:
            priority = "High"
        elif priority == "Low" and random.random() < 0.1:
            priority = "Medium"
            
        location = random.choice(locations)
        time_val = random.randint(1, 10)
        amount = random.randint(4000, 25000)
        reading = random.randint(800, 2500)
        error_code = random.choice(["E-03", "Err-88", "COMM-FAIL"])
        house_num = random.randint(10, 200)
        
        template = random.choice(templates[category])
        text_content = template.format(
            location=location,
            time=time_val,
            amount=amount,
            reading=reading,
            error=error_code,
            house=house_num
        )
        
        title_words = text_content.split()[:4]
        title = " ".join(title_words).capitalize().replace(".", "").replace(",", "")
        
        dataset.append({
            "text": text_content,
            "category": category,
            "priority": priority,
            "title": title
        })
        
    return dataset

def extract_keywords(text):
    keywords = ["transformer", "spark", "outage", "blackout", "voltage", "billing", "meter", "billing", "charges", "leak", "smoke", "fire", "flicker", "dim", "blast", "wire", "pole", "payment"]
    text_lower = text.lower()
    detected = [kw for kw in keywords if kw in text_lower]
    return detected

def rule_based_predict(text):
    t = text.lower()
    category = "Power Outage"
    priority = "Medium"
    confidence = 0.70
    
    if "transformer" in t or "blast" in t or "smoke" in t or "oil leak" in t:
        category = "Transformer Fault"
        priority = "Critical"
        confidence = 0.92
    elif "bill" in t or "charge" in t or "payment" in t or "tariff" in t:
        category = "Billing Issue"
        priority = "Low"
        confidence = 0.88
    elif "voltage" in t or "fluctuation" in t or "dim" in t:
        category = "Voltage Fluctuation"
        priority = "Medium"
        confidence = 0.85
    elif "meter" in t or "dial" in t or "smart meter" in t:
        category = "Meter Problem"
        priority = "Medium"
        confidence = 0.89
    elif "street light" in t or "streetlamp" in t or "sodium" in t:
        category = "Street Light Fault"
        priority = "Low"
        confidence = 0.90
    elif "outage" in t or "blackout" in t or "no electricity" in t or "no power" in t:
        category = "Power Outage"
        priority = "High"
        confidence = 0.91
        
    return category, priority, confidence

class ComplaintClassifier:
    def __init__(self):
        self.category_model = None
        self.priority_model = None
        self.is_trained = False
        
        self.model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model.pkl")
        self.dataset_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dataset.json")
        
    def load_or_train(self):
        # Generate dataset if not present
        if not os.path.exists(self.dataset_path):
            os.makedirs(os.path.dirname(self.dataset_path), exist_ok=True)
            data = generate_dataset()
            with open(self.dataset_path, "w") as f:
                json.dump(data, f, indent=2)
                
        # Try to load model
        if os.path.exists(self.model_path):
            try:
                with open(self.model_path, "rb") as f:
                    saved = pickle.load(f)
                    self.category_model = saved["category_model"]
                    self.priority_model = saved["priority_model"]
                    self.is_trained = True
                    return
            except Exception as e:
                print(f"Failed to load model: {e}, retraining...")
                
        self.train()
        
    def train(self):
        try:
            with open(self.dataset_path, "r") as f:
                data = json.load(f)
                
            texts = [item["text"] for item in data]
            categories = [item["category"] for item in data]
            priorities = [item["priority"] for item in data]
            
            # Category Pipeline
            cat_pipe = Pipeline([
                ('tfidf', TfidfVectorizer(max_features=1000, stop_words='english')),
                ('clf', LogisticRegression(C=1.0, max_iter=200))
            ])
            cat_pipe.fit(texts, categories)
            
            # Priority Pipeline
            prio_pipe = Pipeline([
                ('tfidf', TfidfVectorizer(max_features=1000, stop_words='english')),
                ('clf', LogisticRegression(C=1.0, max_iter=200))
            ])
            prio_pipe.fit(texts, priorities)
            
            self.category_model = cat_pipe
            self.priority_model = prio_pipe
            self.is_trained = True
            
            with open(self.model_path, "wb") as f:
                pickle.dump({
                    "category_model": cat_pipe,
                    "priority_model": prio_pipe
                }, f)
            print("AI Classifier trained successfully on 300+ sample complaints.")
                
        except Exception as e:
            print(f"Training failed, falling back to rules: {e}")
            self.is_trained = False
            
    def predict(self, title, description):
        text_content = f"{title} {description}"
        keywords = extract_keywords(text_content)
        
        if not self.is_trained or self.category_model is None:
            cat, prio, conf = rule_based_predict(text_content)
        else:
            try:
                # Predict Category
                cat_probs = self.category_model.predict_proba([text_content])[0]
                cat_idx = np.argmax(cat_probs)
                cat = self.category_model.classes_[cat_idx]
                cat_conf = cat_probs[cat_idx]
                
                # Predict Priority
                prio_probs = self.priority_model.predict_proba([text_content])[0]
                prio_idx = np.argmax(prio_probs)
                prio = self.priority_model.classes_[prio_idx]
                prio_conf = prio_probs[prio_idx]
                
                conf = float((cat_conf + prio_conf) / 2)
            except Exception as e:
                print(f"ML prediction failed, using rule-based fallback: {e}")
                cat, prio, conf = rule_based_predict(text_content)
                
        # Severity score
        prio_map = {"Critical": 92, "High": 78, "Medium": 52, "Low": 25}
        severity_base = prio_map.get(prio, 50)
        severity_score = int(severity_base + random.randint(-5, 5))
        severity_score = max(10, min(99, severity_score))
        
        # Dept
        dept_map = {
            "Power Outage": "Transmission & Grid Operations",
            "Transformer Fault": "Electrical Maintenance Team",
            "Billing Issue": "Accounts Department",
            "Voltage Fluctuation": "Grid Stability Division",
            "Meter Problem": "Smart Metering Division",
            "Street Light Fault": "Municipal Maintenance Team"
        }
        dept = dept_map.get(cat, "Electrical Maintenance Team")
        
        # Resolution Time
        time_map = {
            "Power Outage": "2 Hours",
            "Transformer Fault": "4 Hours",
            "Billing Issue": "24 Hours",
            "Voltage Fluctuation": "3 Hours",
            "Meter Problem": "12 Hours",
            "Street Light Fault": "8 Hours"
        }
        res_time = time_map.get(cat, "6 Hours")
        
        # Reason
        reason = f"Classification based on detected feature terms ({', '.join(keywords) if keywords else 'contextual patterns'})."
        if "transformer" in keywords:
            reason = "High-risk transformer related keywords detected indicating hardware anomaly."
        elif "voltage" in keywords or "fluctuation" in keywords:
            reason = "Voltage pattern variance features detected in grid feedback description."
            
        action = f"Alert nearest {dept} dispatcher and initiate contact protocols."
        if prio == "Critical":
            action = f"Dispatch {dept} immediately. Alert safety controllers."
            
        return {
            "category": cat,
            "priority": prio,
            "confidence": round(conf * 100, 1),
            "keywords": keywords,
            "reason": reason,
            "estimated_resolution_time": res_time,
            "department": dept,
            "recommended_action": action,
            "severity_score": severity_score
        }
