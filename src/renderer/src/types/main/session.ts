/* 세션 생성 API 타입 */
export interface CreateSessionResponse {
  timestamp: string;
  success: boolean;
  data: {
    sessionId: string;
  };
  code: string;
  message: string;
}

/* 세션 중단/일시정지 공통 응답 타입 */
export interface SessionActionResponse {
  timestamp: string;
  success: boolean;
  code: string;
  message: string;
}

/* 세션 메트릭 데이터 타입 */
export interface MetricData {
  score: number;
  timestamp: string;
}

/* 세션 메트릭 저장 요청 타입 */
export interface SaveMetricsRequest {
  sessionId: string;
  metrics: MetricData[];
}

/* 세션 메트릭 저장 응답 타입 */
export interface SaveMetricsResponse {
  timestamp: string;
  success: boolean;
  code: string;
  message: string;
}
