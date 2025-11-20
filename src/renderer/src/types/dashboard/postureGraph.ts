export interface PostureGraphData {
  points: Record<string, number>;
}

export interface PostureGraphResponse {
  timestamp: string;
  success: boolean;
  data: PostureGraphData;
  code: string;
  message: string | null;
}
