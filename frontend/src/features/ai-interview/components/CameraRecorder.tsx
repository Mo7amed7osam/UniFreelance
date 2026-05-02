import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { useVideoRecorder } from '../hooks/useVideoRecorder';

interface CameraRecorderProps {
  disabled?: boolean;
  questionKey: string;
  onVideoReady: (file: File) => void;
}

export const CameraRecorder: React.FC<CameraRecorderProps> = ({
  disabled,
  questionKey,
  onVideoReady,
}) => {
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [screenRequested, setScreenRequested] = useState(false);
  const {
    cleanup,
    error,
    isRecording,
    isStartingScreenShare,
    recordedUrl,
    resetRecording,
    startScreenShare,
    startRecording,
    stopRecording,
    stream,
  } = useVideoRecorder();

  useEffect(() => {
    resetRecording();
    setSeconds(0);
  }, [questionKey, resetRecording]);

  useEffect(() => {
    if (!previewRef.current) return;

    if (recordedUrl) {
      previewRef.current.srcObject = null;
      previewRef.current.src = recordedUrl;
      return;
    }

    if (stream) {
      previewRef.current.srcObject = stream;
      previewRef.current.muted = true;
      void previewRef.current.play().catch(() => undefined);
    }
  }, [recordedUrl, stream]);

  useEffect(() => {
    if (!isRecording) return undefined;

    const timer = window.setInterval(() => {
      setSeconds((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
    if (seconds < 90 || !isRecording) return;

    void stopRecording().then((file) => {
      if (file) onVideoReady(file);
    });
  }, [isRecording, onVideoReady, seconds, stopRecording]);

  const handleRequestScreenShare = async () => {
    try {
      const activeStream = await startScreenShare();
      setScreenRequested(true);
      return activeStream;
    } catch {
      setScreenRequested(false);
      return null;
    }
  };

  const handleStartRecording = async () => {
    let activeStream = stream;
    if (!activeStream) {
      activeStream = await handleRequestScreenShare();
      if (!activeStream) {
        return;
      }
    }

    setSeconds(0);
    try {
      startRecording();
    } catch {
      // Error text is already set inside useVideoRecorder.
    }
  };

  const handleStopRecording = async () => {
    try {
      const file = await stopRecording();
      if (file) {
        onVideoReady(file);
      }
    } catch {
      // Error text is already set inside useVideoRecorder.
    }
  };

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }, [seconds]);

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <video
          ref={previewRef}
          className="aspect-video w-full rounded-lg bg-ink-950"
          autoPlay
          playsInline
          muted={!recordedUrl}
          controls={Boolean(recordedUrl)}
        />

        {error ? <p className="text-sm text-rose-500">{error}</p> : null}

        {isRecording ? (
          <p className="text-sm font-medium text-rose-600">Recording {formattedTime} / 01:30</p>
        ) : recordedUrl ? (
          <p className="text-sm text-ink-500 dark:text-ink-400">Preview ready. Upload to continue.</p>
        ) : (
          <p className="text-sm text-ink-500 dark:text-ink-400">
            {stream
              ? 'Entire screen ready.'
              : screenRequested
                ? 'Trying to share entire screen...'
                : 'Share your entire screen and allow microphone access before recording.'}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleRequestScreenShare}
            disabled={disabled || isStartingScreenShare || Boolean(stream)}
          >
            {isStartingScreenShare ? 'Opening screen share...' : stream ? 'Screen ready' : 'Share entire screen'}
          </Button>

          <Button
            type="button"
            onClick={handleStartRecording}
            disabled={disabled || isRecording || isStartingScreenShare}
          >
            Start recording
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleStopRecording}
            disabled={disabled || !isRecording}
          >
            Stop recording
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={resetRecording}
            disabled={disabled || (!recordedUrl && !stream)}
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
