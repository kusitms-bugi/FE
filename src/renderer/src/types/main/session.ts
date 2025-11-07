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
