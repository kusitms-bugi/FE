import * as React from "react";

import CalendarIcon from "@assets/calendar.svg?react";
import ChevronRigthIcon from "@assets/chevron-right.svg?react";
import ClockIcon from "@assets/clock.svg?react";
import GlassHourIcon from "@assets/hourglass.svg?react";
import TumbupIcon from "@assets/thumbup.svg?react";
import { PannelHeader } from "../../../components/PannelHeader/PannelHeader";

type PatternHeaderIcon = "thumb" | "clock" | "calendar" | "hourglass";

interface PatternHeaderProps {
  children?: React.ReactNode;
  icon: PatternHeaderIcon;
  className?: string;
  iconSize?: number;
}

const iconMap: Record<PatternHeaderIcon, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
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
        className={`flex items-center gap-1 text-caption-sm-medium text-grey-400 ${className ?? ""}`}
      >
        <span
          className="inline-flex items-center justify-center rounded-full bg-grey-50"
          style={{ width: iconSize, height: iconSize }}
        >
          <IconComp
            className="text-grey-200 [&_*]:fill-none  [&_line]:stroke-current"
            style={{ width: iconSize, height: iconSize }}
            aria-hidden
          />
        </span>
        <span>{children}</span>
      </div>
    );
  }
);
PatternHeader.displayName = "PatternHeader";

const PosePatternPanel = () => {
  return (
    <div className="p-4 h-full flex flex-col min-h-0 gap-3">
      <PannelHeader>자세 패턴 분석</PannelHeader>

      <div className="flex flex-col bg-grey-25 shrink-0 p-3 rounded-2xl gap-3">
        <div className="text-caption-sm-medium flex justify-between items-center text-yellow-400">TIP <ChevronRigthIcon className="stroke-current" /></div>
        <div className="text-grey-600 text-caption-sm-medium">
          금요일 오후 2시에 자세가 급격히 나빠져요! 이 시간대에 맞춰 스트레칭 알림을 설정해드릴까요?
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 auto-rows-fr flex-1 min-h-0">
        <div className="rounded-xl bg-grey-25 p-3 h-full flex flex-col justify-between">
          <PatternHeader icon="clock" className="mb-1">안좋은 시간</PatternHeader>
          <div className="text-grey-600 text-headline-2xl-semibold">오후 2시</div>
        </div>

        <div className="rounded-xl bg-grey-25 p-3 h-full flex flex-col justify-between">
          <PatternHeader icon="calendar" className="mb-1">안좋은 요일</PatternHeader>
          <div className="text-grey-600 text-headline-2xl-semibold">수요일</div>
        </div>

        <div className="rounded-xl bg-grey-25 p-3 h-full flex flex-col justify-between">
          <PatternHeader icon="hourglass" className="mb-1">회복까지 평균</PatternHeader>
          <div className="text-grey-600 text-headline-2xl-semibold">18분</div>
        </div>

        <div className="rounded-xl bg-grey-25 p-3 h-full flex flex-col justify-between">
          <PatternHeader icon="thumb" className="mb-1">가장 좋은 시간</PatternHeader>
          <div className="text-grey-600 text-headline-2xl-semibold">오전 10시</div>
        </div>
      </div>
    </div>
  );
};


export default PosePatternPanel;
