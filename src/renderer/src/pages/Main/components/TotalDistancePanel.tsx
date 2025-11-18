import { PannelHeader } from '@ui/PannelHeader/PannelHeader';
import AchivementMedal from '../../../assets/main/achivement_meadl.svg?react';

const TotalDistance = () => {
  return (
    <div className="flex flex-col pl-3">
      <PannelHeader>LV.2 거부기까지</PannelHeader>
      <p className="flex items-center gap-2">
        <span className="text-title-4xl-bold text-grey-700">400</span>
        <span className="text-body-lg-meidum text-grey-500">/ 1,200m</span>
      </p>
      {/*게이지 바*/}
      <div className="bg-grey-50 relative my-[13.5px] h-3 w-[calc(100%-16px)] items-center rounded-full">
        <div className="bg-grey-100 absolute top-[2px] left-1/3 z-0 h-2 w-2 -translate-x-1/3 rounded-full"></div>
        <div className="bg-grey-100 absolute top-[2px] left-2/3 z-0 h-2 w-2 -translate-x-2/3 rounded-full"></div>
        {/*진행바 */}
        <div
          className="relative z-10 flex h-full items-center justify-end rounded-full bg-yellow-400 py-[3px] pr-[3px] transition-all duration-1000"
          style={{ width: '25%' }}
        >
          <div className="h-2 w-2 rounded-full bg-yellow-100 opacity-100" />
        </div>
        <AchivementMedal className="absolute top-1/2 right-[-16px] z-10000 -translate-y-1/2" />
      </div>
      <div className="text-caption-xs-regular text-grey-300 flex w-full items-center justify-between">
        {Array.from({ length: 4 }, (_, i) => i * (1200 / 3)).map((value) => (
          <span key={value}>{value}</span>
        ))}
      </div>
    </div>
  );
};

export default TotalDistance;
