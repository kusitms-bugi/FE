/* 위젯 창에 표시될 페이지 - 반응형 */

import { useState, useEffect } from 'react';
import { WidgetTitleBar } from '../../components/WidgetTitleBar/WidgetTitleBar';
import { MiniWidgetContent } from './components/MiniWidgetContent';
import { MediumWidgetContent } from './components/MediumWidgetContent';
import { usePostureStore } from '../../store/usePostureStore';

type WidgetSize = 'mini' | 'medium';

/* 실시간 자세 판별 */
type PostureState = 'turtle' | 'giraffe';

/* 레이아웃 전환 기준점 (widgetConfig.ts와 동일) */
const BREAKPOINT = {
  height: 62,
} as const;

export function WidgetPage() {
  const [widgetSize, setWidgetSize] = useState<WidgetSize>('medium');

  /* usePostureStore에서 실시간 자세 상태 가져오기 */
  const statusText = usePostureStore((state) => state.statusText);
  const postureClass = usePostureStore((state) => state.postureClass);
  const setStatus = usePostureStore((state) => state.setStatus);

  /* statusText를 위젯 형식으로 변환: '거북목' → 'turtle', '정상' → 'giraffe' */
  const postureState: PostureState =
    statusText === '거북목' ? 'turtle' : 'giraffe';

  /* 자세 상태 변경 감지 및 로그 출력 */
  useEffect(() => {
    console.log('[위젯] 자세 상태 업데이트:', {
      statusText,
      postureClass,
      postureState,
      timestamp: new Date().toLocaleTimeString(),
    });
  }, [statusText, postureClass, postureState]);

  /* 메인 창에서 자세 상태 변경 시 위젯 창에 자동 반영 (localStorage 동기화) */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'posture-state-storage' && e.newValue) {
        try {
          // localStorage 변경 감지 → 위젯 store 업데이트
          const storageData = JSON.parse(e.newValue);
          const { statusText: newStatusText, postureClass: newPostureClass } =
            storageData.state;

          console.log('[위젯] 메인 창에서 자세 변경 감지:', {
            from: { statusText, postureClass },
            to: { statusText: newStatusText, postureClass: newPostureClass },
          });

          // 위젯의 store도 같은 값으로 동기화
          setStatus(newStatusText, newPostureClass);
        } catch (error) {
          console.error('[위젯] localStorage 파싱 오류:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [statusText, postureClass, setStatus]);

  /* 다크모드 설정 적용 */
  useEffect(() => {
    const applyTheme = () => {
      const isDark = localStorage.getItem('theme') === 'dark';
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    // 초기 테마 적용
    applyTheme();

    // 메인 창에서 테마 변경 시 자동 반영
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        applyTheme();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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
