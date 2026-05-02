import http from '@/api/http';
import { API } from '@/api/endpoints';

import type {
  InterviewResultResponse,
  InterviewSessionResponse,
  StartInterviewPayload,
  StartInterviewResponse,
  SubmitInterviewAnswerResponse,
} from '../types/interview.types';

export const startInterviewSession = async (payload: StartInterviewPayload) => {
  const response = await http.post<StartInterviewResponse>(API.interview.start, payload);
  return response.data;
};

export const getInterviewSession = async (sessionId: string) => {
  const response = await http.get<InterviewSessionResponse>(API.interview.details(sessionId));
  return response.data.session;
};

export const submitInterviewAnswer = async (
  sessionId: string,
  questionId: string,
  videoFile: File
) => {
  const formData = new FormData();
  formData.append('questionId', questionId);
  formData.append('video', videoFile);

  const response = await http.post<SubmitInterviewAnswerResponse>(
    API.interview.answer(sessionId),
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );

  return response.data;
};

export const getInterviewResult = async (sessionId: string) => {
  const response = await http.get<InterviewResultResponse>(API.interview.result(sessionId));
  return response.data;
};

export const toAbsoluteMediaUrl = (assetPath?: string) => {
  if (!assetPath) return '';
  if (assetPath.startsWith('http')) return assetPath;

  const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
  const origin = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
  return `${origin}${assetPath}`;
};
