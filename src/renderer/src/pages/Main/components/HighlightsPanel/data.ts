export type HighlightDatum = {
  periodLabel: string;
  value: number;
  barKey: 'previous' | 'current';
};

export const WEEKLY_DATA: HighlightDatum[] = [
  {
    periodLabel: '저번 주',
    value: 257,
    barKey: 'previous',
  },
  {
    periodLabel: '이번 주',
    value: 321,
    barKey: 'current',
  },
];

export const MONTHLY_DATA: HighlightDatum[] = [
  { periodLabel: '1월', value: 210, barKey: 'current' },
  { periodLabel: '2월', value: 225, barKey: 'current' },
  { periodLabel: '3월', value: 240, barKey: 'current' },
  { periodLabel: '4월', value: 255, barKey: 'current' },
  { periodLabel: '5월', value: 270, barKey: 'current' },
  { periodLabel: '6월', value: 285, barKey: 'current' },
  { periodLabel: '7월', value: 295, barKey: 'current' },
  { periodLabel: '8월', value: 305, barKey: 'current' },
  { periodLabel: '9월', value: 312, barKey: 'current' },
  { periodLabel: '10월', value: 318, barKey: 'current' },
  { periodLabel: '11월', value: 326, barKey: 'current' },
  { periodLabel: '12월', value: 334, barKey: 'current' },
];
