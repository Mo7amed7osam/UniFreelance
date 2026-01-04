import { useEffect, useRef, useState } from 'react';

const useVideoRecorder = () => {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const stopResolverRef = useRef<((blob: Blob | null) => void) | null>(null);

    useEffect(() => {
        const initMediaRecorder = async () => {
            try {
                if (typeof MediaRecorder === 'undefined') {
                    setError('Your browser does not support video recording.');
                    return;
                }
                if (!navigator.mediaDevices?.getUserMedia) {
                    setError('Camera access is not available in this browser.');
                    return;
                }
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                const recorder = new MediaRecorder(mediaStream);

                recorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        recordedChunksRef.current.push(event.data);
                    }
                };

                recorder.onstop = () => {
                    const chunks = recordedChunksRef.current;
                    const videoBlob = chunks.length ? new Blob(chunks, { type: 'video/webm' }) : null;
                    if (stopResolverRef.current) {
                        stopResolverRef.current(videoBlob);
                        stopResolverRef.current = null;
                    }
                    recordedChunksRef.current = [];
                };

                mediaRecorderRef.current = recorder;
                setStream(mediaStream);
            } catch (err) {
                setError('Camera or microphone permission denied.');
            }
        };

        initMediaRecorder();

        return () => {
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startRecording = () => {
        const recorder = mediaRecorderRef.current;
        if (recorder) {
            recordedChunksRef.current = [];
            recorder.start();
            setIsRecording(true);
        }
    };

    const stopRecording = () => {
        return new Promise<Blob | null>((resolve) => {
            const recorder = mediaRecorderRef.current;
            if (!recorder) {
                resolve(null);
                return;
            }
            if (recorder.state === 'inactive') {
                resolve(null);
                return;
            }
            stopResolverRef.current = resolve;
            recorder.stop();
            setIsRecording(false);
        });
    };

    return { isRecording, startRecording, stopRecording, stream, error };
};

export default useVideoRecorder;
