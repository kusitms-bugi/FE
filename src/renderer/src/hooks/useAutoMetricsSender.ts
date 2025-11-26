import { useEffect } from 'react';
import { MetricData } from '../types/main/session';

/**
 * 5분마다 자동으로 메트릭 데이터를 전송하는 훅
 *
 * @param metricsRef - 메트릭 데이터를 담고 있는 ref
 * @param sendMetrics - 메트릭 전송 함수
 */
export const useAutoMetricsSender = (
  metricsRef: React.RefObject<MetricData[]>,
  sendMetrics: () => void,
) => {
  useEffect(() => {
    const FIVE_MINUTES = 5 * 60 * 1000; // 5분 = 300,000ms

    const intervalId = setInterval(() => {
      const sessionId = localStorage.getItem('sessionId');

      // 세션이 활성화되어 있고, 전송할 데이터가 있을 때만 전송
      if (sessionId && metricsRef.current && metricsRef.current.length > 0) {
        console.log(
          `[자동 전송] ${metricsRef.current.length}개 메트릭 데이터 전송`,
        );
        sendMetrics();
      }
    }, FIVE_MINUTES);

    // 클린업: 컴포넌트 언마운트 시 interval 정리
    return () => {
      clearInterval(intervalId);
    };
  }, [metricsRef, sendMetrics]);
};
