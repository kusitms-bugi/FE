/* 위젯 창에 표시될 페이지 - 반응형 */

import { useState, useEffect } from 'react';
import { WidgetTitleBar } from '../../components/WidgetTitleBar/WidgetTitleBar';
import { MiniWidgetContent } from './components/MiniWidgetContent';
import { MediumWidgetContent } from './components/MediumWidgetContent';
import { usePostureStore } from '../../store/usePostureStore';
import { usePostureSyncWithLocalStorage } from './hooks/usePostureSyncWithLocalStorage';
import { useThemeSync } from './hooks/useThemeSync';

type WidgetSize = 'mini' | 'medium';
type PostureState = 'turtle' | 'giraffe';

/* 레이아웃 전환 기준점 */
const BREAKPOINT = {
  height: 62,
} as const;

export function WidgetPage() {
  const [widgetSize, setWidgetSize] = useState<WidgetSize>('medium');

  /* usePostureStore에서 실시간 자세 상태 가져오기 */
  const statusText = usePostureStore((state) => state.statusText);
  const postureState: PostureState =
    statusText === '거북목' ? 'turtle' : 'giraffe';

  /* 실시간 자세 상태 동기화 */
  usePostureSyncWithLocalStorage();

  /* 위젯 라이트/다크 모드 */
  useThemeSync();

  /* 위젯 페이지 로드 시 로그 */
  useEffect(() => {
    console.log('위젯 페이지가 로드되었습니다');

    if (window.electronAPI?.writeLog) {
      const logData = JSON.stringify({
        event: 'widget_page_loaded',
        timestamp: new Date().toISOString(),
      });
      window.electronAPI.writeLog(logData).catch((error) => {
        console.error('위젯 페이지 로드 로그 저장 실패:', error);
      });
    }
  }, []);

  /* 위젯 resize 이벤트 */
  useEffect(() => {
    /* resize 디바운스 타이머 ID 저장용 변수 */
    let resizeTimeout: number;

    /* 창 크기 변경 감지 핸들러 */
    const handleResize = () => {
      const isMedium = innerHeight > BREAKPOINT.height;
      /* breakpoint를 넘으면 medium, 아니면 mini */
      setWidgetSize(isMedium ? 'medium' : 'mini');
    };

    /* 디바운스 래퍼 함수 */
    const handleResizeDebounced = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        handleResize();
      }, 10);
    };

    handleResize();
    window.addEventListener('resize', handleResizeDebounced);

    return () => {
      window.removeEventListener('resize', handleResizeDebounced);
      clearTimeout(resizeTimeout);
    };
  }, []);

  const isMini = widgetSize === 'mini';

  return (
    <div className="bg-grey-0 h-screen w-screen overflow-hidden rounded-lg px-1 py-[5px]">
      <div className={isMini ? 'flex h-full w-full' : 'h-full w-full'}>
        {/* 커스텀 타이틀바 */}
        <WidgetTitleBar isMini={isMini} />

        {/* 위젯 내용 - 창 크기에 따라 자동 전환 */}
        {isMini ? (
          <MiniWidgetContent posture={postureState} />
        ) : (
          <MediumWidgetContent posture={postureState} />
        )}
      </div>
    </div>
  );
}
