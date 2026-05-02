import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
if not GROQ_API_KEY:
    print("Warning: GROQ_API_KEY not set")

SAMPLE_RATE         = 16_000
CHANNELS            = 1
CHUNK_DURATION_MS   = 20
CHUNK_SIZE          = int(SAMPLE_RATE * CHUNK_DURATION_MS / 1000)

VAD_AGGRESSIVENESS  = int(os.getenv("VAD_AGGRESSIVENESS", "1"))
PRE_SPEECH_BUFFER_S = 0.4  
MIN_SPEECH_S        = 0.3   

SILENCE_BEFORE_CUTOFF_S = 8.0
GRACE_SILENCE_S         = 1.5

STT_MODEL           = "whisper-large-v3-turbo"
