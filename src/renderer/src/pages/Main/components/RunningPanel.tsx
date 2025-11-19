import AngelRiniVideo from '@assets/video/angel-rini.webm';
import BackgroundVideo from '@assets/video/background.webm';
import BugiVideo from '@assets/video/bugi.webm';
import PmRiniVideo from '@assets/video/pm-rini.webm';
import RiniVideo from '@assets/video/rini.webm';
import StoneBugiVideo from '@assets/video/stone-bugi.webm';
import TireBugiVideo from '@assets/video/tire-bugi.webm';
import WidgetIcon from '@assets/widget.svg?react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../../components/Button/Button';
import { usePostureStore } from '../../../store/usePostureStore';
import { cn } from '../../../utils/cn';
import { getScoreLevel } from '../../../utils/getScoreLevel';

const RunningPanel = () => {
  const score = usePostureStore((state) => state.score);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  // 점수 기반 레벨 계산
  const levelInfo = useMemo(() => getScoreLevel(score), [score]);

  // 레벨에 따른 비디오 선택
  const levelVideo = useMemo(() => {
    switch (levelInfo.level) {
      case 1:
        return AngelRiniVideo;
      case 2:
        return PmRiniVideo;
      case 3:
        return RiniVideo;
      case 4:
        return BugiVideo;
      case 5:
        return StoneBugiVideo;
      case 6:
        return TireBugiVideo;
      default:
        return RiniVideo;
    }
  }, [levelInfo.level]);

  // 레벨에 따른 게이지바 비율 (레벨이 낮을수록(좋을수록) 더 많이 채워짐)
  const gaugeWidth = useMemo(() => {
    // 레벨 1(가장 좋음): 100%, 레벨 2: 95%, 레벨 3: 70%, 레벨 4: 45%, 레벨 5: 20%, 레벨 6(가장 나쁨): 5%
    const widthMap: Record<number, string> = {
      1: '100%',
      2: '75%',
      3: '50%',
      4: '50%',
      5: '75%',
      6: '100%',
    };
    return widthMap[levelInfo.level] || '70%';
  }, [levelInfo.level]);

  // 레벨에 따른 그라데이션 색상
  const gradient = useMemo(() => {
    // 레벨이 낮을수록(좋을수록) 초록색, 높을수록(나쁠수록) 빨간색
    if (levelInfo.level <= 3) {
      return 'linear-gradient(90deg, var(--color-olive-green) 0.18%, var(--color-success) 99.7%)';
    } else {
      return 'linear-gradient(90deg, var(--color-coral-red) 0%, var(--color-error) 100%)';
    }
  }, [levelInfo.level]);

  // 레벨에 따른 상태 텍스트
  const runningStatus = useMemo(() => {
    const statusMap: Record<number, string> = {
      1: '최고 속도로 가는 중!', // 가장 좋음
      2: '빠르게 가는 중!',
      3: '씽씽 가는 중!',
      4: '천천히 가는 중',
      5: '느릿느릿 가는중..',
      6: '엉금엉금 가는중..', // 가장 나쁨
    };
    return statusMap[levelInfo.level] || '가는 중';
  }, [levelInfo.level]);

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
                width: gaugeWidth,
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
            src={levelVideo}
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
