import LevelMarker from '../../../assets/main/downward_caret.svg?react';
import Character from '../../../assets/main/level1_character.svg?react';

const AveragePosturePanel = () => {
  return (
    <div className="relative h-full w-full rounded-3xl bg-[image:var(--color-average-score)] p-4">
      <div className="items center flex justify-between">
        <p className="text-caption-sm-medium flex min-w-[120px] flex-col text-yellow-100">
          <span>평균 자세 점수</span>
          <span className="text-title-4xl-bold text-grey-0 mb-4">47점</span>
          <span className="text-caption-xs-meidum text-yellow-50">
            목 평균 기울기 약 23.1도
            <br />
            예상 부하 하중 약 6kg
          </span>
        </p>
        <p className="flex flex-col items-end gap-1">
          <span className="text-caption-xs-meidum h-[26px] w-[61px] rounded-full bg-yellow-50 px-2 py-1 text-yellow-500">
            쑥쑥 기린
          </span>
          <Character className="aspect-[114.3/127] h-full" />
        </p>
      </div>

      <div className="absolute inset-x-4 bottom-4 flex flex-col">
        <p className="text-caption-body-md-meidum text-yellow text-yellow-200">
          Level
        </p>
        <div className="mb-1 flex h-[11px] w-full items-end justify-center">
          <LevelMarker className="[&>path]:fill-yellow-50" />
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <span
              key={index}
              className="h-[6px] flex-[1_0_0] rounded-full bg-yellow-50"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AveragePosturePanel;
