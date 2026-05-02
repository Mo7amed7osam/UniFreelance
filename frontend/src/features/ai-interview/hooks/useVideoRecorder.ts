import { useCallback, useEffect, useRef, useState } from 'react';

const supportedMimeTypes = [
  'video/mp4;codecs=h264,aac',
  'video/mp4',
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
];

const canUseMediaRecorder =
  typeof window !== 'undefined' &&
  typeof MediaRecorder !== 'undefined' &&
  typeof MediaRecorder.isTypeSupported === 'function';

const getSupportedMimeType = () =>
  canUseMediaRecorder
    ? supportedMimeTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) || ''
    : '';

export const useVideoRecorder = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isStartingScreenShare, setIsStartingScreenShare] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopResolverRef = useRef<((file: File | null) => void) | null>(null);
  const mimeTypeRef = useRef<string>(getSupportedMimeType());
  const streamRef = useRef<MediaStream | null>(null);
  const recordedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  useEffect(() => {
    recordedUrlRef.current = recordedUrl;
  }, [recordedUrl]);

  const getExtensionFromMimeType = (mimeType: string) => {
    if (mimeType.includes('mp4')) return 'mp4';
    if (mimeType.includes('webm')) return 'webm';
    return 'webm';
  };

  const cleanup = useCallback(() => {
    if (recordedUrlRef.current) {
      URL.revokeObjectURL(recordedUrlRef.current);
      recordedUrlRef.current = null;
    }
    setRecordedUrl(null);
    setRecordedBlob(null);
    setIsRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    mediaRecorderRef.current = null;
    setStream(null);
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const resetRecording = useCallback(() => {
    if (recordedUrlRef.current) {
      URL.revokeObjectURL(recordedUrlRef.current);
      recordedUrlRef.current = null;
    }
    chunksRef.current = [];
    setRecordedBlob(null);
    setRecordedUrl(null);
  }, []);

  const startScreenShare = useCallback(async () => {
    setError(null);

    if (streamRef.current) {
      return streamRef.current;
    }

    if (!canUseMediaRecorder) {
      const message = 'Browser does not support video recording.';
      setError(message);
      throw new Error(message);
    }

    if (!navigator.mediaDevices?.getDisplayMedia) {
      const message = 'Screen sharing is not available in this browser.';
      setError(message);
      throw new Error(message);
    }

    setIsStartingScreenShare(true);

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const [screenTrack] = displayStream.getVideoTracks();
      const displaySurface = screenTrack?.getSettings().displaySurface;

      if (!screenTrack || (displaySurface && displaySurface !== 'monitor')) {
        displayStream.getTracks().forEach((track) => track.stop());
        const message = 'Please choose Entire Screen. Window or tab sharing is not allowed.';
        setError(message);
        throw new Error(message);
      }

      let audioTracks: MediaStreamTrack[] = [];
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        audioTracks = audioStream.getAudioTracks();
      } catch {
        audioTracks = [];
      }

      const mediaStream = new MediaStream([screenTrack, ...audioTracks]);
      const recorderOptions = mimeTypeRef.current ? { mimeType: mimeTypeRef.current } : undefined;
      const mediaRecorder = new MediaRecorder(mediaStream, recorderOptions);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mimeTypeRef.current || mediaRecorder.mimeType || 'video/webm';
        const extension = getExtensionFromMimeType(mimeType);
        const blob = chunksRef.current.length ? new Blob(chunksRef.current, { type: mimeType }) : null;
        const file = blob
          ? new File([blob], `answer-${Date.now()}.${extension}`, { type: mimeType })
          : null;

        chunksRef.current = [];
        setRecordedBlob(blob);

        if (recordedUrlRef.current) {
          URL.revokeObjectURL(recordedUrlRef.current);
        }

        const nextUrl = blob ? URL.createObjectURL(blob) : null;
        recordedUrlRef.current = nextUrl;
        setRecordedUrl(nextUrl);
        setIsRecording(false);

        if (stopResolverRef.current) {
          stopResolverRef.current(file);
          stopResolverRef.current = null;
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      setStream(mediaStream);
      return mediaStream;
    } catch (screenShareError) {
      const errorMessage =
        screenShareError instanceof Error && screenShareError.message
          ? screenShareError.message
          : 'Unable to share screen.';
      const message = `Screen sharing failed: ${errorMessage}`;
      setError(message);
      throw screenShareError instanceof Error ? screenShareError : new Error(message);
    } finally {
      setIsStartingScreenShare(false);
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!mediaRecorderRef.current) {
      const message = 'Entire screen is not ready.';
      setError(message);
      throw new Error(message);
    }

    try {
      resetRecording();
      chunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
    } catch (recordingError) {
      const message =
        recordingError instanceof Error && recordingError.message
          ? recordingError.message
          : 'Failed to start recording.';
      setError(`Recording failed: ${message}`);
      throw recordingError instanceof Error ? recordingError : new Error(message);
    }
  }, [resetRecording]);

  const stopRecording = useCallback(() => {
    return new Promise<File | null>((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        setIsRecording(false);
        resolve(null);
        return;
      }

      stopResolverRef.current = resolve;
      mediaRecorderRef.current.stop();
    });
  }, []);

  return {
    cleanup,
    error,
    isRecording,
    isStartingScreenShare,
    recordedBlob,
    recordedUrl,
    resetRecording,
    startScreenShare,
    startRecording,
    stopRecording,
    stream,
  };
};
