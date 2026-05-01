"""
Professional Configuration Management System
"""
import os
import json
from pathlib import Path
from typing import Dict, Any, Optional
from dataclasses import dataclass, asdict
from dotenv import load_dotenv

load_dotenv()


@dataclass
class CameraConfig:
    """Camera configuration settings"""
    index: int = 0
    width: int = 1280
    height: int = 720
    fps: int = 30
    face_scale_factor: float = 1.1
    face_min_neighbors: int = 7
    face_min_size: tuple = (80, 80)
    motion_threshold: int = 30
    multiple_persons_threshold: int = 2
    looking_away_threshold: float = 0.7


@dataclass
class VoiceConfig:
    """Voice/Audio configuration settings"""
    sample_rate: int = 16000
    chunk_size: int = 1024
    channels: int = 1
    format: str = "int16"
    vad_aggressiveness: int = 3
    min_speech_duration: float = 0.5
    max_silence_duration: float = 2.0
    energy_threshold: float = 300.0
    groove_api_key: Optional[str] = None
    stt_model: str = "whisper-large-v3"


@dataclass
class InterviewConfig:
    """Interview system configuration"""
    max_questions: int = 5
    fast_threshold: int = 10
    slow_threshold: int = 20
    levels: list = None
    repeat_allowed: bool = True
    max_repeats_per_question: int = 1
    adaptation_enabled: bool = True
    
    def __post_init__(self):
        if self.levels is None:
            self.levels = ["Easy", "Medium", "Hard"]


@dataclass
class APIConfig:
    """API configuration settings"""
    anthropic_api_key: Optional[str] = None
    openrouter_api_key: Optional[str] = None
    openrouter_model: str = "anthropic/claude-3.5-haiku"
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    cors_enabled: bool = True


@dataclass
class SecurityConfig:
    """Security configuration"""
    session_timeout: int = 3600  # 1 hour
    max_concurrent_sessions: int = 100
    enable_logging: bool = True
    log_level: str = "INFO"
    encryption_enabled: bool = True


