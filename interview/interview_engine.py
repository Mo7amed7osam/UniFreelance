import time
import threading
import json
import os
import sys

# Force UTF-8 output so Unicode characters don't crash on Windows
import locale

try:
    locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
except:
    try:
        locale.setlocale(locale.LC_ALL, 'C.UTF-8')
    except:
        pass

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
if hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

import sys

if sys.version_info[0] >= 3:
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import math
import httpx
import re
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Handle imports for standalone use
try:
    from shared import sessions_store, answers_store, answers_lock
except ImportError:
    sessions_store = {}
    answers_store = {}
    answers_lock = None
load_dotenv()
if os.name == "nt":
    import msvcrt

STATE_FILE = "state.json"
LOG_FILE = "interview_log.txt"

FAST_THRESHOLD = 10
SLOW_THRESHOLD = 20
LEVELS = ["Easy", "Medium", "Hard"]

# ─── Terminal UI (defined early so _bg_print can use colors) ─────────
RESET  = "\033[0m"
BOLD   = "\033[1m"
DIM    = "\033[2m"
GREEN  = "\033[92m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
WHITE  = "\033[97m"
RED    = "\033[91m"

# ─── Thread-safe background output buffer ────────────────────────────
# During get_answer() (countdown active) we replace sys.stdout with a
# BufferedStdout that sends every write from ANY thread to the buffer.
# After the answer, we restore stdout and flush the buffer — so all
# camera violations, TTS logs, AI reasons, etc. appear cleanly after
# the countdown with zero interleaving.

_bg_print_lock:   threading.Lock = threading.Lock()
_bg_print_buffer: list           = []
_real_stdout      = sys.stdout    # saved once at import time


class _BufferedStdout:
    """Drop-in stdout replacement: buffers all writes during recording."""
    def write(self, text):
        if text and text != "\n":
            with _bg_print_lock:
                _bg_print_buffer.append(text.rstrip("\n"))
        elif text == "\n":
            pass  # swallow bare newlines
    def flush(self):
        pass
    def reconfigure(self, **kwargs):
        pass


def _bg_print(text: str) -> None:
    """Manually buffer a line (used by background threads)."""
    with _bg_print_lock:
        _bg_print_buffer.append(text)


def _flush_bg_prints() -> None:
    """Restore real stdout, print buffered lines, clear buffer."""
    sys.stdout = _real_stdout
    with _bg_print_lock:
        for line in _bg_print_buffer:
            print(line)
        _bg_print_buffer.clear()


def _start_buffering() -> None:
    """Redirect stdout to buffer — call just before countdown starts."""
    sys.stdout = _BufferedStdout()


def _safe_print(text: str) -> None:
    """Print to real stdout regardless of buffering state."""
    _real_stdout.write(text + "\n")
    _real_stdout.flush()


# ─── Voice Capture ───────────────────────────────────────────────────
_audio_capture = None
_stt_engine    = None
_use_voice     = False


def _init_voice(topic: str = "") -> bool:
    global _audio_capture, _stt_engine, _use_voice
    try:
        sys.path.insert(0, str(Path(__file__).resolve().parent))
        from voice.audio_capture import AudioCapture
        from voice.speech_to_text import SpeechToText

        _audio_capture = AudioCapture()
        _stt_engine    = SpeechToText(domain=topic)
        _use_voice     = True
        _log("INFO", "Voice input ready (mic + Groq STT)")
        return True
    except Exception as exc:
        _log("WARN", f"Voice unavailable ({exc}) — falling back to keyboard input.")
        _use_voice = False
        return False


def _capture_voice_answer(stop_event=None) -> str | None:
    """Record one utterance and return transcribed text, or None on failure."""
    if not _use_voice or _audio_capture is None:
        _real_stdout.write(f"  {YELLOW}Voice not available - using keyboard{RESET}\n"); _real_stdout.flush()
        return None
    try:
        _real_stdout.write(f"  {CYAN}🎤 Listening... (speak naturally, pause when done){RESET}\n"); _real_stdout.flush()
        wav = _audio_capture.record_utterance(stop_event=stop_event)
        if not wav:
            _real_stdout.write(f"  {YELLOW}No audio recorded - try speaking louder or closer to mic{RESET}\n"); _real_stdout.flush()
            return None
        _real_stdout.write(f"  {CYAN}Transcribing...{RESET}\n"); _real_stdout.flush()
        text = _stt_engine.transcribe(wav) if _stt_engine else None
        if text and text.strip():
            _real_stdout.write(f"  {GREEN}✓ Heard: {text.strip()}{RESET}\n"); _real_stdout.flush()
            return text.strip()
        else:
            _real_stdout.write(f"  {YELLOW}Could not understand - try again{RESET}\n"); _real_stdout.flush()
            return None
    except Exception as e:
        _real_stdout.write(f"  {RED}Voice error: {e}{RESET}\n"); _real_stdout.flush()
        _real_stdout.write(f"  {YELLOW}Falling back to keyboard input{RESET}\n"); _real_stdout.flush()
        return None


