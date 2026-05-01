#!/usr/bin/env python3
"""
🚀 AI Interview System - Main Entry Point
"""
import os
import sys
from pathlib import Path

# Add current directory to path
sys.path.append(str(Path(__file__).parent))

def start_server():
    """Start web server directly"""
    print("🌐 Starting AI Interview Server...")
    print("=" * 50)
    
    try:
        import uvicorn
        from web.server import app
        
        print("🚀 Server starting on http://localhost:8000")
        print("📋 API Documentation: http://localhost:8000/docs")
        print("📋 Available endpoints:")
        print("   POST /start - Start interview")
        print("   GET /state/{session_id} - Get session state")
        print("   POST /answer - Submit answer")
        print("   GET /results/{student_name} - Get results")
        print("\n⚠️ Press Ctrl+C to stop server")
        
        uvicorn.run(app, host="0.0.0.0", port=8000)
        
    except Exception as e:
        print(f"❌ Failed to start server: {e}")

if __name__ == "__main__":
    start_server()
