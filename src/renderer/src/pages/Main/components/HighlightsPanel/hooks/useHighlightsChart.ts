import { useEffect, useMemo, useState } from 'react';
import { getColor } from '../../../../../utils/getColor';
import { MONTHLY_DATA, WEEKLY_DATA, type HighlightDatum } from '../data';

export type HighlightPeriod = 'weekly' | 'monthly';

type ChartColors = {
  weekly: {
    previous: string;
    current: string;
  };
  monthly: {
    single: string;
  };
};

type ChartConfig = {
  data: HighlightDatum[];
  unitLabel: string;
  maxDomain: number;
  barSize: number;
  barRadius: [number, number, number, number];
  categoryGap: number;
  weeklyColors: ChartColors['weekly'] | null;
  monthlyColor: string | null;
  labelColor: string;
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

export function useHighlightsChart(activePeriod: HighlightPeriod) {
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
      weekly: {
        previous: getColor('--color-yellow-200', '#ffe28a'),
        current: getColor('--color-sementic-brand-primary', '#ffbf00'),
      },
      monthly: {
        single: getColor('--color-sementic-brand-primary', '#ffbf00'),
      },
    }),
    [isDark],
  );

  const chartConfig = useMemo<ChartConfig>(() => {
    const gridColorValue = getColor('--color-grey-50', '#efeeed');
    const yAxisTickColorValue = getColor('--color-grey-300', '#a8a7a4');

    if (activePeriod === 'weekly') {
      const domainPadding = 40;
      const calculatedMaxValue =
        WEEKLY_DATA.reduce((acc, item) => Math.max(acc, item.value), 0) +
        domainPadding;

      // 100의 배수로 올림 처리
      const maxValue = Math.ceil(calculatedMaxValue / 100) * 100;

      // 100단위로 ticks 생성
      const ticks: number[] = [];
      for (let i = 0; i <= maxValue; i += 100) {
        ticks.push(i);
      }

      return {
        data: WEEKLY_DATA,
        unitLabel: '단위: 분/일',
        maxDomain: maxValue,
        barSize: 72,
        barRadius: [16, 16, 0, 0] as [number, number, number, number],
        categoryGap: 64,
        weeklyColors: chartColors.weekly,
        monthlyColor: null,
        labelColor: getColor('--color-yellow-50', '#fff9e6'),
        labelStyle: {
          fontSize: 22,
          fontWeight: 700,
          fill: getColor('--color-yellow-50', '#fff9e6'),
        },
        labelPosition: 'center' as const,
        gridColor: gridColorValue,
        yAxisTickColor: yAxisTickColorValue,
        yAxisTicks: ticks,
      };
    }

    const domainPadding = 60;
    const calculatedMaxValue =
      MONTHLY_DATA.reduce((acc, item) => Math.max(acc, item.value), 0) +
      domainPadding;

    // 100의 배수로 올림 처리
    const maxValue = Math.ceil(calculatedMaxValue / 100) * 100;

    // 100단위로 ticks 생성
    const ticks: number[] = [];
    for (let i = 0; i <= maxValue; i += 100) {
      ticks.push(i);
    }

    return {
      data: MONTHLY_DATA,
      unitLabel: '단위: 분/일',
      maxDomain: maxValue,
      barSize: 28,
      barRadius: [6, 6, 0, 0] as [number, number, number, number],
      categoryGap: 24,
      weeklyColors: null,
      monthlyColor: chartColors.monthly.single,
      labelColor: getColor('--color-grey-300', '#a8a7a4'),
      labelStyle: {
        fontSize: 14,
        fontWeight: 500,
        fill: getColor('--color-grey-300', '#a8a7a4'),
      },
      labelPosition: 'top' as const,
      gridColor: gridColorValue,
      yAxisTickColor: yAxisTickColorValue,
      yAxisTicks: ticks,
    };
  }, [activePeriod, chartColors, isDark]);

  return chartConfig;
}
