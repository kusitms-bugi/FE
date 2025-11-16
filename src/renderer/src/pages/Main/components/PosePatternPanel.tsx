import * as React from 'react';

import CalendarIcon from '@assets/calendar.svg?react';
import ChevronRigthIcon from '@assets/chevron-right.svg?react';
import ClockIcon from '@assets/clock.svg?react';
import GlassHourIcon from '@assets/hourglass.svg?react';
import TumbupIcon from '@assets/thumbup.svg?react';
import { PannelHeader } from '../../../components/PannelHeader/PannelHeader';

type PatternHeaderIcon = 'thumb' | 'clock' | 'calendar' | 'hourglass';

interface PatternHeaderProps {
  children?: React.ReactNode;
  icon: PatternHeaderIcon;
  className?: string;
  iconSize?: number;
}

const iconMap: Record<
  PatternHeaderIcon,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  thumb: TumbupIcon,
  clock: ClockIcon,
  calendar: CalendarIcon,
  hourglass: GlassHourIcon,
};

const PatternHeader = React.forwardRef<HTMLDivElement, PatternHeaderProps>(
  ({ children, icon, className, iconSize = 20 }, ref) => {
    const IconComp = iconMap[icon];

    return (
      <div
        ref={ref}
        className={`text-caption-sm-medium text-grey-400 flex items-center gap-1 ${className ?? ''}`}
      >
        <span
          className="bg-grey-50 inline-flex items-center justify-center rounded-full"
          style={{ width: iconSize, height: iconSize }}
        >
          <IconComp
            className="text-grey-200 [&_*]:fill-none [&_line]:stroke-current"
            style={{ width: iconSize, height: iconSize }}
            aria-hidden
          />
        </span>
        <span>{children}</span>
      </div>
    );
  },
);
PatternHeader.displayName = 'PatternHeader';

const PosePatternPanel = () => {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-4">
      <PannelHeader>자세 패턴 분석</PannelHeader>

      <div className="bg-grey-25 flex shrink-0 flex-col gap-3 rounded-2xl p-3">
        <div className="text-caption-sm-medium flex items-center justify-between text-yellow-400">
          TIP <ChevronRigthIcon className="stroke-current" />
        </div>
        <div className="text-grey-600 text-caption-sm-medium">
          금요일 오후 2시에 자세가 급격히 나빠져요! 이 시간대에 맞춰 스트레칭
          알림을 설정해드릴까요?
        </div>
      </div>

      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-2 gap-2">
        <div className="bg-grey-25 flex h-full flex-col justify-between rounded-xl p-3">
          <PatternHeader icon="clock" className="mb-1">
            안좋은 시간
          </PatternHeader>
          <div className="text-grey-600 text-headline-2xl-semibold">
            오후 2시
          </div>
        </div>

        <div className="bg-grey-25 flex h-full flex-col justify-between rounded-xl p-3">
          <PatternHeader icon="calendar" className="mb-1">
            안좋은 요일
          </PatternHeader>
          <div className="text-grey-600 text-headline-2xl-semibold">수요일</div>
        </div>

        <div className="bg-grey-25 flex h-full flex-col justify-between rounded-xl p-3">
          <PatternHeader icon="hourglass" className="mb-1">
            회복까지 평균
          </PatternHeader>
          <div className="text-grey-600 text-headline-2xl-semibold">18분</div>
        </div>

        <div className="bg-grey-25 flex h-full flex-col justify-between rounded-xl p-3">
          <PatternHeader icon="thumb" className="mb-1">
            가장 좋은 시간
          </PatternHeader>
          <div className="text-grey-600 text-headline-2xl-semibold">
            오전 10시
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosePatternPanel;
