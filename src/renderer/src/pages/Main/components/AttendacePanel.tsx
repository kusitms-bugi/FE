import DownIcon from "@assets/arrow-narrow-down.svg?react";
import UpIcon from "@assets/arrow-narrow-up.svg?react";
import { IntensitySlider } from "../../../components/IntensitySlider/IntensitySlider";
import { PageMoveButton } from "../../../components/PageMoveButton/PageMoveButton";
import { PannelHeader } from "../../../components/PannelHeader/PannelHeader";
import { ToggleSwitch } from "../../../components/ToggleSwitch/ToggleSwitch";


const Calendar = () => {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 7의 배수 칸으로 맞추기 (마지막 주 패딩)
  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
  const trailing = totalCells - (firstDayOfMonth + daysInMonth);

  const calendarDays: (number | null)[] = [
    ...(Array(firstDayOfMonth).fill(null) as (number | null)[]),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ...Array(trailing).fill(null),
  ];

  return (
    <div className="w-full h-[150px]">
      <div className="grid grid-cols-7 gap-x-1 text-center text-grey-400 text-caption-2xs-medium">
        {days.map((day, i) => (
          <div key={day} className={i === 0 ? "text-point-red" : undefined}>
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-x-1 gap-y-1 text-center mt-[5px] h-full">
        {calendarDays.map((day, index) => (
          <div key={index} className="flex justify-center items-center">
            {day !== null && (
              <div className="bg-yellow-300 h-[18px] w-[18px] rounded-full" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};



const AttendacePanel = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;

  return (
    <div className="p-4 gap-2 grid grid-cols-4 grid-rows-[57px_1fr_1fr_1fr] h-full w-full">
      <div className="flex flex-col">
        <PannelHeader>출석 현황</PannelHeader>
        <div className="text-headline-3xl-semibold text-grey-700">
          {currentMonth}월
        </div>
      </div>
      <div className="p-[9px] flex justify-end items-end">
        <div className="flex gap-2"><PageMoveButton /><PageMoveButton direction="next" />
        </div>
      </div>
      <div></div>
      <div className="flex flex-col gap-3 justify-end items-end">
        <ToggleSwitch
          uncheckedLabel="월간"
          checkedLabel="연간"
          checked={false}
          onChange={() => { }}
        />
        <IntensitySlider
          leftLabel="Less"
          rightLabel="More"
        />
      </div>
      <div className="col-span-2 row-span-3">
        <Calendar />
      </div>
      <div className="col-span-2 row-span-3 p-3 bg-grey-25 rounded-xl">
        <div className="flex flex-col h-[76px] gap-3 mb-2">
          <div className="text-grey-700 text-body-md-semibold">잘하고 있어요</div>
          <div className="flex flex-col gap-1 text-caption-2xs-regular text-grey-600">
            <div className="flex gap-1 items-center"><UpIcon />첫날보다 기린 시간이 하루 평균 45분 늘었어요</div>
            <div className="flex gap-1 items-center"><DownIcon />가장 나빴던 뽀각거부기 상태가 80% 감소했어요</div>
          </div>
        </div>
        <div className="h-px w-full bg-grey-50" />
        <div className="w-full h-[calc(100%-84px)] flex items-center justify-center text-grey-500 text-caption-sm-medium">당신은 매일 골든리트리버 한 마리를 목에 업고 작업한 것과 같아요 🥺</div>
      </div>
    </div>
  );
};

export default AttendacePanel;
