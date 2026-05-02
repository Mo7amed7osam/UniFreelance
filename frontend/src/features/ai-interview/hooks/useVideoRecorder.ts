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

const attachTrackEndedHandler = (track: MediaStreamTrack | null | undefined, handler: () => void) => {
  if (!track) return;
  track.onended = handler;
};

export const useVideoRecorder = () => {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [screenReady, setScreenReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isStartingScreenShare, setIsStartingScreenShare] = useState(false);
  const [isTestingMicrophone, setIsTestingMicrophone] = useState(false);
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
  const micStreamRef = useRef<MediaStream | null>(null);
  const screenRecordingStreamRef = useRef<MediaStream | null>(null);
  const recordedUrlRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const meterAnimationRef = useRef<number | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    cameraStreamRef.current = cameraStream;
  }, [cameraStream]);

  useEffect(() => {
    screenStreamRef.current = screenStream;
  }, [screenStream]);

  useEffect(() => {
    recordedUrlRef.current = recordedUrl;
  }, [recordedUrl]);

  const stopMicMeter = useCallback(() => {
    if (meterAnimationRef.current !== null) {
      window.cancelAnimationFrame(meterAnimationRef.current);
      meterAnimationRef.current = null;
    }

    sourceNodeRef.current?.disconnect();
    analyserRef.current?.disconnect();
    sourceNodeRef.current = null;
    analyserRef.current = null;

    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setMicLevel(0);
  }, []);

  const startMicMeter = useCallback(
    async (inputStream: MediaStream) => {
      stopMicMeter();

      const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) {
        setMicLevel(1);
        return;
      }

      const audioContext = new AudioContextCtor();
      if (audioContext.state === 'suspended') {
        await audioContext.resume().catch(() => undefined);
      }

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.35;

      const sourceNode = audioContext.createMediaStreamSource(inputStream);
      sourceNode.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceNodeRef.current = sourceNode;

      const buffer = new Float32Array(analyser.fftSize);

      const sample = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getFloatTimeDomainData(buffer);
        let sumSquares = 0;
        for (let index = 0; index < buffer.length; index += 1) {
          const sampleValue = buffer[index];
          sumSquares += sampleValue * sampleValue;
        }

        const rms = Math.sqrt(sumSquares / buffer.length);
        const normalizedLevel = Math.min(1, rms * 4.5);
        setMicLevel(normalizedLevel);
        meterAnimationRef.current = window.requestAnimationFrame(sample);
      };

      sample();
    },
    [stopMicMeter]
  );

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

  const resetRecording = useCallback(() => {
    if (recordedUrlRef.current) {
      URL.revokeObjectURL(recordedUrlRef.current);
      recordedUrlRef.current = null;
    }
    cameraChunksRef.current = [];
    screenChunksRef.current = [];
    setRecordedUrl(null);
  }, []);

  const cleanup = useCallback(() => {
    if (recordedUrlRef.current) {
      URL.revokeObjectURL(recordedUrlRef.current);
      recordedUrlRef.current = null;
    }

    stopMicMeter();
    setRecordedUrl(null);
    setIsRecording(false);
    setCameraReady(false);
    setScreenReady(false);
    setMicReady(false);
    setError(null);

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
    stopStream(micStreamRef.current);

    screenRecordingStreamRef.current = null;
    screenStreamRef.current = null;
    cameraStreamRef.current = null;
    micStreamRef.current = null;

    setCameraStream(null);
    setScreenStream(null);
  }, [stopMicMeter]);

  useEffect(() => () => cleanup(), [cleanup]);

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
      let nextCameraStream: MediaStream;
      try {
        nextCameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: true,
        });
      } catch {
        nextCameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
      }

      attachTrackEndedHandler(nextCameraStream.getVideoTracks()[0], () => {
        setCameraReady(false);
        setCameraStream(null);
        cameraStreamRef.current = null;
      });

      attachTrackEndedHandler(nextCameraStream.getAudioTracks()[0], () => {
        setMicReady(false);
        if (!micStreamRef.current) {
          stopMicMeter();
        }
      });

      cameraStreamRef.current = nextCameraStream;
      setCameraStream(nextCameraStream);
      setCameraReady(true);

      return nextCameraStream;
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
  }, [stopMicMeter]);

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
        setScreenReady(false);
        setScreenStream(null);
        setError('Screen sharing ended. Share your entire screen again to continue.');
        stopStream(screenRecordingStreamRef.current);
        screenRecordingStreamRef.current = null;
        screenStreamRef.current = null;

        if (cameraRecorderRef.current?.state === 'recording') {
          cameraRecorderRef.current.stop();
        }
        if (screenRecorderRef.current?.state === 'recording') {
          screenRecorderRef.current.stop();
        }
        setIsRecording(false);
      };

      screenStreamRef.current = displayStream;
      setScreenStream(displayStream);
      setScreenReady(true);
      return displayStream;
    } catch (screenShareError) {
      stopStream(screenStreamRef.current);
      screenRecordingStreamRef.current = null;
      screenStreamRef.current = null;
      setScreenReady(false);
      setScreenStream(null);

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

  const testMicrophone = useCallback(async () => {
    setError(null);
    setIsTestingMicrophone(true);

    try {
      const existingAudioTrack = cameraStreamRef.current?.getAudioTracks()[0];
      if (existingAudioTrack) {
        await startMicMeter(new MediaStream([existingAudioTrack]));
        setMicReady(true);
        return true;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone access is not available in this browser.');
      }

      if (!micStreamRef.current) {
        const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });

        attachTrackEndedHandler(audioOnlyStream.getAudioTracks()[0], () => {
          setMicReady(false);
          stopMicMeter();
          stopStream(micStreamRef.current);
          micStreamRef.current = null;
        });

        micStreamRef.current = audioOnlyStream;
      }

      await startMicMeter(micStreamRef.current);
      setMicReady(true);
      return true;
    } catch (microphoneError) {
      const errorMessage =
        microphoneError instanceof Error && microphoneError.message
          ? microphoneError.message
          : 'Unable to access microphone.';
      const message = `Microphone test failed: ${errorMessage}`;
      setError(message);
      setMicReady(false);
      throw microphoneError instanceof Error ? microphoneError : new Error(message);
    } finally {
      setIsTestingMicrophone(false);
    }
  }, [startMicMeter, stopMicMeter]);

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

    const cameraVideoTrack = cameraStreamRef.current.getVideoTracks()[0];
    if (!cameraVideoTrack) {
      const message = 'Camera video track is unavailable.';
      setError(message);
      throw new Error(message);
    }

    const micTrack =
      cameraStreamRef.current.getAudioTracks()[0] || micStreamRef.current?.getAudioTracks()[0] || null;

    if (!micTrack) {
      const message = 'Test microphone first.';
      setError(message);
      throw new Error(message);
    }

    const screenTrack = screenStreamRef.current.getVideoTracks()[0];
    if (!screenTrack) {
      const message = 'Missing screen sharing track.';
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
      const cameraRecordingStream = new MediaStream([cameraVideoTrack, micTrack.clone()]);

      const cameraRecorder = new MediaRecorder(cameraRecordingStream, recorderOptions);
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

        if (recordedUrlRef.current) {
          URL.revokeObjectURL(recordedUrlRef.current);
        }

        const nextUrl = blob ? URL.createObjectURL(blob) : null;
        recordedUrlRef.current = nextUrl;
        setRecordedUrl(nextUrl);

        stopStateRef.current.cameraFile = file;
        resolveStopIfReady();
      };

      const screenRecordingStream = new MediaStream([screenTrack, micTrack.clone()]);
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
    cameraReady,
    cameraStream,
    cleanup,
    error,
    hasScreenShare: screenReady,
    isRecording,
    isStartingCamera,
    isStartingScreenShare,
    isTestingMicrophone,
    micLevel,
    micReady,
    recordedUrl,
    resetRecording,
    screenReady,
    screenStream,
    startCamera,
    startRecording,
    startScreenShare,
    stopRecording,
    testMicrophone,
  };
};
