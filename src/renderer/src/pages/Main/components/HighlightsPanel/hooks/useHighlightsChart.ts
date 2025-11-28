import { useEffect, useMemo, useState } from 'react';
import { useHighlightQuery } from '@entities/dashboard';
import { getColor } from '@shared/lib/get-color';
import type { HighlightDatum } from '../data';

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

  // 현재 날짜 기준으로 year, month 계산
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // getMonth()는 0-11 반환

  // API 호출
  const { data: highlightData, isLoading } = useHighlightQuery({
    period: activePeriod === 'weekly' ? 'WEEKLY' : 'MONTHLY',
    year: currentYear,
    month: activePeriod === 'monthly' ? currentMonth : undefined,
  });

  // API 데이터를 차트 데이터 형식으로 변환
  const chartData = useMemo<HighlightDatum[]>(() => {
    const periodLabel =
      activePeriod === 'weekly'
        ? ['저번 주', '이번 주']
        : ['저번 달', '이번 달'];

    // 데이터가 없거나 로딩 중일 때 기본값 반환
    if (!highlightData?.data || isLoading) {
      return [
        {
          periodLabel: periodLabel[0],
          value: 0,
          barKey: 'previous',
        },
        {
          periodLabel: periodLabel[1],
          value: 0,
          barKey: 'current',
        },
      ];
    }

    return [
      {
        periodLabel: periodLabel[0],
        value: highlightData.data.previous,
        barKey: 'previous',
      },
      {
        periodLabel: periodLabel[1],
        value: highlightData.data.current,
        barKey: 'current',
      },
    ];
  }, [highlightData, activePeriod, isLoading]);

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

    // 데이터가 없거나 로딩 중일 때 기본값 설정
    const calculatedMaxValue =
      chartData.length > 0
        ? chartData.reduce((acc, item) => Math.max(acc, item.value), 0) +
          domainPadding
        : domainPadding;
    const maxValue = Math.ceil(calculatedMaxValue / 100) * 100;
    const ticks: number[] = Array.from(
      { length: maxValue / 100 + 1 },
      (_, i) => i * 100,
    );

    return {
      ...baseConfig,
      data: chartData,
      maxDomain: maxValue,
      yAxisTicks: ticks,
    };
  }, [activePeriod, chartColors, chartData]);

  return chartConfig;
}