# ─── API key helpers ──────────────────────────────────────────────────
def _normalize_api_key(raw):
    if not raw:
        return ""
    s = str(raw).strip().strip("\"'")
    for ch in ("\ufeff", "\u200b", "\u200c", "\u200d", "\xa0"):
        s = s.replace(ch, "")
    s = "".join(s.split())
    return s.strip()


def _sanitize_log_field(value):
    if value is None:
        return ""
    text = str(value)
    text = text.replace("\r", " ").replace("\n", " ")
    text = text.replace(" | ", " / ")
    return re.sub(r"\s+", " ", text).strip()


def get_time_limit(level):
    if level == "Easy":
        return 20
    elif level == "Medium":
        return 25
    else:
        return 30


# ─── AI backends ──────────────────────────────────────────────────────
def _is_openrouter_key(k: str) -> bool:
    return bool(k) and (k.startswith("sk-or-v1-") or k.startswith("sk-or-"))


def _looks_like_anthropic_console_key(k: str) -> bool:
    return bool(k) and (k.startswith("sk-ant-api") or k.startswith("sk-ant-"))


_cand_or = _normalize_api_key(os.getenv("OPENROUTER_API_KEY"))
_cand_an = _normalize_api_key(os.getenv("ANTHROPIC_API_KEY"))

OPENROUTER_API_KEY = _cand_or
ANTHROPIC_API_KEY  = ""

if _cand_an:
    if _is_openrouter_key(_cand_an):
        if not OPENROUTER_API_KEY:
            OPENROUTER_API_KEY = _cand_an
            print("  [INFO]  Key in ANTHROPIC_API_KEY is an OpenRouter key — using it for OpenRouter.")
        elif OPENROUTER_API_KEY != _cand_an:
            print("  [WARN]  ANTHROPIC_API_KEY looks like OpenRouter but OPENROUTER_API_KEY is already set.")
    elif _looks_like_anthropic_console_key(_cand_an):
        if not OPENROUTER_API_KEY:
            ANTHROPIC_API_KEY = _cand_an
    else:
        if not OPENROUTER_API_KEY:
            ANTHROPIC_API_KEY = _cand_an

has_api_key        = bool(OPENROUTER_API_KEY or ANTHROPIC_API_KEY)
OPENROUTER_MODEL   = os.getenv("OPENROUTER_MODEL",   "anthropic/claude-3.5-haiku")
ANTHROPIC_MODEL    = os.getenv("ANTHROPIC_MODEL",    "claude-3-5-haiku-20241022")
ANTHROPIC_API_VERSION = os.getenv("ANTHROPIC_API_VERSION", "2023-06-01")

if OPENROUTER_API_KEY and ANTHROPIC_API_KEY:
    print("  [INFO]  Both keys set — using OpenRouter.")
if OPENROUTER_API_KEY:
    print("  [AI]  Claude ready (OpenRouter)")
elif ANTHROPIC_API_KEY:
    print("  [AI]  Claude ready (Anthropic API)")
else:
    print("  [WARN]  No API keys — using fallback questions.")


# ─── Terminal UI helpers ──────────────────────────────────────────────
def _banner(text, color="white"):
    c = {"green": GREEN, "yellow": YELLOW, "cyan": CYAN,
         "white": WHITE, "red": RED}.get(color, WHITE)
    width = 56
    print(f"\n{c}{'─' * width}{RESET}")
    print(f"{c}  {text}{RESET}")
    print(f"{c}{'─' * width}{RESET}\n")


def _log(tag, text):
    tag_colors = {
        "SPEAK": CYAN, "INFO": DIM, "TIMER": YELLOW,
        "STATE": GREEN, "WARN": YELLOW, "ADAPT": CYAN, "AI": GREEN
    }
    c = tag_colors.get(tag, WHITE)
    print(f"  {c}[{tag}]{RESET}  {text}")


def _wants_repeat(answer: str) -> bool:
    s = (answer or "").strip().lower()
    if not s:
        return False
    if s in ("r", "repeat", "again"):
        return True
    return bool(s) and set(s) == {"r"}


def _progress(current, total):
    filled = round(current / total * 24)
    bar    = "█" * filled + "░" * (24 - filled)
    pct    = round(current / total * 100)
    print(f"\n  {DIM}Progress{RESET}  {CYAN}{bar}{RESET}  "
          f"{WHITE}{current}/{total}{RESET}  {DIM}({pct}%){RESET}\n")


def _question_card(q_num, total, level, question, arrow=""):
    level_colors = {"Easy": GREEN, "Medium": YELLOW, "Hard": RED}
    lc    = level_colors.get(level, WHITE)
    width = 56
    print(f"  {DIM}{'─' * width}{RESET}")
    print(f"  {WHITE}{BOLD}Question {q_num}{RESET}  {DIM}of {total}{RESET}"
          f"   {lc}[{level}]{RESET}  {arrow}")
    print(f"  {DIM}{'─' * width}{RESET}")
    words, line = question.split(), ""
    for word in words:
        if len(line) + len(word) + 1 > 52:
            print(f"  {WHITE}{line}{RESET}")
            line = word
        else:
            line = f"{line} {word}".strip()
    if line:
        print(f"  {WHITE}{line}{RESET}")
    print(f"  {DIM}{'─' * width}{RESET}\n")


