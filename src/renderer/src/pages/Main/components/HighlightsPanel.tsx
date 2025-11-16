import { useState, type ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

import { PannelHeader } from '../../../components/PannelHeader/PannelHeader';
import { ToggleSwitch } from '../../../components/ToggleSwitch/ToggleSwitch';
import type { HighlightDatum } from './HighlightsPanel/data';
import {
  useHighlightsChart,
  type HighlightPeriod,
} from './HighlightsPanel/hooks/useHighlightsChart';

const HighlightsPanel = () => {
  const [activePeriod, setActivePeriod] = useState<HighlightPeriod>('weekly');

  const {
    data,
    unitLabel,
    maxDomain,
    barSize,
    barRadius,
    categoryGap,
    weeklyColors,
    monthlyColor,
    labelStyle,
    labelPosition,
    gridColor,
    yAxisTicks,
  } = useHighlightsChart(activePeriod);

  const handleToggleChange = (isMonthly: boolean) => {
    setActivePeriod(isMonthly ? 'monthly' : 'weekly');
  };

  return (
    <div className="flex h-full flex-col rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <PannelHeader>하이라이트</PannelHeader>
        <ToggleSwitch
          uncheckedLabel="주간"
          checkedLabel="월간"
          checked={activePeriod === 'monthly'}
          onChange={handleToggleChange}
        />
      </div>
      <div className="flex items-center justify-end">
        <span className="text-caption-xs-regular text-grey-400">
          {unitLabel}
        </span>
      </div>
      <div className="mt-6 min-h-[220px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            barSize={barSize}
            barCategoryGap={categoryGap}
            margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
          >
            {weeklyColors ? (
              <defs>
                <linearGradient
                  id="previousBarGradient"
                  x1="0"
                  y1="1"
                  x2="0"
                  y2="0"
                >
                  <stop offset="0%" stopColor={weeklyColors.previous} />
                  <stop offset="100%" stopColor={weeklyColors.previous} />
                </linearGradient>
                <linearGradient
                  id="currentBarGradient"
                  x1="0"
                  y1="1"
                  x2="0"
                  y2="0"
                >
                  <stop offset="0%" stopColor={weeklyColors.current} />
                  <stop offset="100%" stopColor={weeklyColors.current} />
                </linearGradient>
              </defs>
            ) : null}
            <CartesianGrid
              vertical={false}
              stroke={gridColor}
              strokeDasharray="0"
            />
            <XAxis
              dataKey="periodLabel"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#a8a7a4', fontSize: 10, fontWeight: 400 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#a8a7a4', fontSize: 10, fontWeight: 400 }}
              domain={[0, maxDomain]}
              ticks={yAxisTicks}
              width={30}
            />
            <Bar dataKey="value" radius={barRadius} background={false}>
              {data.map((datum: HighlightDatum) => (
                <Cell
                  key={datum.periodLabel}
                  fill={
                    weeklyColors
                      ? datum.barKey === 'current'
                        ? 'url(#currentBarGradient)'
                        : 'url(#previousBarGradient)'
                      : (monthlyColor ?? undefined)
                  }
                />
              ))}
              <LabelList
                dataKey="value"
                position={labelPosition}
                formatter={(value: ReactNode) => {
                  if (typeof value === 'number') {
                    return value.toString();
                  }
                  if (typeof value === 'string') {
                    return value;
                  }
                  return '';
                }}
                style={labelStyle}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HighlightsPanel;
