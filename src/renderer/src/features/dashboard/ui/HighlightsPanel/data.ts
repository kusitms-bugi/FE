import i18n from '@shared/lib/i18n/i18n'

export type HighlightDatum = {
  periodLabel: string
  value: number
  barKey: 'previous' | 'current'
}

export const WEEKLY_DATA: HighlightDatum[] = [
  {
    periodLabel: i18n.t('저번 주', { ns: 'dashboard' }),
    value: 257,
    barKey: 'previous',
  },
  {
    periodLabel: i18n.t('이번 주', { ns: 'dashboard' }),
    value: 321,
    barKey: 'current',
  },
]

export const MONTHLY_DATA: HighlightDatum[] = [
  { periodLabel: i18n.t('저번 달', { ns: 'dashboard' }), value: 210, barKey: 'previous' },
  { periodLabel: i18n.t('이번 달', { ns: 'dashboard' }), value: 225, barKey: 'current' },
]
