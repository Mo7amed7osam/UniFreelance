#!/usr/bin/env python3
"""
🌐 AI Interview System - Web Server
FastAPI server for the interview system
"""
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import interview engine
from interview.interview_engine import run_interview
from interview.database import sessions_store, answers_store, answers_lock

# Initialize FastAPI
app = FastAPI(
    title="AI Interview System",
    description="Technical interview system with voice input",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class InterviewStart(BaseModel):
    student_name: str
    topic: str = "Python"

class AnswerSubmit(BaseModel):
    session_id: str = None
    student_name: str = None
    answer: str

# ─── Health Check ───────────────────────────────────────────
@app.get("/health")
async def health_check():
    """System health check"""
    return {
        "status": "healthy",
        "timestamp": os.name,
        "components": {
            "interview": True,
            "database": True
        }
    }

# ─── Interview Management ─────────────────────────────────────
@app.post("/start")
async def start_interview(student_name: str, topic: str = "Python"):
    """Start new interview session"""
    try:
        import uuid
        session_id = str(uuid.uuid4())
        
        # Initialize session
        sessions_store[session_id] = {
            "session_id": session_id,
            "student_name": student_name,
            "status": "starting",
            "question": "",
            "level": "Easy",
            "question_num": 0,
            "topic": topic,
            "timestamp": "2024-01-01T00:00:00"
        }
        
        # Start interview in background
        import threading
        def run():
            try:
                run_interview(student_name=student_name, session_id=session_id, from_api=True, topic=topic)
            except Exception as e:
                print(f"Interview error: {e}")
                sessions_store[session_id]["status"] = "error"
        
        threading.Thread(target=run, daemon=True).start()
        
        return {
            "message": "Interview started successfully",
            "session_id": session_id,
            "topic": topic,
            "student_name": student_name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start interview: {str(e)}")

@app.get("/state/{session_id}")
async def get_session_state(session_id: str):
    """Get session state"""
    state = sessions_store.get(session_id)
    
    if not state:
        return {"status": "not_found", "data": None}
    
    return {
        "status": state.get("status"),
        "data": {
            "question": state.get("question"),
            "level": state.get("level"),
            "question_num": state.get("question_num"),
            "student_name": state.get("student_name"),
            "topic": state.get("topic")
        }
    }

@app.post("/answer")
async def submit_answer(student_name: str = None, session_id: str = None, answer: str = ""):
    """Submit answer"""
    if not session_id and not student_name:
        raise HTTPException(status_code=400, detail="No identifier provided")
    
    # Find session
    if not session_id:
        matches = [s for s in sessions_store.values() if s.get("student_name") == student_name]
        if matches:
            session_id = max(matches, key=lambda s: s.get("timestamp", "")).get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=404, detail="No active session found")
    
    state = sessions_store.get(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check if accepting answers
    if state.get("status") != "recording":
        raise HTTPException(
            status_code=400, 
            detail=f"Not accepting answers. Current status: {state.get('status')}"
        )
    
    # Validate answer
    if not answer.strip():
        raise HTTPException(status_code=400, detail="Empty answer not allowed")
    
    # Store answer
    with answers_lock:
        answers_store[session_id] = answer.strip()
    
    return {
        "message": "Answer received successfully",
        "session_id": session_id
    }

@app.post("/stop/{session_id}")
async def stop_interview(session_id: str):
    """Stop interview"""
    state = sessions_store.get(session_id)
    
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")
    
    state["status"] = "stopped"
    sessions_store[session_id] = state
    
    return {
        "message": "Interview stopped successfully",
        "session_id": session_id,
        "stopped": True
    }

# ─── Results ─────────────────────────────────────────────────
@app.get("/results/{student_name}")
async def get_student_results(student_name: str):
    """Get student results"""
    try:
        results = []
        
        if os.path.exists("interview_log.txt"):
            with open("interview_log.txt", "r", encoding="utf-8") as f:
                for line in f:
                    parts = line.strip().split(" | ", maxsplit=9)
                    if len(parts) >= 10 and parts[1] == student_name:
                        results.append({
                            "timestamp": parts[0],
                            "student": parts[1],
                            "topic": parts[2],
                            "question_num": parts[3],
                            "level": parts[4],
                            "question": parts[5],
                            "answer": parts[6],
                            "elapsed": parts[7],
                            "adapted": parts[8],
                            "reason": parts[9],
                        })
        
        return {"student": student_name, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get results: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("🌐 AI Interview System - Web Server")
    print("🚀 Starting on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
