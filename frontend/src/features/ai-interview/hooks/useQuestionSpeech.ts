import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const AUTOPLAY_GUARD_MS = 1500;

const pickVoice = (voices: SpeechSynthesisVoice[]) => {
  if (!voices.length) return null;

  return (
    voices.find((voice) => voice.localService && voice.lang.toLowerCase().startsWith('en')) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith('en')) ||
    voices.find((voice) => voice.default) ||
    voices[0] ||
    null
  );
};

export const useQuestionSpeech = (questionText?: string, enabled = true) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechBlocked, setSpeechBlocked] = useState(false);

  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const autoplayTimeoutRef = useRef<number | null>(null);
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof window.SpeechSynthesisUtterance !== 'undefined';

    setSpeechSupported(supported);
    synthesisRef.current = supported ? window.speechSynthesis : null;
  }, []);

  const cancel = useCallback(() => {
    if (autoplayTimeoutRef.current !== null) {
      window.clearTimeout(autoplayTimeoutRef.current);
      autoplayTimeoutRef.current = null;
    }

    utteranceRef.current = null;
    synthesisRef.current?.cancel();
    setIsSpeaking(false);
    isSpeakingRef.current = false;
  }, []);

  const reset = useCallback(() => {
    cancel();
    setHasSpoken(false);
    setSpeechBlocked(false);
  }, [cancel]);

  const speak = useCallback(
    (mode: 'auto' | 'manual' = 'manual') => {
      const text = String(questionText || '').trim();
      if (!enabled || !text || !synthesisRef.current || !speechSupported) {
        return false;
      }

      reset();

      const utterance = new SpeechSynthesisUtterance(text);
      const voices = synthesisRef.current.getVoices();
      const preferredVoice = pickVoice(voices);

      if (preferredVoice) {
        utterance.voice = preferredVoice;
        utterance.lang = preferredVoice.lang;
      } else {
        utterance.lang = 'en-US';
      }

      utterance.rate = 0.98;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        if (autoplayTimeoutRef.current !== null) {
          window.clearTimeout(autoplayTimeoutRef.current);
          autoplayTimeoutRef.current = null;
        }
        setIsSpeaking(true);
        isSpeakingRef.current = true;
        setSpeechBlocked(false);
      };

      utterance.onend = () => {
        if (autoplayTimeoutRef.current !== null) {
          window.clearTimeout(autoplayTimeoutRef.current);
          autoplayTimeoutRef.current = null;
        }
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        setHasSpoken(true);
        utteranceRef.current = null;
      };

      utterance.onerror = () => {
        if (autoplayTimeoutRef.current !== null) {
          window.clearTimeout(autoplayTimeoutRef.current);
          autoplayTimeoutRef.current = null;
        }
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        setSpeechBlocked(mode === 'auto');
        utteranceRef.current = null;
      };

      utteranceRef.current = utterance;
      synthesisRef.current.speak(utterance);

      if (mode === 'auto') {
        autoplayTimeoutRef.current = window.setTimeout(() => {
          if (!isSpeakingRef.current && utteranceRef.current === utterance) {
            setSpeechBlocked(true);
            setHasSpoken(false);
            synthesisRef.current?.cancel();
            utteranceRef.current = null;
          }
        }, AUTOPLAY_GUARD_MS);
      }

      return true;
    },
    [enabled, questionText, reset, speechSupported]
  );

  useEffect(() => {
    const text = String(questionText || '').trim();
    reset();

    if (!text) {
      return;
    }

    if (!speechSupported || !enabled) {
      return;
    }

    const handleVoicesChanged = () => {
      synthesisRef.current?.getVoices();
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    handleVoicesChanged();

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    };
  }, [enabled, questionText, reset, speechSupported]);

  useEffect(() => () => cancel(), [cancel]);

  return useMemo(
    () => ({
      isSpeaking,
      hasSpoken,
      speechSupported,
      speechBlocked,
      speak,
      cancel,
      reset,
    }),
    [cancel, hasSpoken, isSpeaking, reset, speak, speechBlocked, speechSupported]
  );
};
