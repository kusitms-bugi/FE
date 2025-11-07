import { useMutation } from '@tanstack/react-query';
import api from '../api';
import { StopSessionResponse } from '../../types/main/session';

/**
 * 세션 중단 API
 * PATCH /sessions/{sessionId}/stop
 */
const stopSession = async (sessionId: string): Promise<StopSessionResponse> => {
  const response = await api.patch<StopSessionResponse>(
    `/sessions/${sessionId}/stop`,
  );
  const result = response.data;

  if (!result.success) {
    throw new Error(result.message || '세션 중단 실패');
  }

  return result;
};

/**
 * 세션 중단 mutation 훅
 * @example
 * const { mutate: stopSession } = useStopSessionMutation();
 * const sessionId = localStorage.getItem('sessionId');
 * stopSession(sessionId);
 */
export const useStopSessionMutation = () => {
  return useMutation({
    mutationFn: stopSession,
    onSuccess: () => {
      console.log('세션 중단 성공');

      // sessionId를 localStorage에서 제거
      localStorage.removeItem('sessionId');
    },
    onError: (error) => {
      console.error('세션 중단 오류:', error);
    },
  });
};
