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

/* 세션 중단 API 타입 */
export interface StopSessionResponse {
  timestamp: string;
  success: boolean;
  code: string;
  message: string;
}
