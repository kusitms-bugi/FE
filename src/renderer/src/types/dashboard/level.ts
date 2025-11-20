export interface LevelData {
  level: number;
  current: number;
  required: number;
}

export interface LevelResponse {
  timestamp: string;
  success: boolean;
  data: LevelData;
  code: string;
  message: string | null;
}
