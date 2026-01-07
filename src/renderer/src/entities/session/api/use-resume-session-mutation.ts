import { useMutation } from '@tanstack/react-query';
import { SessionActionResponse } from '../types';

/**
 * 세션 재개 API (목 데이터)
 */
const resumeSession = async (
  sessionId: string,
): Promise<SessionActionResponse> => {
  return {
    timestamp: new Date().toISOString(),
    success: true,
    code: 'SUCCESS',
    message: '세션 재개 성공',
  };
};

/**
 * 세션 재개 mutation 훅
 * @example
 * const { mutate: resumeSession } = useResumeSessionMutation();
 * const sessionId = localStorage.getItem('sessionId');
 * resumeSession(sessionId);
 */
export const useResumeSessionMutation = () => {
  return useMutation({
    mutationFn: resumeSession,
    onSuccess: () => {
      console.log('세션 재개 성공');
    },
    onError: (error) => {
      console.error('세션 재개 오류:', error);
    },
  });
};
