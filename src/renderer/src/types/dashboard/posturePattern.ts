export interface PosturePatternData {
  worstTime: string; // "14:00:00" 형식
  worstDay: string; // "FRIDAY" 형식
  recovery: number; // 회복까지 평균 시간 (분)
  stretching: string; // 스트레칭 추천
}

export interface PosturePatternResponse {
  timestamp: string;
  success: boolean;
  data: PosturePatternData;
  code: string;
  message: string;
}


