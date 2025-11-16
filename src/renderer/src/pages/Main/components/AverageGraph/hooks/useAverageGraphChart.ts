import { useEffect, useMemo, useState } from 'react';
import { getColor } from '../../../../../utils/getColor';
import { MONTHLY_DATA, WEEKLY_DATA, type AverageGraphDatum } from '../data';

{
  /* 주간/월간 */
}
export type AverageGraphPeriod = 'weekly' | 'monthly';

type ChartConfig = {
  data: AverageGraphDatum[];
  maxDomain: number; //y축 최대값
  fillColor: string; //영역 채우기 색상
  strokeColor: string; //선 색상
  gridColor: string; //격자선 색상
  yAxisTicks: number[];
};

export function useAverageGraphChart(activePeriod: AverageGraphPeriod) {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );

  /* html의 class 속성 변경될 때마다 콜백 실행(다크모드 감지) */
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true, //속성 변경 감지지
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  const chartConfig = useMemo<ChartConfig>(() => {
    const gridColorValue = getColor('--color-grey-50', '#efeeed');
    const fillColorValue = getColor('--color-yellow-200', '#ffe28a');
    const strokeColorValue = getColor(
      '--color-sementic-brand-primary',
      '#ffbf00',
    );

    const data = activePeriod === 'weekly' ? WEEKLY_DATA : MONTHLY_DATA;

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
  }, [activePeriod, isDark]);

  return chartConfig;
}