# ─── AI Question Generation ───────────────────────────────────────────
def _call_openrouter_chat(prompt: str) -> str:
    referer   = os.getenv("OPENROUTER_HTTP_REFERER", "http://localhost")
    app_title = os.getenv("OPENROUTER_APP_TITLE",    "Interview App")
    resp = httpx.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type":  "application/json",
            "HTTP-Referer":  referer,
            "X-Title":       app_title,
        },
        json={
            "model":      OPENROUTER_MODEL,
            "max_tokens": 200,
            "messages":   [{"role": "user", "content": prompt}],
        },
        timeout=httpx.Timeout(20.0, connect=10.0),
    )
    if resp.status_code != 200:
        try:
            err = resp.json().get("error", {}).get("message", "Unknown API error")
        except ValueError:
            err = f"Non-JSON API error: {resp.text[:200]}"
        _log("WARN", f"OpenRouter {resp.status_code}: {err}")
        raise RuntimeError(err)
    choices = resp.json().get("choices")
    if not choices:
        raise RuntimeError("No choices returned")
    return choices[0].get("message", {}).get("content", "").strip()


def _call_anthropic_messages(prompt: str) -> str:
    resp = httpx.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key":         ANTHROPIC_API_KEY,
            "anthropic-version": ANTHROPIC_API_VERSION,
            "Content-Type":      "application/json",
        },
        json={
            "model":      ANTHROPIC_MODEL,
            "max_tokens": 200,
            "messages":   [{"role": "user", "content": prompt}],
        },
        timeout=httpx.Timeout(20.0, connect=10.0),
    )
    if resp.status_code != 200:
        try:
            err_obj = resp.json().get("error")
            err = err_obj.get("message", str(err_obj)) if isinstance(err_obj, dict) else str(err_obj)
        except ValueError:
            err = f"Non-JSON API error: {resp.text[:200]}"
        _log("WARN", f"Anthropic {resp.status_code}: {err}")
        raise RuntimeError(err)
    parts = []
    for block in resp.json().get("content", []):
        if isinstance(block, dict) and block.get("type") == "text":
            parts.append(block.get("text", ""))
    return "".join(parts).strip()


def _parse_model_question_response(text: str, buffered: bool = False):
    """
    Parse QUESTION/REASON lines from the model response.

    buffered=True  → the [AI] reason line goes into the background buffer
                     (used when called from a background thread so it doesn't
                     interleave with the countdown timer).
    buffered=False → the [AI] reason line is printed immediately (default,
                     used when called on the main thread before the timer starts).
    """
    if not text:
        return None
    question_line = ""
    reason_line   = ""
    for line in text.splitlines():
        if line.strip().lower().startswith("question:"):
            question_line = line.split(":", 1)[1].strip()
        elif line.strip().lower().startswith("reason:"):
            reason_line = line.split(":", 1)[1].strip()
    if question_line:
        if reason_line:
            if buffered:
                _bg_print(f"  {GREEN}[AI]{RESET}  {reason_line}")
            else:
                _log("AI", reason_line)
        return question_line, reason_line
    fallback_text = next(
        (ln.strip("- ").strip() for ln in text.splitlines() if ln.strip()), ""
    )
    if fallback_text:
        return fallback_text, "Model response parsed without QUESTION/REASON tags"
    return None


