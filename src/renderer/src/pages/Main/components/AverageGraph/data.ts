export type AverageGraphDatum = {
  periodLabel: string;
  score: number;
};

/* 주간 데이터 (최근 7일)*/
export const WEEKLY_DATA: AverageGraphDatum[] = [
  { periodLabel: '1', score: 68 },
  { periodLabel: '2', score: 72 },
  { periodLabel: '3', score: 65 },
  { periodLabel: '4', score: 22 },
  { periodLabel: '5', score: 78 },
  { periodLabel: '6', score: 75 },
  { periodLabel: '7', score: 80 },
];

/*월간 데이터 (최근 31일) */
export const MONTHLY_DATA: AverageGraphDatum[] = [
  { periodLabel: '1', score: 65 },
  { periodLabel: '2', score: 68 },
  { periodLabel: '3', score: 70 },
  { periodLabel: '4', score: 22 },
  { periodLabel: '5', score: 75 },
  { periodLabel: '6', score: 73 },
  { periodLabel: '7', score: 78 },
  { periodLabel: '8', score: 76 },
  { periodLabel: '9', score: 80 },
  { periodLabel: '10', score: 82 },
  { periodLabel: '11', score: 85 },
  { periodLabel: '12', score: 83 },
  { periodLabel: '13', score: 81 },
  { periodLabel: '14', score: 79 },
  { periodLabel: '15', score: 84 },
  { periodLabel: '16', score: 86 },
  { periodLabel: '17', score: 88 },
  { periodLabel: '18', score: 85 },
  { periodLabel: '19', score: 0 },
  { periodLabel: '20', score: 89 },
  { periodLabel: '21', score: 86 },
  { periodLabel: '22', score: 84 },
  { periodLabel: '23', score: 82 },
  { periodLabel: '24', score: 80 },
  { periodLabel: '25', score: 83 },
  { periodLabel: '26', score: 85 },
  { periodLabel: '27', score: 87 },
  { periodLabel: '28', score: 88 },
  { periodLabel: '29', score: 90 },
  { periodLabel: '30', score: 89 },
  { periodLabel: '31', score: 91 },
];
