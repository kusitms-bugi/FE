import { useMemo } from 'react';
import { usePostureStore } from '../../../store/usePostureStore';
import { Button } from '../../../components/Button/Button';
import WidgetIcon from "@assets/widget.svg?react"
import backgroundImage from "@assets/background.svg"

const MiniRunningPanel = () => {
  const statusText = usePostureStore((state) => state.statusText);

  const runningStatus = useMemo(() => {
    return statusText === '거북목' ? '엉금엉금 가는중..' : '씽씽 가는 중!';
  }, [statusText]);

  return (
    <div className="">
      <div className="flex items-center justify-between mb-4">
        <p className="text-caption-sm-medium text-grey-400">{runningStatus}</p>
        <Button size="xs" variant="sub" text={<div className="flex items-center gap-2 text-yellow-500"><WidgetIcon className="w-[18px] h-[18px]" />위젯</div>} />
      </div>


      <div
        className="h-[421px] w-full rounded-xl bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
    </div>
  );
};

export default MiniRunningPanel;
