#!/usr/bin/env python3
"""
🚀 AI Interview System - Clean Interface
"""
import os
import sys
import time
from pathlib import Path

# Add current directory to path
sys.path.append(str(Path(__file__).parent))

def start_interview():
    """Start interview directly"""
    try:
        # Get student name
        print("🤖 AI Interview System")
        print("=" * 40)
        student_name = input("Enter your name: ").strip()
        if not student_name:
            print("❌ Please enter your name")
            return
            
        # Get topic
        print("\n📋 Available Topics:")
        topics = [
            "Python", "Java", "C++", "SQL", 
            "Frontend", "Backend", "DevOps", "Machine Learning", 
            "Data Science", "Cybersecurity", "Operating Systems", 
            "Computer Networks", "Mobile Development", "Software Testing", 
            "System Design", "Data Structures", "React", "Node.js", 
            "AWS", "Docker", "MongoDB", "GraphQL", "Microservices",
            "TypeScript", "Vue.js", "Flutter", "Git", 
            "Django", "Spring Boot", "API Design", "Database Design"
        ]
        
        for i, topic in enumerate(topics, 1):
            print(f"{i:2d}. {topic}")
        print(f"{len(topics)+1:2d}. Custom Topic")
        
        try:
            choice = int(input(f"\nSelect topic (1-{len(topics)+1}): "))
            if choice == len(topics)+1:
                topic = input("Enter your custom topic: ").strip()
                if not topic:
                    print("❌ Please enter a valid topic")
                    return
            elif 1 <= choice <= len(topics):
                topic = topics[choice - 1]
            else:
                print("❌ Invalid choice")
                return
        except ValueError:
            print("❌ Please enter a number")
            return
        
        # Start interview
        print(f"\n🚀 Starting interview for {student_name} in {topic}")
        print("🎤 Voice enabled | 📹 Camera monitoring")
        print("\n⏳ Starting in 2 seconds...")
        time.sleep(2)
        
        # Run interview
        interview_path = Path(__file__).parent / "interview"
        sys.path.append(str(interview_path))
        
        try:
            from interview_engine import run_interview
            run_interview(student_name=student_name, topic=topic)
        except ImportError as e:
            print(f"❌ Import error: {e}")
            print("🔧 Trying alternative import...")
            try:
                sys.path.append(str(interview_path / "interview"))
                from interview_engine import run_interview
                run_interview(student_name=student_name, topic=topic)
            except ImportError as e2:
                print(f"❌ Still failed: {e2}")
                return
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    start_interview()
