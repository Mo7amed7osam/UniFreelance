"""
Advanced Cheat Detection System for Interview Monitoring
"""
import cv2
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import time

from ..config.camera_config import *


@dataclass
class Violation:
    """Violation data structure"""
    type: str
    confidence: float
    description: str
    timestamp: float
    bbox: Optional[Tuple[int, int, int, int]] = None
    
    def get(self, key: str, default=None):
        """Dictionary-like access for compatibility"""
        if key == 'type':
            return self.type
        elif key == 'confidence':
            return self.confidence
        elif key == 'description':
            return self.description
        elif key == 'timestamp':
            return self.timestamp
        elif key == 'bbox':
            return self.bbox
        else:
            return default


class CheatDetection:
    """Professional cheat detection system"""
    
    def __init__(self):
        self.initialized = False
        self.face_cascade = None
        self.eye_cascade = None
        self.prev_frame = None
        self.motion_threshold = 30
        self.multiple_persons_threshold = 2
        self.looking_away_threshold = 0.7
        
        # Violation tracking
        self.violation_history = []
        self.cooldown_periods = {}
        
    def initialize(self) -> bool:
        """Initialize detection models"""
        try:
            # Load Haar cascades
            self.face_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            )
            self.eye_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_eye.xml'
            )
            
            if self.face_cascade.empty() or self.eye_cascade.empty():
                print("❌ Failed to load Haar cascade models")
                return False
            
            self.initialized = True
            # Silent initialization - no message during interview
            return True
            
        except Exception as e:
            print(f"❌ Cheat detection initialization failed: {e}")
            return False
    
    def analyze_frame(self, frame: np.ndarray, faces: List[Dict]) -> List[Violation]:
        """Analyze frame for cheating violations"""
        if not self.initialized or frame is None:
            return []
        
        violations = []
        current_time = time.time()
        
        try:
            # Check for multiple persons
            multi_person_violations = self._detect_multiple_persons(faces)
            violations.extend(multi_person_violations)
            
            # Check for suspicious objects
            object_violations = self._detect_suspicious_objects(frame)
            violations.extend(object_violations)
            
            # Check for excessive movement
            movement_violations = self._detect_excessive_movement(frame)
            violations.extend(movement_violations)
            
            # Check for looking away
            gaze_violations = self._detect_looking_away(frame, faces)
            violations.extend(gaze_violations)
            
            # Check for phone usage
            phone_violations = self._detect_phone_usage(frame)
            violations.extend(phone_violations)
            
            # Filter violations based on cooldown
            filtered_violations = self._filter_violations(violations, current_time)
            
            return filtered_violations
            
        except Exception as e:
            print(f"❌ Frame analysis error: {e}")
            return []
    
    def _detect_multiple_persons(self, faces: List[Dict]) -> List[Violation]:
        """Detect if more than one person is present"""
        violations = []
        
        if len(faces) > self.multiple_persons_threshold:
            violation = Violation(
                type="multiple_persons",
                confidence=0.9,
                description=f"Multiple persons detected: {len(faces)} faces",
                timestamp=time.time(),
                bbox=None
            )
            violations.append(violation)
        
        return violations
    
    def _detect_suspicious_objects(self, frame: np.ndarray) -> List[Violation]:
        """Detect suspicious objects (phones, papers, etc.)"""
        violations = []
        
        try:
            # Convert to grayscale for analysis
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Detect bright rectangular objects (potential phone screens)
            _, thresh = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if 1000 < area < 10000:  # Phone-sized objects
                    x, y, w, h = cv2.boundingRect(contour)
                    aspect_ratio = w / h
                    
                    # Check if it looks like a phone (aspect ratio between 1.5 and 3)
                    if 1.5 <= aspect_ratio <= 3.0:
                        violation = Violation(
                            type="suspicious_object",
                            confidence=0.7,
                            description="Suspicious rectangular object detected (potential phone)",
                            timestamp=time.time(),
                            bbox=(x, y, w, h)
                        )
                        violations.append(violation)
        
        except Exception as e:
            print(f"❌ Object detection error: {e}")
        
        return violations
    
    def _detect_excessive_movement(self, frame: np.ndarray) -> List[Violation]:
        """Detect excessive head or body movement"""
        violations = []
        
        try:
            if self.prev_frame is not None:
                # Calculate optical flow
                gray_prev = cv2.cvtColor(self.prev_frame, cv2.COLOR_BGR2GRAY)
                gray_curr = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                
                # Calculate frame difference
                diff = cv2.absdiff(gray_prev, gray_curr)
                movement_score = np.mean(diff)
                
                if movement_score > self.motion_threshold:
                    violation = Violation(
                        type="excessive_movement",
                        confidence=min(movement_score / 100, 1.0),
                        description=f"Excessive movement detected: {movement_score:.1f}",
                        timestamp=time.time(),
                        bbox=None
                    )
                    violations.append(violation)
            
            self.prev_frame = frame.copy()
            
        except Exception as e:
            print(f"❌ Movement detection error: {e}")
        
        return violations
    
    def _detect_looking_away(self, frame: np.ndarray, faces: List[Dict]) -> List[Violation]:
        """Detect if person is looking away from camera"""
        violations = []
        
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            for face in faces:
                x, y, w, h = face['bbox']
                face_roi = gray[y:y+h, x:x+w]
                
                # Detect eyes within face
                eyes = self.eye_cascade.detectMultiScale(face_roi, scaleFactor=1.1, minNeighbors=5)
                
                if len(eyes) >= 2:
                    # Simple gaze estimation based on eye position
                    eye_centers = []
                    for (ex, ey, ew, eh) in eyes:
                        eye_center = (x + ex + ew//2, y + ey + eh//2)
                        eye_centers.append(eye_center)
                    
                    if len(eye_centers) == 2:
                        # Calculate average eye direction
                        avg_eye_x = sum(ec[0] for ec in eye_centers) / 2
                        face_center_x = x + w // 2
                        
                        # Check if looking significantly left or right
                        offset = abs(avg_eye_x - face_center_x) / w
                        if offset > self.looking_away_threshold:
                            violation = Violation(
                                type="looking_away",
                                confidence=offset,
                                description="Person looking away from camera",
                                timestamp=time.time(),
                                bbox=(x, y, w, h)
                            )
                            violations.append(violation)
        
        except Exception as e:
            print(f"❌ Gaze detection error: {e}")
        
        return violations
    
    def _detect_phone_usage(self, frame: np.ndarray) -> List[Violation]:
        """Detect phone usage patterns"""
        violations = []
        
        try:
            # Look for typical phone usage patterns
            # This is a simplified detection - in production, you'd use more sophisticated methods
            
            # Check for hand-held objects near face area
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(gray, scaleFactor=FACE_SCALE_FACTOR, 
                                                    minNeighbors=FACE_MIN_NEIGHBORS, 
                                                    minSize=FACE_MIN_SIZE)
            
            for (x, y, w, h) in faces:
                # Check area below face (where phone would typically be held)
                phone_region = frame[y+h:y+h+150, x:x+w]
                if phone_region.size > 0:
                    # Look for bright rectangular objects in this region
                    phone_gray = cv2.cvtColor(phone_region, cv2.COLOR_BGR2GRAY)
                    _, thresh = cv2.threshold(phone_gray, 180, 255, cv2.THRESH_BINARY)
                    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                    
                    for contour in contours:
                        area = cv2.contourArea(contour)
                        if 500 < area < 3000:
                            violation = Violation(
                                type="phone_usage",
                                confidence=0.6,
                                description="Potential phone usage detected",
                                timestamp=time.time(),
                                bbox=(x, y+h, w, 150)
                            )
                            violations.append(violation)
        
        except Exception as e:
            print(f"❌ Phone detection error: {e}")
        
        return violations
    
    def _filter_violations(self, violations: List[Violation], current_time: float) -> List[Violation]:
        """Filter violations based on cooldown periods"""
        filtered = []
        
        for violation in violations:
            violation_type = violation.type
            
            # Check cooldown
            if violation_type in self.cooldown_periods:
                time_since_last = current_time - self.cooldown_periods[violation_type]
                if time_since_last < 5.0:  # 5 second cooldown
                    continue
            
            # Add violation and update cooldown
            filtered.append(violation)
            self.cooldown_periods[violation_type] = current_time
        
        return filtered
    
    def get_violation_summary(self) -> Dict:
        """Get summary of detected violations"""
        if not self.violation_history:
            return {"total": 0, "by_type": {}}
        
        by_type = {}
        for violation in self.violation_history:
            by_type[violation.type] = by_type.get(violation.type, 0) + 1
        
        return {
            "total": len(self.violation_history),
            "by_type": by_type,
            "recent": self.violation_history[-5:] if len(self.violation_history) > 5 else self.violation_history
        }
    
    def reset_history(self):
        """Reset violation history"""
        self.violation_history.clear()
        self.cooldown_periods.clear()
        print("🧹 Violation history reset")
