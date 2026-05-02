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

const stopStream = (mediaStream: MediaStream | null) => {
  mediaStream?.getTracks().forEach((track) => track.stop());
};

type RecordedCapture = {
  cameraFile: File;
  screenFile: File;
};

type StopState = {
  resolver: ((files: RecordedCapture | null) => void) | null;
  cameraFile: File | null;
  screenFile: File | null;
};

export const useVideoRecorder = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasScreenShare, setHasScreenShare] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isStartingScreenShare, setIsStartingScreenShare] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cameraRecorderRef = useRef<MediaRecorder | null>(null);
  const screenRecorderRef = useRef<MediaRecorder | null>(null);
  const cameraChunksRef = useRef<Blob[]>([]);
  const screenChunksRef = useRef<Blob[]>([]);
  const stopStateRef = useRef<StopState>({
    resolver: null,
    cameraFile: null,
    screenFile: null,
  });
  const mimeTypeRef = useRef<string>(getSupportedMimeType());
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const screenRecordingStreamRef = useRef<MediaStream | null>(null);
  const recordedUrlRef = useRef<string | null>(null);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    recordedUrlRef.current = recordedUrl;
  }, [recordedUrl]);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const getExtensionFromMimeType = (mimeType: string) => {
    if (mimeType.includes('mp4')) return 'mp4';
    if (mimeType.includes('webm')) return 'webm';
    return 'webm';
  };

  const resolveStopIfReady = useCallback(() => {
    const { resolver, cameraFile, screenFile } = stopStateRef.current;
    if (!resolver || !cameraFile || !screenFile) {
      return;
    }

    stopStateRef.current = {
      resolver: null,
      cameraFile: null,
      screenFile: null,
    };
    resolver({ cameraFile, screenFile });
  }, []);

  const cleanup = useCallback(() => {
    if (recordedUrlRef.current) {
      URL.revokeObjectURL(recordedUrlRef.current);
      recordedUrlRef.current = null;
    }

    setRecordedUrl(null);
    setRecordedBlob(null);
    setIsRecording(false);
    setHasScreenShare(false);

    if (cameraRecorderRef.current && cameraRecorderRef.current.state !== 'inactive') {
      cameraRecorderRef.current.stop();
    }
    if (screenRecorderRef.current && screenRecorderRef.current.state !== 'inactive') {
      screenRecorderRef.current.stop();
    }

    cameraRecorderRef.current = null;
    screenRecorderRef.current = null;

    stopStream(screenRecordingStreamRef.current);
    stopStream(screenStreamRef.current);
    stopStream(cameraStreamRef.current);

    screenRecordingStreamRef.current = null;
    screenStreamRef.current = null;
    cameraStreamRef.current = null;
    setStream(null);
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const resetRecording = useCallback(() => {
    if (recordedUrlRef.current) {
      URL.revokeObjectURL(recordedUrlRef.current);
      recordedUrlRef.current = null;
    }
    cameraChunksRef.current = [];
    screenChunksRef.current = [];
    setRecordedBlob(null);
    setRecordedUrl(null);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);

    if (cameraStreamRef.current) {
      return cameraStreamRef.current;
    }

    if (!canUseMediaRecorder) {
      const message = 'Browser does not support video recording.';
      setError(message);
      throw new Error(message);
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      const message = 'Camera access is not available in this browser.';
      setError(message);
      throw new Error(message);
    }

    setIsStartingCamera(true);

    try {
      let cameraStream: MediaStream;
      try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: true,
        });
      } catch {
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
      }

      cameraStreamRef.current = cameraStream;
      setStream(cameraStream);
      return cameraStream;
    } catch (cameraError) {
      const errorMessage =
        cameraError instanceof Error && cameraError.message
          ? cameraError.message
          : 'Unable to access camera.';
      const message = `Camera start failed: ${errorMessage}`;
      setError(message);
      throw cameraError instanceof Error ? cameraError : new Error(message);
    } finally {
      setIsStartingCamera(false);
    }
  }, []);

  const startScreenShare = useCallback(async () => {
    setError(null);

    if (screenStreamRef.current) {
      return screenStreamRef.current;
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

      screenTrack.onended = () => {
        setHasScreenShare(false);
        setError('Screen sharing ended. Share your entire screen again to continue.');

        if (isRecordingRef.current) {
          cameraRecorderRef.current?.stop();
          screenRecorderRef.current?.stop();
          setIsRecording(false);
        }

        stopStream(screenRecordingStreamRef.current);
        stopStream(screenStreamRef.current);
        screenRecordingStreamRef.current = null;
        screenStreamRef.current = null;
      };

      screenStreamRef.current = displayStream;
      setHasScreenShare(true);
      return displayStream;
    } catch (screenShareError) {
      stopStream(screenStreamRef.current);
      screenRecordingStreamRef.current = null;
      screenStreamRef.current = null;
      setHasScreenShare(false);

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
    if (!cameraStreamRef.current) {
      const message = 'Open camera first.';
      setError(message);
      throw new Error(message);
    }

    if (!screenStreamRef.current) {
      const message = 'Share your entire screen first.';
      setError(message);
      throw new Error(message);
    }

    try {
      resetRecording();
      cameraChunksRef.current = [];
      screenChunksRef.current = [];
      stopStateRef.current = {
        resolver: null,
        cameraFile: null,
        screenFile: null,
      };

      const recorderOptions = mimeTypeRef.current ? { mimeType: mimeTypeRef.current } : undefined;

      const cameraRecorder = new MediaRecorder(cameraStreamRef.current, recorderOptions);
      cameraRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          cameraChunksRef.current.push(event.data);
        }
      };

      cameraRecorder.onstop = () => {
        const mimeType = mimeTypeRef.current || cameraRecorder.mimeType || 'video/webm';
        const extension = getExtensionFromMimeType(mimeType);
        const blob = cameraChunksRef.current.length
          ? new Blob(cameraChunksRef.current, { type: mimeType })
          : null;
        const file = blob
          ? new File([blob], `camera-answer-${Date.now()}.${extension}`, { type: mimeType })
          : null;

        cameraChunksRef.current = [];
        setRecordedBlob(blob);

        if (recordedUrlRef.current) {
          URL.revokeObjectURL(recordedUrlRef.current);
        }

        const nextUrl = blob ? URL.createObjectURL(blob) : null;
        recordedUrlRef.current = nextUrl;
        setRecordedUrl(nextUrl);

        stopStateRef.current.cameraFile = file;
        resolveStopIfReady();
      };

      const screenTrack = screenStreamRef.current.getVideoTracks()[0];
      if (!screenTrack) {
        throw new Error('Missing screen sharing track.');
      }

      const screenRecordingStream = new MediaStream([screenTrack]);
      cameraStreamRef.current.getAudioTracks().forEach((track) => {
        screenRecordingStream.addTrack(track.clone());
      });
      screenRecordingStreamRef.current = screenRecordingStream;

      const screenRecorder = new MediaRecorder(screenRecordingStream, recorderOptions);
      screenRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          screenChunksRef.current.push(event.data);
        }
      };

      screenRecorder.onstop = () => {
        const mimeType = mimeTypeRef.current || screenRecorder.mimeType || 'video/webm';
        const extension = getExtensionFromMimeType(mimeType);
        const blob = screenChunksRef.current.length
          ? new Blob(screenChunksRef.current, { type: mimeType })
          : null;
        const file = blob
          ? new File([blob], `screen-answer-${Date.now()}.${extension}`, { type: mimeType })
          : null;

        screenChunksRef.current = [];
        stopStateRef.current.screenFile = file;
        resolveStopIfReady();
      };

      cameraRecorderRef.current = cameraRecorder;
      screenRecorderRef.current = screenRecorder;

      cameraRecorder.start();
      screenRecorder.start();
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
  }, [resetRecording, resolveStopIfReady]);

  const stopRecording = useCallback(() => {
    return new Promise<RecordedCapture | null>((resolve) => {
      if (
        !cameraRecorderRef.current ||
        cameraRecorderRef.current.state === 'inactive' ||
        !screenRecorderRef.current ||
        screenRecorderRef.current.state === 'inactive'
      ) {
        setIsRecording(false);
        resolve(null);
        return;
      }

      stopStateRef.current = {
        resolver: resolve,
        cameraFile: null,
        screenFile: null,
      };

      setIsRecording(false);
      cameraRecorderRef.current.stop();
      screenRecorderRef.current.stop();
    });
  }, []);

  return {
    error,
    hasScreenShare,
    isRecording,
    isStartingCamera,
    isStartingScreenShare,
    recordedBlob,
    recordedUrl,
    resetRecording,
    startCamera,
    startRecording,
    startScreenShare,
    stopRecording,
    stream,
  };
};
