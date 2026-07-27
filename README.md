# GridAssist AI - Enterprise Prototype

GridAssist AI is an AI-powered complaint management platform designed for power utility companies. This project is developed as an internship prototype during an internship at **Sai Computers Limited**.

---

## Tech Stack

### Frontend
- **React (Vite)**
- **Tailwind CSS v4**
- **React Router**
- **Axios** (for API communication)
- **Lucide React** (for modern utility icons)

### Backend
- **FastAPI**
- **SQLAlchemy ORM**
- **SQLite**
- **Pydantic** (for schema definition)

---

## Project Structure

```
Sai_Computerts_Ltd_Project/
├── frontend/             # React Vite web application
│   ├── src/
│   │   ├── components/   # Reusable UI components (Footer)
│   │   ├── pages/        # Page screens (Splash, Login, Dashboard)
│   │   ├── App.jsx       # App router config
│   │   └── index.css     # CSS root importing Tailwind v4
│   └── package.json
├── backend/              # FastAPI application
│   ├── auth/             # Authentication module stub
│   ├── complaints/       # Complaints module stub
│   ├── analytics/        # Analytics module stub
│   ├── ai/               # AI module stub
│   ├── database.py       # SQLite connection session maker
│   └── main.py           # FastAPI endpoints
├── database/             # SQLite storage folder (holds gridassist.db)
├── assets/               # Folder for static images/assets
└── docs/                 # Documentation folder
```

---

## Setup & Running Locally

Ensure you have **Node.js** and **Python 3** installed.

### 1. Backend Setup
Navigate into the `backend/` directory and install Python dependencies:
```bash
cd backend
pip install fastapi uvicorn sqlalchemy pydantic
```

Run the FastAPI development server:
```bash
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
The API documentation will be available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup
Navigate into the `frontend/` directory and install packages:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The application will run locally at `http://localhost:5173`.

---

## API Endpoints

- `GET /` — Welcome endpoint containing project metadata.
- `GET /health` — Verifies application health and checks active SQLite connectivity.
- `GET /dashboard` — Serves current dashboard statistic metrics.
