import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getInterviewDetails, submitInterview, uploadInterviewVideo } from '@/services/api';
import useVideoRecorder from '@/hooks/useVideoRecorder';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const VideoInterview: React.FC = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const previewRef = useRef<HTMLVideoElement | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const autoStopRef = useRef(false);

    const { stream, error: recorderError, isRecording, startRecording, stopRecording } = useVideoRecorder();

    const { data: interview, isLoading, isError } = useQuery({
        queryKey: ['interview', interviewId],
        queryFn: () => getInterviewDetails(interviewId as string),
        enabled: !!interviewId,
    });

    useEffect(() => {
        if (previewRef.current && stream) {
            previewRef.current.srcObject = stream;
        }
    }, [stream]);

    useEffect(() => {
        if (interview) {
            const nextIndex = interview.responses?.length || 0;
            setActiveIndex(nextIndex);
        }
    }, [interview?._id, interview?.responses?.length]);

    useEffect(() => {
        return () => {
            if (recordedUrl) {
                URL.revokeObjectURL(recordedUrl);
            }
        };
    }, [recordedUrl]);

    useEffect(() => {
        if (!isRecording) {
            return;
        }
        const intervalId = window.setInterval(() => {
            setRecordingSeconds((prev) => prev + 1);
        }, 1000);
        return () => {
            window.clearInterval(intervalId);
        };
    }, [isRecording]);

    useEffect(() => {
        if (!isRecording) {
            return;
        }
        if (recordingSeconds >= 60 && !autoStopRef.current) {
            autoStopRef.current = true;
            void handleStopRecording();
            toast('Recording stopped at 1 minute limit.');
        }
    }, [isRecording, recordingSeconds]);

    const uploadMutation = useMutation({
        mutationFn: async (payload: { blob: Blob; index: number }) => {
            if (!interviewId) throw new Error('Missing interview ID');
            setUploadProgress(0);
            return uploadInterviewVideo(interviewId, payload.index, payload.blob, setUploadProgress);
        },
        onSuccess: (data, variables) => {
            queryClient.setQueryData(['interview', interviewId], (prev: any) => {
                if (!prev) return prev;
                const nextResponses = [...(prev.responses || [])];
                nextResponses.push({ question: prev.questions?.[variables.index], videoUrl: data.videoUrl });
                return { ...prev, responses: nextResponses, isCompleted: data.isCompleted };
            });
            setRecordedBlob(null);
            setRecordedUrl(null);
            setUploadProgress(0);
            setActiveIndex((prev) => prev + 1);
            toast.success('Video uploaded successfully.');
        },
        onError: (error: any) => {
            setUploadProgress(0);
            toast.error(error?.response?.data?.message || 'Failed to upload video.');
        },
    });

    const submitMutation = useMutation({
        mutationFn: () => submitInterview(interviewId as string),
        onSuccess: () => {
            toast.success('Interview submitted for review.');
            queryClient.invalidateQueries({ queryKey: ['interview', interviewId] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to submit interview.');
        },
    });

    const questions = interview?.questions || [];
    const responses = interview?.responses || [];
    const hasAllResponses = responses.length === questions.length && questions.length > 0;
    const isSubmitted = interview?.isSubmitted;

    const statusBadge = () => {
        if (!interview) return null;
        if (interview.reviewStatus === 'pass') return <Badge variant="success">Passed</Badge>;
        if (interview.reviewStatus === 'fail') return <Badge variant="danger">Failed</Badge>;
        if (interview.isSubmitted) return <Badge variant="warning">Submitted</Badge>;
        return <Badge variant="brand">In Progress</Badge>;
    };

    const handleStartRecording = () => {
        if (!stream) {
            toast.error('Camera stream is not ready yet.');
            return;
        }
        autoStopRef.current = false;
        setRecordingSeconds(0);
        if (recordedUrl) {
            URL.revokeObjectURL(recordedUrl);
        }
        setRecordedBlob(null);
        setRecordedUrl(null);
        setUploadProgress(0);
        startRecording();
    };

    const handleStopRecording = async () => {
        const blob = await stopRecording();
        if (!blob) return;
        if (recordedUrl) {
            URL.revokeObjectURL(recordedUrl);
        }
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
    };

    const handleUpload = async () => {
        if (!recordedBlob) {
            toast.error('Record an answer before uploading.');
            return;
        }
        await uploadMutation.mutateAsync({ blob: recordedBlob, index: activeIndex });
    };

    const toAbsoluteUrl = (path?: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
        const origin = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
        return `${origin}${path}`;
    };

    const formatDuration = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        );
    }

    if (isError || !interview) {
        return (
            <Card>
                <CardContent>
                    <p className="text-sm text-ink-500">Unable to load interview details.</p>
                    <Button type="button" variant="ghost" onClick={() => navigate('/student/skill-verification')}>
                        Back to skills
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const skillName = interview?.skillId?.name || interview?.skill?.name || interview?.skillId || 'Skill';

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-sm uppercase tracking-wide text-ink-400">Video interview</p>
                    <h1 className="text-2xl font-semibold text-ink-900">{skillName} verification</h1>
                </div>
                {statusBadge()}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-sm text-ink-500">
                        Question {Math.min(activeIndex + 1, questions.length)} of {questions.length}
                    </p>
                    <div className="h-2 w-full rounded-full bg-ink-100">
                        <div
                            className="h-2 rounded-full bg-brand-600 transition-all"
                            style={{ width: `${questions.length ? (responses.length / questions.length) * 100 : 0}%` }}
                        />
                    </div>
                </CardContent>
            </Card>

            {recorderError ? (
                <Card>
                    <CardContent>
                        <p className="text-sm text-rose-500">{recorderError}</p>
                    </CardContent>
                </Card>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>Answer the current question</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-2xl border border-ink-100 bg-ink-50 p-4 text-sm text-ink-700">
                            {questions[activeIndex] || 'All questions completed.'}
                        </div>
                        <div className="space-y-3">
                            <video
                                ref={previewRef}
                                className="aspect-video w-full rounded-2xl bg-ink-900"
                                autoPlay
                                muted
                            />
                            {isRecording ? (
                                <div className="flex items-center gap-2 text-sm font-medium text-rose-600">
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-rose-600" aria-hidden />
                                    <span>
                                        Recording {formatDuration(recordingSeconds)} / 01:00
                                    </span>
                                </div>
                            ) : (
                                <p className="text-xs text-ink-500">Max recording time: 01:00</p>
                            )}
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleStartRecording}
                                    disabled={
                                        isRecording ||
                                        uploadMutation.isPending ||
                                        isSubmitted ||
                                        activeIndex >= questions.length ||
                                        !stream
                                    }
                                >
                                    Start recording
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleStopRecording}
                                    disabled={!isRecording}
                                >
                                    Stop recording
                                </Button>
                            </div>
                        </div>

                        {recordedUrl ? (
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-ink-700">Preview</p>
                                <video className="aspect-video w-full rounded-2xl" controls src={recordedUrl} />
                                <Button
                                    type="button"
                                    className="w-full"
                                    onClick={handleUpload}
                                    disabled={uploadMutation.isPending || isSubmitted}
                                >
                                    {uploadMutation.isPending ? 'Uploading...' : 'Upload answer'}
                                </Button>
                                {uploadMutation.isPending ? (
                                    <div className="h-2 w-full rounded-full bg-ink-100">
                                        <div
                                            className="h-2 rounded-full bg-brand-600"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <p className="text-sm text-ink-500">
                                Record a video response to unlock the upload button.
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Submitted answers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {responses.length === 0 ? (
                            <p className="text-sm text-ink-500">No videos uploaded yet.</p>
                        ) : (
                            responses.map((response: any, index: number) => (
                                <div key={`${response.videoUrl}-${index}`} className="space-y-2">
                                    <p className="text-sm font-semibold text-ink-700">
                                        Q{index + 1}: {response.question}
                                    </p>
                                    <video className="aspect-video w-full rounded-2xl" controls src={toAbsoluteUrl(response.videoUrl)} />
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Submit for admin review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-ink-500">
                        You must upload a video for every question before submitting.
                    </p>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => submitMutation.mutate()}
                        disabled={!hasAllResponses || isSubmitted || submitMutation.isPending || uploadMutation.isPending}
                    >
                        {isSubmitted ? 'Interview submitted' : submitMutation.isPending ? 'Submitting...' : 'Submit interview'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default VideoInterview;