class SettingsManager:
    """Professional settings management system"""
    
    def __init__(self, config_file: str = "config/settings.json"):
        self.config_file = Path(config_file)
        self.config_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Initialize configurations
        self.camera = CameraConfig()
        self.voice = VoiceConfig()
        self.interview = InterviewConfig()
        self.api = APIConfig()
        self.security = SecurityConfig()
        
        # Load from file and environment
        self._load_settings()
    
    def _load_settings(self):
        """Load settings from file and environment variables"""
        # Load from JSON file if exists
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r') as f:
                    data = json.load(f)
                
                # Update configurations from file
                if 'camera' in data:
                    self.camera = CameraConfig(**data['camera'])
                if 'voice' in data:
                    self.voice = VoiceConfig(**data['voice'])
                if 'interview' in data:
                    self.interview = InterviewConfig(**data['interview'])
                if 'api' in data:
                    self.api = APIConfig(**data['api'])
                if 'security' in data:
                    self.security = SecurityConfig(**data['security'])
                    
                print(f"✅ Settings loaded from {self.config_file}")
                
            except Exception as e:
                print(f"⚠️ Error loading settings file: {e}")
        
        # Override with environment variables
        self._load_from_environment()
    
    def _load_from_environment(self):
        """Load settings from environment variables"""
        # Camera settings
        self.camera.index = int(os.getenv('CAMERA_INDEX', self.camera.index))
        self.camera.width = int(os.getenv('CAMERA_WIDTH', self.camera.width))
        self.camera.height = int(os.getenv('CAMERA_HEIGHT', self.camera.height))
        
        # Voice settings
        self.voice.sample_rate = int(os.getenv('SAMPLE_RATE', self.voice.sample_rate))
        self.voice.chunk_size = int(os.getenv('CHUNK_SIZE', self.voice.chunk_size))
        self.voice.energy_threshold = float(os.getenv('MIC_THRESHOLD', self.voice.energy_threshold))
        self.voice.groove_api_key = os.getenv('GROQ_API_KEY', self.voice.groove_api_key)
        
        # API settings
        self.api.anthropic_api_key = os.getenv('ANTHROPIC_API_KEY', self.api.anthropic_api_key)
        self.api.openrouter_api_key = os.getenv('OPENROUTER_API_KEY', self.api.openrouter_api_key)
        self.api.openrouter_model = os.getenv('OPENROUTER_MODEL', self.api.openrouter_model)
        self.api.port = int(os.getenv('API_PORT', self.api.port))
        self.api.debug = os.getenv('API_DEBUG', 'false').lower() == 'true'
        
        # Security settings
        self.security.log_level = os.getenv('LOG_LEVEL', self.security.log_level)
        self.security.session_timeout = int(os.getenv('SESSION_TIMEOUT', self.security.session_timeout))
    
    def save_settings(self):
        """Save current settings to file"""
        try:
            settings_dict = {
                'camera': asdict(self.camera),
                'voice': asdict(self.voice),
                'interview': asdict(self.interview),
                'api': asdict(self.api),
                'security': asdict(self.security)
            }
            
            with open(self.config_file, 'w') as f:
                json.dump(settings_dict, f, indent=2)
            
            print(f"✅ Settings saved to {self.config_file}")
            return True
            
        except Exception as e:
            print(f"❌ Error saving settings: {e}")
            return False
    
    def get_api_key(self, provider: str) -> Optional[str]:
        """Get API key for specified provider"""
        if provider.lower() == 'anthropic':
            return self.api.anthropic_api_key
        elif provider.lower() == 'openrouter':
            return self.api.openrouter_api_key
        elif provider.lower() == 'groq':
            return self.voice.groove_api_key
        else:
            return None
    
    def has_valid_api_keys(self) -> Dict[str, bool]:
        """Check which API keys are configured"""
        return {
            'anthropic': bool(self.api.anthropic_api_key),
            'openrouter': bool(self.api.openrouter_api_key),
            'groq': bool(self.voice.groove_api_key)
        }
    
    def get_camera_config(self) -> CameraConfig:
        """Get camera configuration"""
        return self.camera
    
    def get_voice_config(self) -> VoiceConfig:
        """Get voice configuration"""
        return self.voice
    
    def get_interview_config(self) -> InterviewConfig:
        """Get interview configuration"""
        return self.interview
    
    def get_api_config(self) -> APIConfig:
        """Get API configuration"""
        return self.api
    
    def get_security_config(self) -> SecurityConfig:
        """Get security configuration"""
        return self.security
    
    def update_camera_config(self, **kwargs):
        """Update camera configuration"""
        for key, value in kwargs.items():
            if hasattr(self.camera, key):
                setattr(self.camera, key, value)
        self.save_settings()
    
    def update_voice_config(self, **kwargs):
        """Update voice configuration"""
        for key, value in kwargs.items():
            if hasattr(self.voice, key):
                setattr(self.voice, key, value)
        self.save_settings()
    
    def update_interview_config(self, **kwargs):
        """Update interview configuration"""
        for key, value in kwargs.items():
            if hasattr(self.interview, key):
                setattr(self.interview, key, value)
        self.save_settings()
    
    def validate_settings(self) -> Dict[str, Any]:
        """Validate all settings and return validation results"""
        validation_results = {
            'valid': True,
            'errors': [],
            'warnings': []
        }
        
        # Validate camera settings
        if self.camera.width <= 0 or self.camera.height <= 0:
            validation_results['errors'].append("Invalid camera dimensions")
            validation_results['valid'] = False
        
        if self.camera.fps <= 0:
            validation_results['errors'].append("Invalid camera FPS")
            validation_results['valid'] = False
        
        # Validate voice settings
        if self.voice.sample_rate <= 0:
            validation_results['errors'].append("Invalid sample rate")
            validation_results['valid'] = False
        
        if self.voice.energy_threshold < 0:
            validation_results['errors'].append("Invalid energy threshold")
            validation_results['valid'] = False
        
        # Validate API settings
        api_keys = self.has_valid_api_keys()
        if not any(api_keys.values()):
            validation_results['warnings'].append("No API keys configured")
        
        # Validate security settings
        if self.security.session_timeout <= 0:
            validation_results['errors'].append("Invalid session timeout")
            validation_results['valid'] = False
        
        return validation_results
    
    def reset_to_defaults(self):
        """Reset all settings to defaults"""
        self.camera = CameraConfig()
        self.voice = VoiceConfig()
        self.interview = InterviewConfig()
        self.api = APIConfig()
        self.security = SecurityConfig()
        
        # Reload environment variables
        self._load_from_environment()
        
        print("🔄 Settings reset to defaults")
    
    def export_settings(self, export_file: str) -> bool:
        """Export settings to specified file"""
        try:
            settings_dict = {
                'camera': asdict(self.camera),
                'voice': asdict(self.voice),
                'interview': asdict(self.interview),
                'api': {k: v for k, v in asdict(self.api).items() if 'key' not in k},
                'security': asdict(self.security)
            }
            
            with open(export_file, 'w') as f:
                json.dump(settings_dict, f, indent=2)
            
            print(f"✅ Settings exported to {export_file}")
            return True
            
        except Exception as e:
            print(f"❌ Error exporting settings: {e}")
            return False
    
    def import_settings(self, import_file: str) -> bool:
        """Import settings from specified file"""
        try:
            with open(import_file, 'r') as f:
                data = json.load(f)
            
            # Update configurations from imported data
            if 'camera' in data:
                self.camera = CameraConfig(**data['camera'])
            if 'voice' in data:
                self.voice = VoiceConfig(**data['voice'])
            if 'interview' in data:
                self.interview = InterviewConfig(**data['interview'])
            if 'api' in data:
                # Don't import API keys from file for security
                api_data = {k: v for k, v in data['api'].items() if 'key' not in k}
                current_api = asdict(self.api)
                current_api.update(api_data)
                self.api = APIConfig(**current_api)
            if 'security' in data:
                self.security = SecurityConfig(**data['security'])
            
            print(f"✅ Settings imported from {import_file}")
            return True
            
        except Exception as e:
            print(f"❌ Error importing settings: {e}")
            return False
    
    def get_summary(self) -> Dict[str, Any]:
        """Get settings summary"""
        return {
            'camera': {
                'resolution': f"{self.camera.width}x{self.camera.height}",
                'fps': self.camera.fps,
                'index': self.camera.index
            },
            'voice': {
                'sample_rate': self.voice.sample_rate,
                'has_groq_key': bool(self.voice.groove_api_key),
                'energy_threshold': self.voice.energy_threshold
            },
            'interview': {
                'max_questions': self.interview.max_questions,
                'levels': self.interview.levels,
                'adaptation_enabled': self.interview.adaptation_enabled
            },
            'api': {
                'port': self.api.port,
                'has_keys': self.has_valid_api_keys(),
                'debug': self.api.debug
            },
            'security': {
                'session_timeout': self.security.session_timeout,
                'log_level': self.security.log_level,
                'encryption_enabled': self.security.encryption_enabled
            }
        }


# Global settings instance
settings = SettingsManager()


# Backward compatibility functions
def get_camera_config():
    """Get camera configuration (backward compatibility)"""
    return settings.get_camera_config()


def get_voice_config():
    """Get voice configuration (backward compatibility)"""
    return settings.get_voice_config()


def get_api_key(provider: str) -> Optional[str]:
    """Get API key (backward compatibility)"""
    return settings.get_api_key(provider)
