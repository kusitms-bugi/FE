import { useEffect, useMemo, useState } from 'react';
import { getColor } from '@utils/getColor';
import { usePostureGraphQuery } from '@api/dashboard/usePostureGraphQuery';

type AverageGraphDatum = {
  periodLabel: string;
  score: number;
};

export type AverageGraphPeriod = 'weekly' | 'monthly';

type ChartConfig = {
  data: AverageGraphDatum[];
  maxDomain: number;
  fillColor: string;
  strokeColor: string;
  gridColor: string;
  yAxisTicks: number[];
};

export function useAverageGraphChart(activePeriod: AverageGraphPeriod) {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );

  const { data: apiData } = usePostureGraphQuery();

  /* html의 class 속성 변경될 때마다 콜백 실행(다크모드 감지) */
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

  /* 그래프 색상 */
  const chartConfig = useMemo<ChartConfig>(() => {
    const gridColorValue = getColor('--color-grey-50', '#efeeed');
    const fillColorValue = getColor('--color-yellow-200', '#ffe28a');
    const strokeColorValue = getColor(
      '--color-sementic-brand-primary',
      '#ffbf00',
    );

    /* API 데이터를 그래프 형식으로 변환 */
    let data: AverageGraphDatum[] = [];
    if (apiData?.data?.points) {
      const points = apiData.data.points;
      const sortedEntries = Object.entries(points).sort(([dateA], [dateB]) =>
        dateA.localeCompare(dateB),
      );

      /* 주간: 최근 7일, 월간: 전체 31일 */
      const slicedEntries =
        activePeriod === 'weekly' ? sortedEntries.slice(-7) : sortedEntries;

      data = slicedEntries.map(([date, score]) => ({
        periodLabel: new Date(date).getDate().toString(),
        score,
      }));
    }

    /* 최댓값 100 */
    const domainMax = 100;

    /* y축 눈금 */
    const ticks: number[] = [25, 50, 75, 100];

    return {
      data,
      maxDomain: domainMax,
      fillColor: fillColorValue,
      strokeColor: strokeColorValue,
      gridColor: gridColorValue,
      yAxisTicks: ticks,
    };
  }, [activePeriod, isDark, apiData]);

  return chartConfig;
}
