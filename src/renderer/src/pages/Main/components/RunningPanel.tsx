import BackgroundVideo from '@assets/video/background.webm';
import BugiVideo from '@assets/video/bugi.webm';
import RiniVideo from '@assets/video/rini.webm';
import WidgetIcon from '@assets/widget.svg?react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../../components/Button/Button';
import { usePostureStore } from '../../../store/usePostureStore';
import { cn } from '../../../utils/cn';

const RunningPanel = () => {
  const statusText = usePostureStore((state) => state.statusText);
  const isTurtle = statusText === '거북목';
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  const gradient = isTurtle
    ? 'linear-gradient(90deg, var(--color-coral-red) 0%, var(--color-error) 100%)'
    : 'linear-gradient(90deg, var(--color-olive-green) 0.18%, var(--color-success) 99.7%)';

  const runningStatus = useMemo(() => {
    return isTurtle ? '엉금엉금 가는중..' : '씽씽 가는 중!';
  }, [isTurtle]);

  // 위젯 창 상태 확인
  useEffect(() => {
    const checkWidgetStatus = async () => {
      if (window.electronAPI?.widget) {
        const isOpen = await window.electronAPI.widget.isOpen();
        setIsWidgetOpen(isOpen);
      }
    };

    checkWidgetStatus();

    // 주기적으로 위젯 상태 확인 (위젯이 외부에서 닫힐 수 있음)
    const interval = setInterval(checkWidgetStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // 위젯 열기/닫기 핸들러
  const handleToggleWidget = async () => {
    try {
      if (window.electronAPI?.widget) {
        if (isWidgetOpen) {
          await window.electronAPI.widget.close();
          setIsWidgetOpen(false);
          console.log('위젯 창이 닫혔습니다');

          // 위젯 닫힘 로그 저장
          if (window.electronAPI?.writeLog) {
            try {
              const logData = JSON.stringify({
                event: 'widget_closed',
                timestamp: new Date().toISOString(),
              });
              await window.electronAPI.writeLog(logData);
            } catch (error) {
              console.error('위젯 닫힘 로그 저장 실패:', error);
            }
          }
        } else {
          await window.electronAPI.widget.open();
          setIsWidgetOpen(true);
          console.log('위젯 창이 열렸습니다');

          // 위젯 열림 로그 저장
          if (window.electronAPI?.writeLog) {
            try {
              const logData = JSON.stringify({
                event: 'widget_opened',
                timestamp: new Date().toISOString(),
              });
              await window.electronAPI.writeLog(logData);
            } catch (error) {
              console.error('위젯 열림 로그 저장 실패:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('위젯 창 토글 실패:', error);
    }
  };

  return (
    <div className="">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-caption-sm-medium text-grey-400">{runningStatus}</p>
        <Button
          size="xs"
          variant="sub"
          onClick={handleToggleWidget}
          text={
            <div className="flex items-center gap-2 text-yellow-500">
              <WidgetIcon className="h-[18px] w-[18px]" />
              위젯
            </div>
          }
        />
      </div>

      <div className="relative h-[421px] w-full overflow-hidden rounded-xl">
        {/* 배경 영상 */}
        <video
          src={BackgroundVideo}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full rounded-xl object-cover"
        />

        {/* 게이지바 */}
        <div className="relative z-10 mx-4 mt-4">
          {/* 흰색 트랙 */}
          <div className="bg-grey-50 relative h-5 w-full rounded-full">
            {/* 진행 바 */}
            <div
              className="flex h-full items-center justify-end rounded-full py-[3px] pr-[3px] transition-all duration-1000"
              style={{
                width: isTurtle ? '25%' : '75%',
                background: gradient,
              }}
            >
              <div className="bg-dot h-[14px] w-[14px] rounded-full opacity-50" />
            </div>
          </div>
        </div>

        {/* 움직이는 동영상 영역 */}
        <div
          className={cn(
            'relative z-10 mt-12 flex items-center justify-center px-4',
          )}
        >
          <video
            src={isTurtle ? BugiVideo : RiniVideo}
            autoPlay
            loop
            muted
            playsInline
            className="h-auto max-h-[320px] w-full rounded-lg bg-transparent object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default RunningPanel;
