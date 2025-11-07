import { useMemo } from 'react';
import { usePostureStore } from '../../../store/usePostureStore';
import { Button } from '../../../components/Button/Button';
import WidgetIcon from "@assets/widget.svg?react"
import backgroundImage from "@assets/background.svg"
import bugiVideo from "@assets/video/bugi.gif"
import { cn } from '../../../utils/cn';

const MiniRunningPanel = () => {
  const statusText = usePostureStore((state) => state.statusText);
  const isTurtle = statusText === '거북목';

  const runningStatus = useMemo(() => {
    return isTurtle ? '엉금엉금 가는중..' : '씽씽 가는 중!';
  }, [isTurtle]);

  return (
    <div className="">
      <div className="flex items-center justify-between mb-4">
        <p className="text-caption-sm-medium text-grey-400">{runningStatus}</p>
        <Button size="xs" variant="sub" text={<div className="flex items-center gap-2 text-yellow-500"><WidgetIcon className="w-[18px] h-[18px]" />위젯</div>} />
      </div>


      <div
        className=" h-[421px] w-full rounded-xl bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* 게이지바 */}
        <div className="mt-4 mx-4">
          {/* 흰색 트랙 */}
          <div className="h-6 w-full bg-white rounded-full shadow-sm">
            {/* 산호색 진행 바 (약 25-30%) */}
            <div
              className={cn("h-full rounded-full transition-all duration-1000", isTurtle ? 'bg-point-red' : 'bg-point-green')}
              style={{ width: isTurtle ? '25%' : '75%' }}
            />
          </div>
        </div>


        {/* 움직이는 동영상 영역 */}
        <div className="mt-26 px-4 flex items-center justify-center">
          <img src={bugiVideo} alt="Running animation" className="w-full h-auto max-h-[320px] rounded-lg object-contain bg-transparent" />
        </div>
      </div>



    </div >
  );
};

export default MiniRunningPanel;
