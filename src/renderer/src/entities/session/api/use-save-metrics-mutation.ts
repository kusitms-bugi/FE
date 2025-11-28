import { useMutation } from '@tanstack/react-query';
import api from '@shared/api';
import { SaveMetricsRequest, SaveMetricsResponse } from '../types';

/**
 * 세션 메트릭 저장 API
 * POST /sessions/{sessionId}/metrics
 */
const saveMetrics = async (
  data: SaveMetricsRequest,
): Promise<SaveMetricsResponse> => {
  const { sessionId, metrics } = data;
  const response = await api.post<SaveMetricsResponse>(
    `/sessions/${sessionId}/metrics`,
    metrics, // API 스펙에 따라 배열만 전송
  );
  const result = response.data;

  if (!result.success) {
    throw new Error(result.message || '세션 메트릭 저장 실패');
  }

  return result;
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
