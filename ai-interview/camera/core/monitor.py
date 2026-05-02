"""
Professional Interview Monitor - Advanced Anti-Cheating System
"""
import cv2
import numpy as np
import time
import threading
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime

from .detection import CheatDetection
from .tracking import FaceTracking
from ..config.camera_config import *
from ..utils.warning_state import WarningState
from ..utils.sound import SoundManager
from ..utils.timer import Timer


@dataclass
class MonitoringSession:
    """Session data for interview monitoring"""
    session_id: str
    student_name: str
    start_time: datetime
    warnings: List[Dict]
    violations: List[Dict]
    status: str = "active"


class InterviewMonitor:
    """Professional interview monitoring system"""
    
    def __init__(self, camera_index: int = CAMERA_INDEX):
        self.camera_index = camera_index
        self.cap = None
        self.running = False
        
        # Detection components
        self.face_tracker = FaceTracking()
        self.cheat_detector = CheatDetection()
        
        # Session management
        self.current_session: Optional[MonitoringSession] = None
        self.warning_state = WarningState()
        self.sound_manager = SoundManager()
        self.timer = Timer()
        
        # Statistics
        self.stats = {
            'face_detections': 0,
            'violations': 0,
            'warnings_issued': 0,
            'monitoring_time': 0.0
        }
        
    def initialize(self) -> bool:
        """Initialize camera and monitoring components"""
        try:
            self.cap = cv2.VideoCapture(self.camera_index)
            if not self.cap.isOpened():
                print(f"❌ Failed to open camera {self.camera_index}")
                return False
                
            # Set camera properties with timeout
            try:
                self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_WIDTH)
                self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_HEIGHT)
                self.cap.set(cv2.CAP_PROP_FPS, 30)
            except Exception as e:
                print(f"⚠️ Camera setting failed, using defaults: {e}")
                # Continue with default settings
            
            # Initialize detection components (silent mode)
            if not self.face_tracker.initialize():
                print("❌ Failed to initialize face tracking")
                return False
                
            if not self.cheat_detector.initialize():
                print("❌ Failed to initialize cheat detection")
                return False
                
            # Silent initialization - no duplicate messages
            return True
            
        except Exception as e:
            print(f"❌ Camera initialization failed: {e}")
            return False
    
    def start_session(self, session_id: str, student_name: str) -> bool:
        """Start monitoring session"""
        try:
            self.current_session = MonitoringSession(
                session_id=session_id,
                student_name=student_name,
                start_time=datetime.now(),
                warnings=[],
                violations=[]
            )
            
            self.timer.start()
            self.running = True
            
            print(f"🎯 Started monitoring: {student_name} (Session: {session_id})")
            return True
            
        except Exception as e:
            print(f"❌ Failed to start session: {e}")
            return False
    
    def process_frame(self, frame: np.ndarray) -> Tuple[np.ndarray, Dict]:
        """Process single frame and return annotated frame with detection results"""
        if frame is None:
            return frame, {}
            
        results = {
            'faces': [],
            'violations': [],
            'warnings': [],
            'status': 'normal'
        }
        
        try:
            # Face detection and tracking
            faces = self.face_tracker.detect_faces(frame)
            results['faces'] = faces
            
            # Update statistics
            if faces:
                self.stats['face_detections'] += 1
            
            # Cheat detection
            violations = self.cheat_detector.analyze_frame(frame, faces)
            results['violations'] = violations
            
            # Handle violations
            for violation in violations:
                self._handle_violation(violation)
                
            # Draw annotations
            annotated_frame = self._draw_annotations(frame, results)
            
            # Update status
            if violations:
                results['status'] = 'violation'
            elif not faces:
                results['status'] = 'no_face'
            else:
                results['status'] = 'normal'
                
            return annotated_frame, results
            
        except Exception as e:
            print(f"❌ Frame processing error: {e}")
            return frame, results
    
    def _handle_violation(self, violation: Dict):
        """Handle detected violation"""
        if not self.current_session:
            return
            
        # Add to session
        self.current_session.violations.append({
            'timestamp': datetime.now().isoformat(),
            'type': violation.get('type', 'unknown'),
            'confidence': violation.get('confidence', 0.0),
            'description': violation.get('description', '')
        })
        
        # Update statistics
        self.stats['violations'] += 1
        
        # Trigger warning
        self.warning_state.activate()
        self.sound_manager.play_beep()
        self.stats['warnings_issued'] += 1
        
        # Silent violation detection - no message during interview
    
    def _draw_annotations(self, frame: np.ndarray, results: Dict) -> np.ndarray:
        """Draw annotations on frame"""
        annotated = frame.copy()
        
        try:
            # Draw face rectangles
            for face in results.get('faces', []):
                x, y, w, h = face['bbox']
                color = COLOR_OK if face.get('status') == 'normal' else COLOR_WARNING
                
                cv2.rectangle(annotated, (x, y), (x + w, y + h), color, 2)
                
                # Draw face info
                info_text = f"Face {face.get('id', '?')}"
                if face.get('looking_away'):
                    info_text += " [Looking Away]"
                    
                cv2.putText(annotated, info_text, (x, y - 10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
            
            # Draw violations
            for i, violation in enumerate(results.get('violations', [])):
                y_pos = 30 + i * 30
                text = f"⚠️ {violation.get('type', 'Unknown')}"
                cv2.putText(annotated, text, (10, y_pos),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, COLOR_WARNING, 2)
            
            # Draw session info
            if self.current_session:
                session_text = f"Session: {self.current_session.session_id[:8]}..."
                cv2.putText(annotated, session_text, (10, annotated.shape[0] - 60),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, COLOR_OVERLAY, 2)
                
                student_text = f"Student: {self.current_session.student_name}"
                cv2.putText(annotated, student_text, (10, annotated.shape[0] - 30),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, COLOR_OVERLAY, 2)
            
            # Draw timer
            if self.timer.is_running():
                elapsed = self.timer.get_elapsed()
                timer_text = f"Time: {elapsed:.1f}s"
                cv2.putText(annotated, timer_text, (annotated.shape[0] - 150, 30),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, COLOR_OVERLAY, 2)
            
            # Draw warning overlay
            if self.warning_state.is_active:
                overlay = annotated.copy()
                cv2.rectangle(overlay, (0, 0), (annotated.shape[1], annotated.shape[0]),
                            COLOR_WARNING, -1)
                cv2.addWeighted(overlay, 0.3, annotated, 0.7, 0, annotated)
                
                warning_text = "⚠️ WARNING: VIOLATION DETECTED"
                text_size = cv2.getTextSize(warning_text, cv2.FONT_HERSHEY_SIMPLEX, 1.0, 2)[0]
                text_x = (annotated.shape[1] - text_size[0]) // 2
                text_y = annotated.shape[1] // 2
                
                cv2.putText(annotated, warning_text, (text_x, text_y),
                           cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 3)
                
        except Exception as e:
            print(f"❌ Annotation drawing error: {e}")
        
        return annotated
    
    def run(self):
        """Main monitoring loop"""
        if not self.initialize():
            return
        
        # Silent start - no duplicate messages
        
        try:
            while self.running:
                ret, frame = self.cap.read()
                if not ret:
                    print("❌ Failed to capture frame")
                    break
                
                # Process frame
                processed_frame, results = self.process_frame(frame)
                
                # Update warning state
                self.warning_state.try_deactivate()
                
                # Display
                cv2.imshow('Interview Monitor', processed_frame)
                
                # Handle key presses
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    break
                elif key == ord('s'):
                    self._start_demo_session()
                elif key == ord('w'):
                    self._show_warnings()
                    
        except KeyboardInterrupt:
            print("\n👋 Monitor stopped by user")
        except Exception as e:
            print(f"❌ Monitor error: {e}")
        finally:
            self.cleanup()
    
    def _start_demo_session(self):
        """Start demo session for testing"""
        session_id = f"demo_{int(time.time())}"
        self.start_session(session_id, "Demo Student")
    
    def _show_warnings(self):
        """Display current warnings"""
        if not self.current_session:
            print("No active session")
            return
            
        print(f"\n📋 Session: {self.current_session.session_id}")
        print(f"Student: {self.current_session.student_name}")
        print(f"Violations: {len(self.current_session.violations)}")
        
        for i, violation in enumerate(self.current_session.violations[-5:], 1):
            print(f"  {i}. {violation['type']} - {violation['timestamp']}")
    
    def get_session_summary(self) -> Optional[Dict]:
        """Get current session summary"""
        if not self.current_session:
            return None
            
        return {
            'session_id': self.current_session.session_id,
            'student_name': self.current_session.student_name,
            'duration': self.timer.get_elapsed() if self.timer.is_running() else 0.0,
            'violations_count': len(self.current_session.violations),
            'violations': self.current_session.violations,
            'warnings_count': self.stats['warnings_issued'],
            'face_detections': self.stats['face_detections'],
            'status': self.current_session.status
        }
    
    def stop_session(self) -> Optional[Dict]:
        """Stop current session and return summary"""
        if not self.current_session:
            return None
            
        self.current_session.status = "completed"
        self.timer.stop()
        
        summary = self.get_session_summary()
        self.current_session = None
        
        print(f"🏁 Session completed: {summary['session_id']}")
        return summary
    
    def cleanup(self):
        """Clean up resources"""
        self.running = False
        
        if self.cap:
            self.cap.release()
            
        cv2.destroyAllWindows()
        
        if self.timer.is_running():
            self.timer.stop()
            
        print("🧹 Monitor cleanup completed")


if __name__ == "__main__":
    monitor = InterviewMonitor()
    monitor.run()
