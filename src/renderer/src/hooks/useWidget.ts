import { useEffect, useState } from 'react';

/**
 * 위젯 창 상태를 관리하는 훅
 * 위젯 창의 열림/닫힘 상태를 추적하고 토글 기능을 제공합니다.
 *
 * @example
 * ```tsx
 * const { isWidgetOpen, toggleWidget } = useWidget();
 *
 * <button onClick={toggleWidget}>위젯 토글</button>
 * ```
 */
export const useWidget = () => {
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  // 위젯 창 상태 주기적 확인 (1초마다)
  useEffect(() => {
    const checkWidgetStatus = async () => {
      if (window.electronAPI?.widget) {
        const isOpen = await window.electronAPI.widget.isOpen();
        setIsWidgetOpen(isOpen);
      }
    };

    checkWidgetStatus();
    const interval = setInterval(checkWidgetStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // 위젯 로그 저장 헬퍼 함수
  const logWidgetEvent = async (event: 'widget_opened' | 'widget_closed') => {
    if (window.electronAPI?.writeLog) {
      try {
        const logData = JSON.stringify({
          event,
          timestamp: new Date().toISOString(),
        });
        await window.electronAPI.writeLog(logData);
      } catch (error) {
        console.error(`위젯 ${event === 'widget_opened' ? '열림' : '닫힘'} 로그 저장 실패:`, error);
      }
    }
  };

  // 위젯 토글 함수
  const toggleWidget = async () => {
    try {
      if (window.electronAPI?.widget) {
        if (isWidgetOpen) {
          await window.electronAPI.widget.close();
          setIsWidgetOpen(false);
          console.log('위젯 창이 닫혔습니다');
          await logWidgetEvent('widget_closed');
        } else {
          await window.electronAPI.widget.open();
          setIsWidgetOpen(true);
          console.log('위젯 창이 열렸습니다');
          await logWidgetEvent('widget_opened');
        }
      }
    } catch (error) {
      console.error('위젯 창 토글 실패:', error);
    }
  };

  return {
    isWidgetOpen,
    toggleWidget,
  };
};

