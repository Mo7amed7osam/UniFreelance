"""
Enhanced Speech-to-Text System with Professional Accuracy
"""
import io
import re
import json
import time
from typing import Optional, Dict, List, Tuple
from dataclasses import dataclass
from groq import Groq
import numpy as np

from .voice_config import GROQ_API_KEY, STT_MODEL


@dataclass
class TranscriptionResult:
    """Enhanced transcription result with metadata"""
    text: str
    confidence: float
    duration: float
    language: str
    domain: str
    cleaned_text: str
    technical_terms: List[str]
    is_valid: bool


class EnhancedSpeechToText:
    """Professional speech-to-text with enhanced accuracy"""
    
    def __init__(self, domain: str = "", language: str = "en"):
        self._client = Groq(api_key=GROQ_API_KEY)
        self.domain = domain.lower().strip()
        self.language = language
        
        # Enhanced domain prompts with more technical context
        self._domain_prompts = self._get_enhanced_domain_prompts()
        
        # Technical terms by domain
        self._technical_terms = self._get_technical_terms()
        
        # Confidence thresholds
        self._min_confidence = 0.7
        self._min_words = 2
        
        # Hallucination patterns
        self._hallucination_patterns = self._get_hallucination_patterns()
        
    def _get_enhanced_domain_prompts(self) -> Dict[str, str]:
        """Get enhanced domain-specific prompts"""
        return {
            "network": (
                "Technical networking interview. Focus on: TCP/IP protocols, OSI model layers, "
                "routing protocols (OSPF, BGP), switching concepts (VLAN, STP), network security "
                "(firewalls, VPN, ACLs), subnetting, NAT, DHCP, DNS resolution, troubleshooting methodologies. "
                "Expect precise technical terminology and industry-standard acronyms."
            ),
            "backend": (
                "Backend development interview. Focus on: REST API design, HTTP methods/status codes, "
                "database concepts (SQL vs NoSQL, ACID properties, indexing, query optimization), "
                "authentication/authorization (JWT, OAuth, sessions), caching strategies (Redis, CDN), "
                "microservices architecture, containerization (Docker, Kubernetes), scalability patterns, "
                "async programming, ORM frameworks, API security best practices."
            ),
            "frontend": (
                "Frontend development interview. Focus on: HTML5 semantic elements, CSS3 layouts (Flexbox, Grid), "
                "JavaScript ES6+ features (promises, async/await, destructuring), React ecosystem (hooks, state management, "
                "component lifecycle), performance optimization, responsive design, accessibility (WCAG), "
                "build tools (Webpack, Vite), TypeScript benefits, DOM manipulation, event handling."
            ),
            "python": (
                "Python programming interview. Focus on: data structures (lists, dicts, sets, tuples), "
                "OOP concepts (inheritance, polymorphism, encapsulation), decorators, generators, context managers, "
                "GIL and threading, async programming, standard library modules, testing frameworks, virtual environments, "
                "package management, Pythonic idioms, memory management, exception handling."
            ),
            "java": (
                "Java programming interview. Focus on: JVM internals, garbage collection, collections framework, "
                "multithreading and concurrency, design patterns, Spring framework, dependency injection, "
                "exception hierarchy, generics, lambda expressions, streams API, memory management, "
                "class loading, serialization, JPA/Hibernate, unit testing with JUnit."
            ),
            "cpp": (
                "C++ programming interview. Focus on: memory management (smart pointers, RAII), STL containers and algorithms, "
                "OOP principles, templates and metaprogramming, virtual functions and polymorphism, move semantics, "
                "concurrency (std::thread, std::mutex), const correctness, operator overloading, exception safety, "
                "preprocessor directives, build systems, modern C++ features (C++11/14/17/20)."
            ),
            "sql": (
                "SQL database interview. Focus on: JOIN types (inner, outer, cross, self), aggregate functions, "
                "subqueries and CTEs, window functions, indexing strategies, transaction management (ACID), "
                "normalization forms, query optimization, stored procedures, triggers, views, constraints, "
                "database design principles, NoSQL vs SQL differences."
            ),
            "devops": (
                "DevOps interview. Focus on: CI/CD pipelines, containerization (Docker, Kubernetes), "
                "infrastructure as code (Terraform, Ansible), monitoring and logging (Prometheus, Grafana, ELK), "
                "cloud platforms (AWS, Azure, GCP), version control (Git), automated testing, deployment strategies, "
                "microservices, load balancing, auto-scaling, security best practices."
            ),
            "machine learning": (
                "Machine learning interview. Focus on: supervised/unsupervised learning, neural networks, "
                "deep learning architectures (CNN, RNN, Transformer), training/validation/test sets, overfitting, "
                "regularization techniques, gradient descent optimization, backpropagation, feature engineering, "
                "model evaluation metrics, hyperparameter tuning, ML frameworks (TensorFlow, PyTorch)."
            ),
            "cybersecurity": (
                "Cybersecurity interview. Focus on: network security, encryption algorithms, authentication methods, "
                "vulnerability assessment, penetration testing, security frameworks, incident response, "
                "OWASP top 10, secure coding practices, risk management, compliance standards, security tools."
            )
        }
        
    def _get_technical_terms(self) -> Dict[str, List[str]]:
        """Get technical terms by domain"""
        return {
            "network": [
                "TCP", "UDP", "IP", "DNS", "DHCP", "OSI", "NAT", "firewall", "router", "switch", 
                "hub", "VLAN", "subnet", "gateway", "latency", "bandwidth", "MAC", "ARP", "ICMP", 
                "VPN", "SSL", "TLS", "HTTP", "HTTPS", "FTP", "SSH", "packet", "frame", "protocol"
            ],
            "backend": [
                "REST", "API", "HTTP", "JSON", "SQL", "NoSQL", "database", "authentication", 
                "authorization", "caching", "Redis", "microservices", "Docker", "Kubernetes", 
                "scalability", "concurrency", "async", "ORM", "index", "query", "endpoint", 
                "middleware", "server", "client", "request", "response"
            ],
            "frontend": [
                "HTML", "CSS", "JavaScript", "React", "Vue", "DOM", "API", "fetch", "JSON", 
                "responsive", "accessibility", "TypeScript", "Webpack", "Vite", "component", 
                "state", "props", "hooks", "flexbox", "grid", "selector", "element", "attribute"
            ],
            "python": [
                "list", "dict", "set", "tuple", "class", "inheritance", "polymorphism", "decorator", 
                "generator", "context", "manager", "GIL", "threading", "async", "module", "package", 
                "pip", "virtualenv", "exception", "try", "except", "lambda", "comprehension"
            ],
            "java": [
                "JVM", "garbage", "collection", "framework", "Spring", "dependency", "injection", 
                "JUnit", "interface", "abstract", "override", "implements", "extends", "static", 
                "final", "private", "public", "protected", "package", "import", "class", "method"
            ],
            "cpp": [
                "pointer", "reference", "memory", "management", "STL", "template", "virtual", 
                "override", "const", "static", "namespace", "include", "header", "implementation", 
                "compiler", "linker", "makefile", "CMake", "smart", "pointer", "unique", "shared"
            ],
            "sql": [
                "SELECT", "INSERT", "UPDATE", "DELETE", "JOIN", "INNER", "OUTER", "LEFT", "RIGHT", 
                "GROUP", "BY", "ORDER", "HAVING", "WHERE", "AND", "OR", "NOT", "NULL", "PRIMARY", 
                "KEY", "FOREIGN", "INDEX", "VIEW", "TRIGGER", "PROCEDURE", "TRANSACTION", "COMMIT"
            ],
            "devops": [
                "CI", "CD", "pipeline", "Docker", "Kubernetes", "Terraform", "Ansible", "Prometheus", 
                "Grafana", "AWS", "Azure", "GCP", "Git", "deployment", "monitoring", "logging", 
                "container", "orchestration", "infrastructure", "automation", "scaling", "load", "balancer"
            ],
            "machine learning": [
                "neural", "network", "gradient", "descent", "backpropagation", "overfitting", 
                "regularization", "CNN", "RNN", "Transformer", "PyTorch", "TensorFlow", "training", 
                "validation", "loss", "function", "hyperparameter", "embedding", "feature", "engineering"
            ]
        }
        
    def _get_hallucination_patterns(self) -> List[re.Pattern]:
        """Get enhanced hallucination detection patterns"""
        return [
            # Non-English characters
            re.compile(r"[^\x00-\x7F\u00C0-\u024F\u1E00-\u1EFF]"),
            
            # Common transcription artifacts
            re.compile(r"\b(facultad|inkamaaaal|адиcumi|misontion|instructor and director)\b", re.IGNORECASE),
            re.compile(r"\b(transcription by|translated by|subtitles by|amara\.org)\b", re.IGNORECASE),
            
            # Repetitive characters
            re.compile(r"(.)\1{4,}"),
            
            # Generic filler phrases
            re.compile(r"\binformation depending\b", re.IGNORECASE),
            re.compile(r"\bdepending on the evidence\b", re.IGNORECASE),
            re.compile(r"\bto refuse you\b", re.IGNORECASE),
            
            # YouTube/social media artifacts
            re.compile(r"\b(subscribe|like|share|comment|follow)\b", re.IGNORECASE),
            re.compile(r"\b(thank you for watching|see you next time|goodbye everyone)\b", re.IGNORECASE),
            
            # Incomplete sentences
            re.compile(r"^[a-z]{1,3}\s*$"),
            re.compile(r"^\W+$"),
            
            # Technical gibberish
            re.compile(r"\b(nhātologic|nh|um|uh|er|ah)\b", re.IGNORECASE),
        ]
        
    def transcribe(self, wav_bytes: bytes, enhance_accuracy: bool = True) -> Optional[TranscriptionResult]:
        """
        Transcribe audio with enhanced accuracy and validation
        
        Args:
            wav_bytes: Audio data in WAV format
            enhance_accuracy: Whether to apply accuracy enhancements
            
        Returns:
            TranscriptionResult with enhanced metadata
        """
        if len(wav_bytes) < 8_000:
            return None
            
        start_time = time.time()
        
        try:
            # Prepare audio file
            audio_file = io.BytesIO(wav_bytes)
            audio_file.name = "interview_answer.wav"
            
            # Get domain-specific prompt
            domain_prompt = self._domain_prompts.get(self.domain, 
                "Technical job interview. Expect precise technical terminology and industry-standard concepts.")
            
            prompt = "The candidate answers: " + domain_prompt
            
            # Transcribe with Groq
            result = self._client.audio.transcriptions.create(
                file=audio_file,
                model=STT_MODEL,
                language=self.language,
                response_format="text",
                temperature=0.0,
                prompt=prompt,
            )
            
            raw_text = (result or "").strip()
            duration = time.time() - start_time
            
            if not raw_text:
                return None
                
            # Enhanced processing
            if enhance_accuracy:
                processed_text = self._enhance_transcription(raw_text)
                confidence = self._calculate_confidence(raw_text, processed_text)
                technical_terms = self._extract_technical_terms(processed_text)
                is_valid = self._validate_transcription(processed_text)
            else:
                processed_text = raw_text.lower()
                confidence = 0.8
                technical_terms = []
                is_valid = len(processed_text.split()) >= self._min_words
            
            return TranscriptionResult(
                text=raw_text,
                confidence=confidence,
                duration=duration,
                language=self.language,
                domain=self.domain,
                cleaned_text=processed_text,
                technical_terms=technical_terms,
                is_valid=is_valid
            )
            
        except Exception as exc:
            print(f"[Enhanced STT Error] {exc}")
            return None
            
    def _enhance_transcription(self, text: str) -> str:
        """Enhance transcription with post-processing"""
        # Convert to lowercase
        enhanced = text.lower()
        
        # Remove common filler words
        filler_words = {"um", "uh", "er", "ah", "like", "you know", "i mean", "basically"}
        for filler in filler_words:
            enhanced = enhanced.replace(filler, "")
        
        # Fix common technical term misrecognitions
        corrections = {
            "a p i": "API",
            "r e s t": "REST",
            "s q l": "SQL",
            "j s": "JavaScript",
            "c s s": "CSS",
            "h t m l": "HTML",
            "u i": "UI",
            "u x": "UX",
            "c i c d": "CI/CD",
            "d o c k e r": "Docker",
            "kubernetes": "Kubernetes",
            "python": "Python",
            "java": "Java",
            "c plus plus": "C++",
            "node js": "Node.js",
            "react js": "React",
            "vue js": "Vue"
        }
        
        for incorrect, correct in corrections.items():
            enhanced = enhanced.replace(incorrect, correct)
        
        # Clean up extra whitespace
        enhanced = re.sub(r'\s+', ' ', enhanced).strip()
        
        return enhanced
        
    def _calculate_confidence(self, raw_text: str, processed_text: str) -> float:
        """Calculate confidence score for transcription"""
        confidence = 0.8  # Base confidence
        
        # Length factor
        word_count = len(processed_text.split())
        if word_count >= 10:
            confidence += 0.1
        elif word_count < 3:
            confidence -= 0.2
            
        # Technical terms factor
        if self.domain in self._technical_terms:
            domain_terms = self._technical_terms[self.domain]
            found_terms = sum(1 for term in domain_terms if term.lower() in processed_text.lower())
            if found_terms > 0:
                confidence += min(found_terms * 0.05, 0.15)
                
        # Structure factor
        if any(punct in processed_text for punct in ".!?"):
            confidence += 0.05
            
        # No obvious hallucinations
        if not any(pattern.search(processed_text) for pattern in self._hallucination_patterns):
            confidence += 0.05
            
        return min(confidence, 1.0)
        
    def _extract_technical_terms(self, text: str) -> List[str]:
        """Extract technical terms from transcription"""
        if self.domain not in self._technical_terms:
            return []
            
        domain_terms = self._technical_terms[self.domain]
        found_terms = []
        
        text_lower = text.lower()
        for term in domain_terms:
            if term.lower() in text_lower:
                found_terms.append(term)
                
        return found_terms
        
    def _validate_transcription(self, text: str) -> bool:
        """Validate transcription quality"""
        # Minimum word count
        if len(text.split()) < self._min_words:
            return False
            
        # Check for hallucinations
        if any(pattern.search(text) for pattern in self._hallucination_patterns):
            return False
            
        # Check for meaningful content
        meaningful_words = {"what", "how", "why", "when", "where", "because", "since", "due", "therefore"}
        if not any(word in text.lower() for word in meaningful_words):
            # Allow if technical terms are present
            if self.domain in self._technical_terms:
                domain_terms = self._technical_terms[self.domain]
                if not any(term.lower() in text.lower() for term in domain_terms):
                    return False
            else:
                return False
                
        return True
        
    def get_domain_suggestions(self, partial_text: str) -> List[str]:
        """Get domain-specific suggestions for partial transcription"""
        if self.domain not in self._technical_terms:
            return []
            
        domain_terms = self._technical_terms[self.domain]
        suggestions = []
        
        text_lower = partial_text.lower()
        for term in domain_terms:
            if term.lower().startswith(text_lower.split()[-1]):
                suggestions.append(term)
                
        return suggestions[:5]  # Return top 5 suggestions
        
    def get_transcription_stats(self) -> Dict:
        """Get transcription statistics"""
        return {
            "domain": self.domain,
            "language": self.language,
            "technical_terms_count": len(self._technical_terms.get(self.domain, [])),
            "min_confidence_threshold": self._min_confidence,
            "min_words_required": self._min_words,
            "supported_domains": list(self._domain_prompts.keys())
        }


# Backward compatibility
class SpeechToText(EnhancedSpeechToText):
    """Backward compatible SpeechToText class"""
    
    def __init__(self, domain: str = ""):
        super().__init__(domain=domain)
        
    def transcribe(self, wav_bytes: bytes) -> Optional[str]:
        """Legacy transcribe method returning just text"""
        result = super().transcribe(wav_bytes, enhance_accuracy=True)
        return result.cleaned_text if result and result.is_valid else None
