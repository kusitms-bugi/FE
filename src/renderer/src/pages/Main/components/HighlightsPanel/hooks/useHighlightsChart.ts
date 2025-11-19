import { useEffect, useMemo, useState } from 'react';
import { getColor } from '../../../../../utils/getColor';
import { MONTHLY_DATA, WEEKLY_DATA, type HighlightDatum } from '../data';

export type HighlightPeriod = 'weekly' | 'monthly';

type ChartColors = {
  previous: string;
  current: string;
};

type ChartConfig = {
  data: HighlightDatum[];
  unitLabel: string;
  maxDomain: number;
  barSize: number;
  barRadius: [number, number, number, number];
  categoryGap: number;
  chartColors: ChartColors;
  // 라벨 색 분리
  labelColor: string; // current(이번 주/달) 라벨 색
  previousLabelColor: string; // previous(저번 주/달) 라벨 색
  labelStyle: {
    fontSize: number;
    fontWeight: number;
    fill: string;
  };
  labelPosition: 'center' | 'top' | 'insideTop';
  gridColor: string;
  yAxisTickColor: string;
  yAxisTicks: number[];
};

export function useHighlightsChart(activePeriod: HighlightPeriod): ChartConfig {
  // 다크모드 상태 감지
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  // CSS 변수에서 색상 가져오기 (다크모드 변경 시 재계산)
  const chartColors = useMemo<ChartColors>(
    () => ({
      previous: getColor('--color-grey-100', '#e3e1df'), // 저번 주/달 바 색
      current: getColor('--color-sementic-brand-primary', '#ffbf00'), // 이번 주/달 바 색
    }),
    [isDark],
  );

  const chartConfig = useMemo<ChartConfig>(() => {
    const gridColorValue = getColor('--color-grey-50', '#efeeed');
    const yAxisTickColorValue = getColor('--color-grey-300', '#a8a7a4');

    const currentLabelColor = getColor('--color-yellow-50', '#fff9e6'); // 이번 주/달 라벨
    const prevLabelColor = getColor('--color-grey-0', '#ffffff'); // 저번 주/달 라벨

    // 공통 스타일
    const baseConfig = {
      unitLabel: '단위: 분/일',
      barSize: 130,
      barRadius: [8, 8, 0, 0] as [number, number, number, number],
      categoryGap: 64,
      chartColors,
      labelColor: currentLabelColor,
      previousLabelColor: prevLabelColor,
      labelStyle: {
        fontSize: 22,
        fontWeight: 700,
        fill: currentLabelColor,
      },
      labelPosition: 'center' as const,
      gridColor: gridColorValue,
      yAxisTickColor: yAxisTickColorValue,
    };

    const domainPadding = 40;

    if (activePeriod === 'weekly') {
      const calculatedMaxValue =
        WEEKLY_DATA.reduce((acc, item) => Math.max(acc, item.value), 0) +
        domainPadding;
      const maxValue = Math.ceil(calculatedMaxValue / 100) * 100;
      const ticks: number[] = Array.from(
        { length: maxValue / 100 + 1 },
        (_, i) => i * 100,
      );

      return {
        ...baseConfig,
        data: WEEKLY_DATA,
        maxDomain: maxValue,
        yAxisTicks: ticks,
      };
    }

    // activePeriod === 'monthly'
    const calculatedMaxValue =
      MONTHLY_DATA.reduce((acc, item) => Math.max(acc, item.value), 0) +
      domainPadding;
    const maxValue = Math.ceil(calculatedMaxValue / 100) * 100;
    const ticks: number[] = Array.from(
      { length: maxValue / 100 + 1 },
      (_, i) => i * 100,
    );

    return {
      ...baseConfig,
      data: MONTHLY_DATA,
      maxDomain: maxValue,
      yAxisTicks: ticks,
    };
  }, [activePeriod, chartColors]);

  return chartConfig;
}
