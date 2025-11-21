export type HighlightPeriod = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface HighlightData {
  current: number;
  previous: number;
}

export interface HighlightResponse {
  timestamp: string;
  success: boolean;
  data: HighlightData;
  code: string;
  message: string;
}

export interface HighlightQueryParams {
  period: HighlightPeriod;
  year: number;
  month?: number;
}
