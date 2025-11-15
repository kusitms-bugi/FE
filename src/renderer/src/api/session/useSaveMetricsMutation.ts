import { useMutation } from '@tanstack/react-query';
import api from '../api';
import {
  SaveMetricsRequest,
  SaveMetricsResponse,
} from '../../types/main/session';

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
    { sessionId, metrics },
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
 *     { score: 0.85, timestamp: new Date().toISOString() },
 *     { score: 0.92, timestamp: new Date().toISOString() }
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
