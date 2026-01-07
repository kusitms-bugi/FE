import { useMutation } from '@tanstack/react-query';
import { CreateSessionResponse } from '../types';

/**
 * 세션 생성 API (목 데이터)
 */
const createSession = async (): Promise<CreateSessionResponse> => {
  const mockSessionId = `session-${Date.now()}`;
  
  return {
    timestamp: new Date().toISOString(),
    success: true,
    data: {
      sessionId: mockSessionId,
    },
    code: 'SUCCESS',
    message: '세션 생성 성공',
  };
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
