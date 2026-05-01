"""
Professional Face Tracking System for Interview Monitoring
"""
import cv2
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import time
import uuid

from ..config.camera_config import *


@dataclass
class TrackedFace:
    """Tracked face data structure"""
    id: str
    bbox: Tuple[int, int, int, int]
    confidence: float
    status: str
    last_seen: float
    looking_away: bool = False
    movement_history: List[Tuple[float, Tuple[int, int]]] = None
    
    def __post_init__(self):
        if self.movement_history is None:
            self.movement_history = []


class FaceTracking:
    """Professional face tracking system"""
    
    def __init__(self):
        self.initialized = False
        self.face_cascade = None
        self.tracked_faces: Dict[str, TrackedFace] = {}
        self.next_face_id = 1
        self.max_faces = 3
        self.face_timeout = 5.0  # seconds
        self.movement_threshold = 50  # pixels
        
    def initialize(self) -> bool:
        """Initialize face tracking system"""
        try:
            # Load face cascade classifier
            self.face_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            )
            
            if self.face_cascade.empty():
                print("❌ Failed to load face cascade classifier")
                return False
            
            self.initialized = True
            # Silent initialization - no message during interview
            return True
            
        except Exception as e:
            print(f"❌ Face tracking initialization failed: {e}")
            return False
    
    def detect_faces(self, frame: np.ndarray) -> List[Dict]:
        """Detect and track faces in frame"""
        if not self.initialized or frame is None:
            return []
        
        detected_faces = []
        current_time = time.time()
        
        try:
            # Convert to grayscale for detection
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=FACE_SCALE_FACTOR,
                minNeighbors=FACE_MIN_NEIGHBORS,
                minSize=FACE_MIN_SIZE,
                flags=cv2.CASCADE_SCALE_IMAGE
            )
            
            # Process detected faces
            for (x, y, w, h) in faces:
                # Calculate confidence based on face size and position
                confidence = self._calculate_face_confidence(x, y, w, h, frame.shape)
                
                # Create face data
                face_data = {
                    'bbox': (x, y, w, h),
                    'confidence': confidence,
                    'center': (x + w // 2, y + h // 2),
                    'status': 'normal'
                }
                
                detected_faces.append(face_data)
            
            # Update tracking
            self._update_tracking(detected_faces, current_time)
            
            # Clean up old faces
            self._cleanup_old_faces(current_time)
            
            # Convert tracked faces to list format
            return self._get_tracked_faces_list()
            
        except Exception as e:
            print(f"❌ Face detection error: {e}")
            return []
    
    def _calculate_face_confidence(self, x: int, y: int, w: int, h: int, frame_shape: Tuple[int, int]) -> float:
        """Calculate confidence score for detected face"""
        confidence = 0.5  # Base confidence
        
        # Size factor (prefer larger faces)
        face_area = w * h
        frame_area = frame_shape[0] * frame_shape[1]
        size_ratio = face_area / frame_area
        confidence += min(size_ratio * 10, 0.3)
        
        # Position factor (prefer centered faces)
        frame_center_x = frame_shape[1] // 2
        face_center_x = x + w // 2
        position_offset = abs(face_center_x - frame_center_x) / frame_shape[1]
        confidence += max(0, 0.2 - position_offset)
        
        # Aspect ratio factor (prefer typical face aspect ratios)
        aspect_ratio = w / h
        if 0.7 <= aspect_ratio <= 1.4:  # Typical face aspect ratios
            confidence += 0.2
        
        return min(confidence, 1.0)
    
    def _update_tracking(self, detected_faces: List[Dict], current_time: float):
        """Update face tracking with new detections"""
        # Match detected faces to tracked faces
        matched_tracked_ids = set()
        
        for detected_face in detected_faces:
            best_match_id = None
            best_distance = float('inf')
            
            # Find best match among tracked faces
            for face_id, tracked_face in self.tracked_faces.items():
                if face_id in matched_tracked_ids:
                    continue
                
                # Calculate distance between face centers
                detected_center = detected_face['center']
                tracked_center = (tracked_face.bbox[0] + tracked_face.bbox[2] // 2,
                                 tracked_face.bbox[1] + tracked_face.bbox[3] // 2)
                
                distance = np.sqrt((detected_center[0] - tracked_center[0])**2 + 
                                 (detected_center[1] - tracked_center[1])**2)
                
                if distance < best_distance and distance < 100:  # 100 pixel threshold
                    best_distance = distance
                    best_match_id = face_id
            
            if best_match_id:
                # Update existing tracked face
                self._update_tracked_face(best_match_id, detected_face, current_time)
                matched_tracked_ids.add(best_match_id)
            else:
                # Create new tracked face
                if len(self.tracked_faces) < self.max_faces:
                    self._create_tracked_face(detected_face, current_time)
        
        # Mark unmatched faces as potentially lost
        for face_id in self.tracked_faces:
            if face_id not in matched_tracked_ids:
                self.tracked_faces[face_id].status = 'lost'
    
    def _update_tracked_face(self, face_id: str, detected_face: Dict, current_time: float):
        """Update existing tracked face"""
        tracked_face = self.tracked_faces[face_id]
        
        # Update position
        old_center = (tracked_face.bbox[0] + tracked_face.bbox[2] // 2,
                     tracked_face.bbox[1] + tracked_face.bbox[3] // 2)
        new_center = detected_face['center']
        
        tracked_face.bbox = detected_face['bbox']
        tracked_face.confidence = detected_face['confidence']
        tracked_face.last_seen = current_time
        tracked_face.status = 'normal'
        
        # Check for excessive movement
        movement_distance = np.sqrt((new_center[0] - old_center[0])**2 + 
                                   (new_center[1] - old_center[1])**2)
        tracked_face.movement_history.append((current_time, new_center))
        
        # Keep only recent movement history
        tracked_face.movement_history = [
            (t, pos) for t, pos in tracked_face.movement_history 
            if current_time - t < 10.0  # Keep last 10 seconds
        ]
        
        # Update looking away status
        tracked_face.looking_away = movement_distance > self.movement_threshold
    
    def _create_tracked_face(self, detected_face: Dict, current_time: float):
        """Create new tracked face"""
        face_id = f"face_{self.next_face_id:03d}"
        self.next_face_id += 1
        
        tracked_face = TrackedFace(
            id=face_id,
            bbox=detected_face['bbox'],
            confidence=detected_face['confidence'],
            status='normal',
            last_seen=current_time,
            movement_history=[(current_time, detected_face['center'])]
        )
        
        self.tracked_faces[face_id] = tracked_face
    
    def _cleanup_old_faces(self, current_time: float):
        """Remove faces that haven't been seen recently"""
        faces_to_remove = []
        
        for face_id, tracked_face in self.tracked_faces.items():
            if current_time - tracked_face.last_seen > self.face_timeout:
                faces_to_remove.append(face_id)
        
        for face_id in faces_to_remove:
            del self.tracked_faces[face_id]
    
    def _get_tracked_faces_list(self) -> List[Dict]:
        """Convert tracked faces to list format"""
        faces_list = []
        
        for tracked_face in self.tracked_faces.values():
            face_dict = {
                'id': tracked_face.id,
                'bbox': tracked_face.bbox,
                'confidence': tracked_face.confidence,
                'status': tracked_face.status,
                'looking_away': tracked_face.looking_away,
                'movement_score': self._calculate_movement_score(tracked_face),
                'tracking_duration': time.time() - tracked_face.movement_history[0][0] if tracked_face.movement_history else 0
            }
            faces_list.append(face_dict)
        
        return faces_list
    
    def _calculate_movement_score(self, tracked_face: TrackedFace) -> float:
        """Calculate movement score for tracked face"""
        if len(tracked_face.movement_history) < 2:
            return 0.0
        
        total_movement = 0.0
        for i in range(1, len(tracked_face.movement_history)):
            prev_pos = tracked_face.movement_history[i-1][1]
            curr_pos = tracked_face.movement_history[i][1]
            movement = np.sqrt((curr_pos[0] - prev_pos[0])**2 + (curr_pos[1] - prev_pos[1])**2)
            total_movement += movement
        
        return total_movement / len(tracked_face.movement_history)
    
    def get_face_count(self) -> int:
        """Get number of currently tracked faces"""
        return len(self.tracked_faces)
    
    def get_primary_face(self) -> Optional[Dict]:
        """Get the primary (most confident) face"""
        if not self.tracked_faces:
            return None
        
        primary_face = max(self.tracked_faces.values(), key=lambda f: f.confidence)
        
        return {
            'id': primary_face.id,
            'bbox': primary_face.bbox,
            'confidence': primary_face.confidence,
            'status': primary_face.status,
            'looking_away': primary_face.looking_away
        }
    
    def reset_tracking(self):
        """Reset all tracking data"""
        self.tracked_faces.clear()
        self.next_face_id = 1
        print("🧹 Face tracking reset")
    
    def get_tracking_stats(self) -> Dict:
        """Get tracking statistics"""
        if not self.tracked_faces:
            return {
                'total_faces': 0,
                'average_confidence': 0.0,
                'average_movement': 0.0,
                'faces_looking_away': 0
            }
        
        total_confidence = sum(f.confidence for f in self.tracked_faces.values())
        total_movement = sum(self._calculate_movement_score(f) for f in self.tracked_faces.values())
        looking_away = sum(1 for f in self.tracked_faces.values() if f.looking_away)
        
        return {
            'total_faces': len(self.tracked_faces),
            'average_confidence': total_confidence / len(self.tracked_faces),
            'average_movement': total_movement / len(self.tracked_faces),
            'faces_looking_away': looking_away,
            'tracking_duration': max(
                time.time() - f.movement_history[0][0] 
                for f in self.tracked_faces.values() 
                if f.movement_history
            ) if self.tracked_faces else 0.0
        }
