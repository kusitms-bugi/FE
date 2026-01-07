import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SessionActionResponse } from '../types';

/**
 * 세션 중단 API (목 데이터)
 */
const stopSession = async (
  sessionId: string,
): Promise<SessionActionResponse> => {
  return {
    timestamp: new Date().toISOString(),
    success: true,
    code: 'SUCCESS',
    message: '세션 중단 성공',
  };
};

/**
 * 세션 중단 mutation 훅
 * @example
 * const { mutate: stopSession } = useStopSessionMutation();
 * const sessionId = localStorage.getItem('sessionId');
 * stopSession(sessionId);
 */
export const useStopSessionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: stopSession,
    onSuccess: () => {
      console.log('세션 중단 성공');

      // sessionId를 lastSessionId로 백업 (ExitPanel에서 리포트 조회용)
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        localStorage.setItem('lastSessionId', sessionId);
      }

      // sessionId를 localStorage에서 제거
      localStorage.removeItem('sessionId');

      // 평균 자세 점수 쿼리 갱신
      queryClient.invalidateQueries({ queryKey: ['averageScore'] });

      // 레벨 쿼리 갱신
      queryClient.invalidateQueries({ queryKey: ['level'] });

      // 자세 그래프 쿼리 갱신
      queryClient.invalidateQueries({ queryKey: ['postureGraph'] });
    },
    onError: (error) => {
      console.error('세션 중단 오류:', error);
    },
  });
};
