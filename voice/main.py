
import sys
import os
from pathlib import Path

# Add voice directory to path
sys.path.insert(0, str(Path(__file__).parent))

def test_voice():
    """اختبار الصوت والميكروفون"""
    print("\n🎤 اختبار الصوت")
    print("-" * 40)
    try:
        from audio_capture import AudioCapture
        audio = AudioCapture()
        print("✅ AudioCapture جاهز")
    except Exception as e:
        print(f"❌ AudioCapture: {e}")

    try:
        from speech_to_text import SpeechToText
        stt = SpeechToText()
        print("✅ SpeechToText جاهز")
    except Exception as e:
        print(f"❌ SpeechToText: {e}")

    try:
        from .voice_config import GROQ_API_KEY, STT_MODEL
        print(f"✅ Config جاهز — Model: {STT_MODEL}")
    except Exception as e:
        print(f"❌ Config: {e}")

if __name__ == "__main__":
    test_voice()
