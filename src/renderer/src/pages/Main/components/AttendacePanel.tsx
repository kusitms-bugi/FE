import DownIcon from '@assets/arrow-narrow-down.svg?react';
import UpIcon from '@assets/arrow-narrow-up.svg?react';
import { useState } from 'react';
import { IntensitySlider } from '../../../components/IntensitySlider/IntensitySlider';
import { PageMoveButton } from '../../../components/PageMoveButton/PageMoveButton';
import { PannelHeader } from '../../../components/PannelHeader/PannelHeader';
import { ToggleSwitch } from '../../../components/ToggleSwitch/ToggleSwitch';

type CalendarProps = { year: number; month: number }; // month: 0~11

const Calendar = ({ year, month }: CalendarProps) => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 7의 배수 칸으로 맞추기 (마지막 주 패딩)
  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
  const trailing = totalCells - (firstDayOfMonth + daysInMonth);

  const calendarDays: (number | null)[] = [
    ...(Array(firstDayOfMonth).fill(null) as (number | null)[]),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ...(Array(trailing).fill(null) as (number | null)[]),
  ];

  return (
    <div className="h-[150px] w-full">
      {/* 요일 헤더 */}
      <div className="text-grey-400 text-caption-2xs-medium grid grid-cols-7 gap-x-1 text-center">
        {days.map((day, i) => (
          <div key={day} className={i === 0 ? 'text-point-red' : undefined}>
            {day}
          </div>
        ))}
      </div>

      {/* 이번 달 칸만 동그라미 */}
      <div className="mt-[5px] grid h-full grid-cols-7 gap-x-1 gap-y-1 text-center">
        {calendarDays.map((day, index) => (
          <div key={index} className="flex items-center justify-center">
            {day !== null && (
              <div className="h-[18px] w-[18px] rounded-full bg-yellow-300" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const AttendacePanel = () => {
  // 오늘 월(1일)로 정규화
  const today = new Date();
  const todayYm = new Date(today.getFullYear(), today.getMonth(), 1);

  const [viewDate, setViewDate] = useState<Date>(todayYm);
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth(); // 0~11

  const clampToTodayMonth = (d: Date) => {
    const y = d.getFullYear();
    const m = d.getMonth();
    const ty = todayYm.getFullYear();
    const tm = todayYm.getMonth();
    if (y > ty || (y === ty && m > tm)) return todayYm; // 미래 달로 못감
    return d;
  };

  const addMonthsSafe = (base: Date, delta: number) =>
    clampToTodayMonth(new Date(base.getFullYear(), base.getMonth() + delta, 1));

  const isAtCurrentMonth =
    viewYear === todayYm.getFullYear() && viewMonth === todayYm.getMonth();

  return (
    <div className="grid h-full w-full grid-cols-4 grid-rows-[57px_1fr_1fr_1fr] gap-2 p-4">
      <div className="flex flex-col">
        <PannelHeader>출석 현황</PannelHeader>
        <div className="text-headline-3xl-semibold text-grey-700">
          {viewMonth + 1}월
        </div>
      </div>

      {/* ←/→ 월 이동 버튼 */}
      <div className="flex items-end justify-end p-[9px]">
        <div className="flex gap-2">
          <PageMoveButton
            direction="prev"
            onClick={() => setViewDate((d) => addMonthsSafe(d, -1))}
          />
          <PageMoveButton
            direction="next"
            onClick={() => setViewDate((d) => addMonthsSafe(d, +1))}
            disabled={isAtCurrentMonth}
          />
        </div>
      </div>

      <div></div>

      <div className="flex flex-col items-end justify-end gap-3">
        <ToggleSwitch
          uncheckedLabel="월간"
          checkedLabel="연간"
          checked={false}
          onChange={() => {}}
        />
        <IntensitySlider leftLabel="Less" rightLabel="More" />
      </div>

      <div className="col-span-2 row-span-3">
        <Calendar year={viewYear} month={viewMonth} />
      </div>

      <div className="bg-grey-25 col-span-2 row-span-3 rounded-xl p-3">
        <div className="mb-2 flex h-[76px] flex-col gap-3">
          <div className="text-grey-700 text-body-md-semibold">
            잘하고 있어요
          </div>
          <div className="text-caption-2xs-regular text-grey-600 flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <UpIcon />
              첫날보다 기린 시간이 하루 평균 45분 늘었어요
            </div>
            <div className="flex items-center gap-1">
              <DownIcon />
              가장 나빴던 뽀각거부기 상태가 80% 감소했어요
            </div>
          </div>
        </div>
        <div className="bg-grey-50 h-px w-full" />
        <div className="text-grey-500 text-caption-sm-medium flex h-[calc(100%-84px)] w-full items-center">
          당신은 매일 골든리트리버 한 마리를 목에 업고 작업한 것과 같아요 🥺
        </div>
      </div>
    </div>
  );
};

export default AttendacePanel;
