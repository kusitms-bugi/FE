import { useMutation } from '@tanstack/react-query';
import api from '../api';
import { CreateSessionResponse } from '../../types/main/session';

/**
 * 세션 생성 API
 * POST /sessions
 */
const createSession = async (): Promise<CreateSessionResponse> => {
  const response = await api.post<CreateSessionResponse>('/sessions');
  const result = response.data;

  if (!result.success) {
    throw new Error(result.message || '세션 생성 실패');
  }

  return result;
};

/**
 * 세션 생성 mutation 훅
 * @example
 * const { mutate: createSession } = useCreateSessionMutation();
 * createSession();
 */
export const useCreateSessionMutation = () => {
  return useMutation({
    mutationFn: createSession,
    onSuccess: (res) => {
      console.log('세션 생성 성공:', res.data.sessionId);

      // sessionId를 localStorage에 저장
      localStorage.setItem('sessionId', res.data.sessionId);

      // 이전 세션의 lastSessionId 삭제 (중복 방지)
      localStorage.removeItem('lastSessionId');
    },
    onError: (error) => {
      console.error('세션 생성 오류:', error);
    },
  });
};
