import { useEffect } from 'react';
import { usePostureStore } from '../../../store/usePostureStore';

/* 메인 창의  실시간 자세 상태 위젯 창에 실시간 동기화
 localStorage의 storage 이벤트를 통해 창 간 통신 */

export function usePostureSyncWithLocalStorage() {
  const statusText = usePostureStore((state) => state.statusText);
  const postureClass = usePostureStore((state) => state.postureClass);
  const setStatus = usePostureStore((state) => state.setStatus);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      /* posture-state-storage만 처리 (다른 localStorage 변경은 무시) */
      if (e.key !== 'posture-state-storage' || !e.newValue) return;

      try {
        const storageData = JSON.parse(e.newValue);
        const { statusText: newStatusText, postureClass: newPostureClass } =
          storageData.state;

        console.log('[위젯] 메인 창에서 자세 변경 감지:', {
          from: { statusText, postureClass },
          to: { statusText: newStatusText, postureClass: newPostureClass },
        });

        setStatus(newStatusText, newPostureClass);
      } catch (error) {
        console.error('[위젯] localStorage 파싱 오류:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [statusText, postureClass, setStatus]);

  /* 디버깅용 로그 */
  useEffect(() => {
    console.log('[위젯] 자세 상태 업데이트:', {
      statusText,
      postureClass,
      timestamp: new Date().toLocaleTimeString(),
    });
  }, [statusText, postureClass]);
}