def ai_generate_question(level, history, results, topic="Python", buffered: bool = False):
    """
    Generate the next interview question.

    buffered=True  → any log output goes to the background print buffer
                     (safe to call from a ThreadPoolExecutor worker while the
                     countdown timer is running on the main thread).
    """
    history_str = ", ".join(history) if history else "None yet"
    performance = ", ".join([
        f"{r['level']}:{round(r['elapsed'], 1)}s" for r in results
    ]) if results else "No data yet"

    fallback_by_topic = {
        "Python": {
            "Easy":   ["What is a variable?", "What is a function?", "What is a loop?",
                       "What is a list?", "What is an if statement?"],
            "Medium": ["What is OOP?", "What is a decorator?", "What is recursion?",
                       "What is a dictionary?", "What is exception handling?"],
            "Hard":   ["What is a generator?", "What is multithreading?", "What is a closure?",
                       "What is a metaclass?", "What are design patterns?"]
        },
        "Java": {
            "Easy":   ["What is a class in Java?", "What is a method?", "What is JVM?",
                       "What is a constructor?", "What is an interface?"],
            "Medium": ["What is method overloading?", "What is inheritance?",
                       "What is exception handling in Java?", "What is encapsulation?",
                       "What is the difference between ArrayList and LinkedList?"],
            "Hard":   ["What is the Java memory model?", "What is garbage collection?",
                       "What is multithreading in Java?", "What is synchronization?",
                       "What is the difference between HashMap and ConcurrentHashMap?"]
        },
        "C++": {
            "Easy":   ["What is a pointer?", "What is a reference?", "What is a class?",
                       "What is a header file?", "What is a constructor?"],
            "Medium": ["What is polymorphism in C++?", "What is function overloading?",
                       "What is the difference between stack and heap?",
                       "What is STL?", "What is a virtual function?"],
            "Hard":   ["What is RAII?", "What is move semantics?", "What is smart pointer?",
                       "What is undefined behavior?", "What is template metaprogramming?"]
        },
        "SQL": {
            "Easy":   ["What is a PRIMARY KEY?", "What is SQL?", "What is SELECT?",
                       "What is WHERE clause?", "What is NULL in SQL?"],
            "Medium": ["What is a JOIN?", "What is GROUP BY?", "What is a subquery?",
                       "What is an index?", "What is HAVING clause?"],
            "Hard":   ["What is a CTE?", "What is RANK()?", "What is a trigger?",
                       "What is a deadlock?", "What are isolation levels?"]
        },
        "Frontend (HTML, CSS, JavaScript)": {
            "Easy":   ["What is HTML?", "What is CSS?", "What is a div?",
                       "What is a class in CSS?", "What is JavaScript?"],
            "Medium": ["What is the DOM?", "What is a Promise?", "What is flexbox?",
                       "What is an event listener?", "What is responsive design?"],
            "Hard":   ["What is a closure in JS?", "What is the event loop?", "What is hoisting?",
                       "What is async/await?", "What is a service worker?"]
        },
        "Backend (REST APIs, HTTP, Django/Node)": {
            "Easy":   ["What is an API?", "What is HTTP?", "What is a GET request?",
                       "What is JSON?", "What is a server?"],
            "Medium": ["What is REST?", "What is authentication?", "What is middleware?",
                       "What is a POST request?", "What is a status code?"],
            "Hard":   ["What is microservices?", "What is load balancing?", "What is Docker?",
                       "What is CI/CD?", "What is a message queue?"]
        },
        "DevOps and Cloud": {
            "Easy":   ["What is cloud computing?", "What is Docker?",
                       "What is a virtual machine?", "What is CI/CD?", "What is deployment?"],
            "Medium": ["What is Kubernetes?", "What is Infrastructure as Code?",
                       "What is auto-scaling?", "What is blue-green deployment?",
                       "What is observability?"],
            "Hard":   ["What is eventual consistency in distributed systems?",
                       "What is a service mesh?", "What is canary deployment strategy?",
                       "What is zero-downtime deployment?", "What is chaos engineering?"]
        },
        "Machine Learning": {
            "Easy":   ["What is machine learning?", "What is a dataset?",
                       "What is training data?", "What is a feature?", "What is classification?"],
            "Medium": ["What is overfitting?", "What is train-validation-test split?",
                       "What is precision vs recall?", "What is gradient descent?",
                       "What is regularization?"],
            "Hard":   ["What is bias-variance tradeoff?", "What is cross-validation?",
                       "What is batch normalization?", "What is explainability in ML?",
                       "What is the difference between bagging and boosting?"]
        },
        "Data Science and Statistics": {
            "Easy":   ["What is mean?", "What is median?", "What is standard deviation?",
                       "What is a histogram?", "What is correlation?"],
            "Medium": ["What is hypothesis testing?", "What is p-value?",
                       "What is confidence interval?", "What is sampling bias?",
                       "What is linear regression?"],
            "Hard":   ["What is multicollinearity?", "What is Bayesian inference?",
                       "What is Type I vs Type II error?", "What is heteroscedasticity?",
                       "What is A/B test power analysis?"]
        },
        "Cybersecurity": {
            "Easy":   ["What is encryption?", "What is a firewall?", "What is phishing?",
                       "What is malware?", "What is authentication?"],
            "Medium": ["What is SQL injection?", "What is XSS?",
                       "What is the principle of least privilege?", "What is hashing with salt?",
                       "What is multi-factor authentication?"],
            "Hard":   ["What is zero trust architecture?", "What is a man-in-the-middle attack?",
                       "What is CSRF protection?", "What is public key infrastructure?",
                       "What is threat modeling?"]
        },
        "Operating Systems": {
            "Easy":   ["What is a process?", "What is a thread?", "What is a file system?",
                       "What is RAM?", "What is a kernel?"],
            "Medium": ["What is context switching?", "What is virtual memory?",
                       "What is deadlock?", "What is scheduling?",
                       "What is the difference between process and thread?"],
            "Hard":   ["What is paging vs segmentation?", "What is starvation?",
                       "What is semaphore vs mutex?", "What is copy-on-write?",
                       "What is the producer-consumer problem?"]
        },
        "Computer Networks": {
            "Easy":   ["What is an IP address?", "What is a router?",
                       "What is DNS?", "What is HTTP?", "What is a packet?"],
            "Medium": ["What is TCP vs UDP?", "What is subnet mask?",
                       "What is latency?", "What is TLS?", "What is NAT?"],
            "Hard":   ["What is the TCP three-way handshake?",
                       "What is congestion control?", "What is CIDR?",
                       "What is BGP?", "What is load balancing at network layer?"]
        },
        "Mobile Development (Android/iOS)": {
            "Easy":   ["What is a mobile app lifecycle?", "What is an activity in Android?",
                       "What is Swift used for?", "What is a mobile SDK?",
                       "What is app permissions?"],
            "Medium": ["What is state management in mobile apps?",
                       "What is local storage on mobile?", "What is push notification?",
                       "What is responsive layout on mobile?", "What is API integration in apps?"],
            "Hard":   ["What is dependency injection in mobile development?",
                       "What is offline-first architecture?", "What is app sandboxing?",
                       "What is memory leak in mobile apps?", "What is deep linking?"]
        },
        "Software Testing and QA": {
            "Easy":   ["What is a unit test?", "What is a bug?",
                       "What is regression testing?", "What is test case?",
                       "What is quality assurance?"],
            "Medium": ["What is integration testing?", "What is mocking?",
                       "What is code coverage?", "What is end-to-end testing?",
                       "What is test automation?"],
            "Hard":   ["What is flaky test?", "What is contract testing?",
                       "What is mutation testing?", "What is shift-left testing?",
                       "What is risk-based testing?"]
        },
        "System Design": {
            "Easy":   ["What is scalability?", "What is availability?",
                       "What is a database?", "What is caching?", "What is a load balancer?"],
            "Medium": ["What is horizontal vs vertical scaling?",
                       "What is eventual consistency?", "What is sharding?",
                       "What is message queue?", "What is CDN?"],
            "Hard":   ["What is CAP theorem?", "What is distributed consensus?",
                       "What is idempotency?", "What is rate limiting strategy?",
                       "What is backpressure in distributed systems?"]
        },
        "Data Structures and Algorithms": {
            "Easy":   ["What is an array?", "What is a stack?", "What is a queue?",
                       "What is a linked list?", "What is Big O notation?"],
            "Medium": ["What is a binary tree?", "What is hashing?", "What is recursion?",
                       "What is a graph?", "What is dynamic programming?"],
            "Hard":   ["What is a red-black tree?", "What is Dijkstra algorithm?", "What is a heap?",
                       "What is memoization?", "What is a trie?"]
        }
    }
    generic_fallback_by_level = {
        "Easy":   [f"What is {topic}?", f"Why is {topic} important?",
                   f"What are the basic concepts of {topic}?"],
        "Medium": [f"What are key challenges when working with {topic}?",
                   f"What best practices are used in {topic}?"],
        "Hard":   [f"What advanced design trade-offs exist in {topic}?",
                   f"How would you optimize performance in {topic} systems?"]
    }
    fallback_questions = fallback_by_topic.get(topic, generic_fallback_by_level)

    if not has_api_key:
        import random
        asked = set(history)
        pool = [q for q in fallback_questions.get(level, fallback_questions["Medium"]) if q not in asked]
        if not pool:
            pool = fallback_questions.get(level, fallback_questions["Medium"])
        return random.choice(pool), "random fallback (missing API key)"

    prompt = f"""You are an AI technical interviewer assistant.

Generate ONE interview question about {topic} for a {level} level student.
Student performance so far: {performance}
Questions already asked (do NOT repeat): {history_str}

Rules:
- The question must be about {topic} concepts
- Must match the {level} difficulty level
- Must be different from questions already asked
- Keep it SHORT: one sentence only, at most 25 words
- Ask about definitions, differences, or explanations — NOT "write code"

Reply ONLY in this exact format:
QUESTION: <question text>
REASON: <why this question suits the student>
"""
    try:
        text   = _call_openrouter_chat(prompt) if OPENROUTER_API_KEY else _call_anthropic_messages(prompt)
        if not text:
            raise RuntimeError("Empty model response")
        parsed = _parse_model_question_response(text, buffered=buffered)
        if parsed:
            return parsed
    except httpx.RequestError as e:
        if buffered:
            _bg_print(f"  {YELLOW}[WARN]{RESET}  Network error — using fallback: {e}")
        else:
            _log("WARN", f"Network error — using fallback: {e}")
    except Exception as e:
        if buffered:
            _bg_print(f"  {YELLOW}[WARN]{RESET}  Claude error — using fallback: {e}")
        else:
            _log("WARN", f"Claude error — using fallback: {e}")

    import random
    asked = set(history)
    pool  = [q for q in fallback_questions.get(level, fallback_questions["Medium"]) if q not in asked]
    if not pool:
        pool = fallback_questions.get(level, fallback_questions["Medium"])
    return random.choice(pool), "fallback question"


