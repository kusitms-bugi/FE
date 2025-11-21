export type AttendancePeriod = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface AttendanceData {
  attendances: Record<string, number>; // 날짜별 레벨 값 (예: "2025-01-01": 3)
  title: string;
  content1: string;
  content2: string;
  subContent: string;
}

export interface AttendanceResponse {
  timestamp: string;
  success: boolean;
  data: AttendanceData;
  code: string;
  message: string;
}

export interface AttendanceQueryParams {
  period: AttendancePeriod;
  year: number;
  month?: number;
}
