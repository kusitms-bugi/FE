export interface AverageScoreData {
  score: number;
}

export interface AverageScoreResponse {
  timestamp: string;
  success: boolean;
  data: AverageScoreData;
  code: string;
  message: string | null;
}