# ─── TTS ──────────────────────────────────────────────────────────────
def setup_speaker():
    try:
        import subprocess
        ps_cmd = '''
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voices = $synth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Gender -eq "Male" }
if ($voices) { $synth.SelectVoice($voices[0].VoiceInfo.Name) }
$synth.Volume = 100
$synth.Speak("ready")
'''
        subprocess.run(["powershell", "-Command", ps_cmd], capture_output=True, timeout=30)
        _log("INFO", "TTS ready (PowerShell)")
        return "powershell"
    except Exception as e:
        _banner(f"TTS unavailable: {e}", "yellow")
        return None


def speak(spk, text):
    if not spk:
        return
    try:
        import subprocess
        safe = text.replace("'", " ")
        safe = re.sub(r'[`*_#@<>{}[\]|\\]', '', safe)
        safe = re.sub(r'\s+', ' ', safe).strip()
        if not safe:
            return
        tts_max  = 420
        to_speak = (safe[:tts_max].rsplit(" ", 1)[0] + " ... Rest is on screen."
                    if len(safe) > tts_max else safe)
        timeout_sec = min(120, max(25, 18 + len(to_speak) // 8))
        ps_cmd = (
            "Add-Type -AssemblyName System.Speech; "
            "$s = New-Object System.Speech.Synthesis.SpeechSynthesizer; "
            "$voices = $s.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Gender -eq 'Male' }; "
            "if ($voices) { $s.SelectVoice($voices[0].VoiceInfo.Name) }; "
            f"$s.Speak('{to_speak}')"
        )
        subprocess.run(["powershell", "-Command", ps_cmd], capture_output=True, timeout=timeout_sec)
    except Exception as e:
        _log("WARN", f"TTS error: {e}")


# ── TTS Queue — guarantees speeches never overlap ─────────────────────
import queue as _queue

_tts_queue: _queue.Queue         = _queue.Queue()
_tts_worker_started: bool        = False


def _tts_worker():
    while True:
        item = _tts_queue.get()
        if item is None:
            _tts_queue.task_done()
            break
        spk, text = item
        try:
            speak(spk, text)
        except Exception:
            pass
        _tts_queue.task_done()


def _ensure_tts_worker():
    global _tts_worker_started
    if not _tts_worker_started:
        t = threading.Thread(target=_tts_worker, daemon=True)
        t.start()
        _tts_worker_started = True


def speak_async(spk, text) -> None:
    if not spk or not text:
        return None
    _ensure_tts_worker()
    _tts_queue.put((spk, text))
    return None


def speak_async_wait() -> None:
    _tts_queue.join()


# ─── State File ───────────────────────────────────────────────────────
def _state_path(session_id=""):
    safe_session = (session_id or "").strip()
    if safe_session:
        safe_session = re.sub(r"[^a-zA-Z0-9._-]", "_", safe_session)
        return Path(f"state_{safe_session}.json")
    return Path(STATE_FILE)


def write_state(status, q_num=0, question="", level="", name="", session_id="", topic=""):
    global sessions_store
    state = {
        "session_id":   session_id,
        "status":       status,
        "question_num": q_num,
        "question":     question,
        "level":        level,
        "student_name": name,
        "topic":        topic,
        "timestamp":    datetime.now().isoformat(),
    }
    sessions_store[session_id] = state
    _state_path(session_id).write_text(json.dumps(state, indent=2, ensure_ascii=False))


def save_log(name, q_num, question, level, topic, answer, elapsed, adapted, reason):
    name     = _sanitize_log_field(name)
    question = _sanitize_log_field(question)
    topic    = _sanitize_log_field(topic)
    answer   = _sanitize_log_field(answer)
    reason   = _sanitize_log_field(reason)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(
            f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | "
            f"{name} | {topic} | Q{q_num} | [{level}] | {question} | "
            f"{answer} | {elapsed:.2f}s | adapt:{adapted} | reason:{reason}\n"
        )


# ─── Countdown Timer ──────────────────────────────────────────────────
def countdown_timer(seconds, stop_event):
    timed_out = True
    for remaining in range(math.ceil(seconds), 0, -1):
        if stop_event.is_set():
            timed_out = False
            break
        filled  = round((seconds - remaining) / seconds * 10)
        bar     = "█" * filled + "░" * (10 - filled)
        urgency = RED if remaining <= 10 else YELLOW if remaining <= 20 else GREEN
        _real_stdout.write(f"  {urgency}[{bar}]  {remaining:2d}s{RESET}\n")
        _real_stdout.flush()
        time.sleep(1)
    if timed_out:
        _real_stdout.write(f"  {DIM}[{'█' * 10}]  Done{RESET}\n")
        _real_stdout.flush()
        stop_event.set()


def timed_input_with_countdown(seconds):
    prompt        = f"  {CYAN}Your answer (r + Enter to repeat):{RESET}  "
    total_seconds = max(1, int(seconds))
    start         = time.perf_counter()
    typed         = []
    shown_remaining = None
    while True:
        elapsed   = time.perf_counter() - start
        remaining = max(0, math.ceil(seconds - elapsed))
        if remaining != shown_remaining:
            filled  = max(0, min(10, round((total_seconds - remaining) / total_seconds * 10)))
            bar     = "█" * filled + "░" * (10 - filled)
            urgency = RED if remaining <= 10 else YELLOW if remaining <= 20 else GREEN
            print(f"\r{prompt}{''.join(typed)}  {urgency}[{bar}]  {remaining:2d}s{RESET}" + " " * 8,
                  end="", flush=True)
            shown_remaining = remaining
        if msvcrt.kbhit():
            ch = msvcrt.getwch()
            if ch in ("\x00", "\xe0"):
                if msvcrt.kbhit():
                    msvcrt.getwch()
                continue
            if ch in ("\r", "\n"):
                print()
                return "".join(typed), False
            if ch == "\003":
                raise KeyboardInterrupt
            if ch in ("\b", "\x7f"):
                if typed:
                    typed.pop()
            elif ch >= " ":
                typed.append(ch)
        if elapsed >= seconds:
            print()
            return "", True
        time.sleep(0.03)


# ─── Answer Input (Voice + Keyboard fallback) ─────────────────────────
def get_answer(spk, question, q_num, level, time_limit,
               student_name="", session_id="", from_api=False):
    global answers_store, answers_lock, sessions_store

    if from_api:
        with answers_lock:
            answers_store.pop(session_id, None)
        start       = time.perf_counter()
        paused_time = 0.0
        repeat_count = 0
        while (time.perf_counter() - start - paused_time) < time_limit:
            state = sessions_store.get(session_id)
            if state and state.get("status") == "stopped":
                return "", 0
            with answers_lock:
                answer = answers_store.pop(session_id, None)
            if answer is not None:
                if _wants_repeat(answer):
                    if repeat_count >= 1:
                        pause_start  = time.perf_counter()
                        speak(spk, "No more repeats allowed.")
                        paused_time += time.perf_counter() - pause_start
                    else:
                        repeat_count += 1
                        pause_start  = time.perf_counter()
                        speak(spk, f"Question again. {question}")
                        paused_time += time.perf_counter() - pause_start
                else:
                    return answer, time.perf_counter() - start - paused_time
            time.sleep(0.3)
        speak(spk, "Time is up.")
        return "", time_limit

    # ── Interactive mode (voice or keyboard) ──────────────────────────
    overall_start = time.perf_counter()
    paused_time   = 0.0
    repeat_count  = 0

    while True:
        active_elapsed = time.perf_counter() - overall_start - paused_time
        remaining      = time_limit - active_elapsed
        if remaining <= 0:
            speak(spk, "Time is up.")
            return "", time_limit

        stop_event   = threading.Event()
        timer_thread = None

        try:
            if _use_voice:
                timer_thread = threading.Thread(
                    target=countdown_timer, args=(remaining, stop_event), daemon=True
                )
                timer_thread.start()
                _real_stdout.write(f"\n  {CYAN}Speak your answer now (or press Enter to type):{RESET}\n")
                _real_stdout.flush()
                answer = _capture_voice_answer(stop_event=stop_event)
                if answer is None:
                    _real_stdout.write(f"  {YELLOW}No voice detected — type your answer:{RESET}\n")
                    _real_stdout.flush()
                    answer = input(f"  {WHITE}> {RESET}")
                elapsed = time.perf_counter() - overall_start - paused_time

            else:
                timer_thread = threading.Thread(
                    target=countdown_timer, args=(remaining, stop_event), daemon=True
                )
                timer_thread.start()
                _real_stdout.write(f"\n  {CYAN}Your answer (r + Enter = repeat, else type + Enter):{RESET}\n")
                _real_stdout.flush()
                answer  = input(f"  {WHITE}> {RESET}")
                elapsed = time.perf_counter() - overall_start - paused_time

        except KeyboardInterrupt:
            answer, elapsed = "", 0
        finally:
            stop_event.set()
            if timer_thread is not None:
                timer_thread.join(timeout=2.0)

        if _wants_repeat(answer):
            if repeat_count >= 1:
                pause_start  = time.perf_counter()
                speak(spk, "No more repeats allowed.")
                paused_time += time.perf_counter() - pause_start
            else:
                repeat_count += 1
                pause_start  = time.perf_counter()
                speak(spk, f"Question again. {question}")
                paused_time += time.perf_counter() - pause_start
            continue

        return answer, elapsed


# ─── Adaptive Difficulty ──────────────────────────────────────────────
def get_next_level(current_level, elapsed):
    idx = LEVELS.index(current_level)
    if elapsed < FAST_THRESHOLD:
        new_idx = min(idx + 1, len(LEVELS) - 1)
        arrow   = f"{GREEN}Upgrading to {LEVELS[new_idx]}{RESET}"
        adapted = "up"
    elif elapsed > SLOW_THRESHOLD:
        new_idx = max(idx - 1, 0)
        arrow   = f"{YELLOW}Downgrading to {LEVELS[new_idx]}{RESET}"
        adapted = "down"
    else:
        new_idx = idx
        arrow   = ""
        adapted = "same"
    return LEVELS[new_idx], arrow, adapted


# ─── Summary ──────────────────────────────────────────────────────────
def print_summary(name, total_time, results):
    _banner("INTERVIEW SUMMARY", "cyan")
    print(f"  {DIM}Student    {RESET}{WHITE}{name}{RESET}")
    print(f"  {DIM}Total time {RESET}{WHITE}{total_time:.0f}s{RESET}")
    print(f"  {DIM}Questions  {RESET}{WHITE}{len(results)}{RESET}\n")
    print(f"  {DIM}{'─' * 56}{RESET}")
    for r in results:
        lc     = {"Easy": GREEN, "Medium": YELLOW, "Hard": RED}.get(r["level"], WHITE)
        timing = (f"{GREEN}fast{RESET}"   if r["elapsed"] < FAST_THRESHOLD else
                  f"{RED}slow{RESET}"     if r["elapsed"] > SLOW_THRESHOLD else
                  f"{DIM}normal{RESET}")
        print(f"  Q{r['q_num']}  {lc}[{r['level']:6}]{RESET}  {timing}  {DIM}{r['elapsed']:.1f}s{RESET}")
    print(f"  {DIM}{'─' * 56}{RESET}\n")


# ─── Main ─────────────────────────────────────────────────────────────
def run_interview(student_name: str = None, session_id: str = "",
                  from_api: bool = False, topic: str = ""):
    if session_id:
        existing_state = sessions_store.get(session_id)
        if existing_state and existing_state.get("status") == "stopped":
            _log("INFO", "Interview was stopped before start")
            return

    # ───────────────── Camera ─────────────────
    camera_monitor = None
    try:
        from camera.core.monitor import InterviewMonitor
        _cm = InterviewMonitor()
        if _cm.initialize():
            camera_monitor = _cm
            _log("INFO", "Camera monitoring initialized")
        else:
            _log("WARN", "Camera monitoring failed to initialize")
    except Exception as exc:
        _log("WARN", f"Camera monitoring unavailable: {exc}")

    use_server_tts = os.getenv("SERVER_TTS", "").strip().lower() in ("1", "true", "yes", "on")
    spk            = setup_speaker() if (not from_api or use_server_tts) else None

    total         = 5
    results       = []
    history       = []
    current_level = "Medium"
    q_num         = 0

    _banner("AI TECHNICAL INTERVIEWER", "cyan")
    speak_async(spk, "Welcome to your technical interview.")

    if student_name:
        name = student_name
    else:
        while not (name := input(f"  {DIM}Your name:{RESET}  ").strip()):
            print(f"  {RED}Name cannot be empty.{RESET}")

    _init_voice(topic)

    print(f"\n  {GREEN}✓ Topic: {topic}{RESET}\n")
    speak_async_wait()

    interview_start = time.perf_counter()

    # ───────────── Start Camera ─────────────
    camera_thread = None
    if camera_monitor:
        try:
            camera_session_id = session_id if session_id else f"interview_{int(time.time())}"
            camera_monitor.start_session(camera_session_id, name)
            camera_thread = threading.Thread(target=camera_monitor.run, daemon=False)
            camera_thread.start()
            _log("INFO", f"{GREEN}Camera monitoring started{RESET}")
        except Exception as e:
            _log("WARN", f"Camera error: {e}")

    import concurrent.futures
    executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
    next_question_future = None

    # ───────────── MAIN LOOP ─────────────
    for idx in range(total):
        q_num = idx + 1

        # ── Get question ──
        if next_question_future:
            try:
                question, reason = next_question_future.result()
            except:
                question, reason = "", ""
            next_question_future = None
        else:
            question, reason = ai_generate_question(
                current_level, history, results, topic
            )

        history.append(question)

        level = current_level
        time_limit = get_time_limit(level)

        # ───────────────── IMPORTANT FIX ─────────────────
        # 🔒 Prevent camera logs / background prints from mixing
        _start_buffering()

        _progress(q_num, total)
        _question_card(q_num, total, level, question)

        _flush_bg_prints()
        # ────────────────────────────────────────────────

        write_state("waiting", q_num, question, level, name, session_id, topic)

        # ── TTS (after question display) ──
        speak_async(spk, f"Question {q_num}. {question}")
        speak_async(spk, f"You have {time_limit} seconds to answer.")
        speak_async_wait()

        print(f"\n  {CYAN}⏳ Timer starts now...{RESET}")
        time.sleep(1)

        write_state("recording", q_num, question, level, name, session_id, topic)

        # ── Pre-generate next question ──
        if idx < total - 1:
            next_question_future = executor.submit(
                ai_generate_question,
                current_level, list(history), list(results), topic, True
            )

        # ── Answer phase ──
        _start_buffering()

        answer, elapsed = get_answer(
            spk, question, q_num, level, time_limit,
            student_name=name, session_id=session_id, from_api=from_api
        )

        _flush_bg_prints()

        if answer == "" and elapsed == 0:
            break

        current_level, arrow, adapted = get_next_level(current_level, elapsed)

        results.append({
            "q_num": q_num,
            "level": level,
            "elapsed": elapsed
        })

    # ───────────── END ─────────────
    total_time = time.perf_counter() - interview_start
    
    # Stop camera monitoring
    if camera_monitor:
        try:
            camera_monitor.running = False
            if camera_thread and camera_thread.is_alive():
                camera_thread.join(timeout=2.0)
        except Exception:
            pass
    
    _banner("INTERVIEW FINISHED", "green")
    print_summary(name, total_time, results)
    
    # Final message and cleanup
    print(f"\n  {GREEN}✓ Interview completed successfully!{RESET}")
    print(f"  {DIM}Thank you for using the AI Interview System.{RESET}")
    print(f"  {DIM}Your results have been logged to {WHITE}{LOG_FILE}{RESET}\n")
    
    # Cleanup voice resources
    if _audio_capture:
        try:
            _audio_capture.close()
        except Exception:
            pass
# ─── Entry Point ──────────────────────────────────────────────────────
if __name__ == "__main__":
    run_interview()