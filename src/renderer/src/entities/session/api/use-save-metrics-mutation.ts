import { useMutation } from '@tanstack/react-query';
import { SaveMetricsRequest, SaveMetricsResponse } from '../types';

/**
 * 세션 메트릭 저장 API (목 데이터)
 */
const saveMetrics = async (
  data: SaveMetricsRequest,
): Promise<SaveMetricsResponse> => {
  return {
    timestamp: new Date().toISOString(),
    success: true,
    code: 'SUCCESS',
    message: '세션 메트릭 저장 성공',
  };
};

/**
 * 세션 메트릭 저장 mutation 훅
 * @example
 * const { mutate: saveMetrics } = useSaveMetricsMutation();
 * const sessionId = localStorage.getItem('sessionId');
 * saveMetrics({
 *   sessionId,
 *   metrics: [
 *     { score: 3, timestamp: new Date().toISOString() }, // score: 자세 상태별 레벨 (1~6)
 *     { score: 4, timestamp: new Date().toISOString() }
 *   ]
 * });
 */
export const useSaveMetricsMutation = () => {
  return useMutation({
    mutationFn: saveMetrics,
    onSuccess: (res) => {
      console.log('세션 메트릭 저장 성공:', res);
    },
    onError: (error) => {
      console.error('세션 메트릭 저장 오류:', error);
    },
  });
};
