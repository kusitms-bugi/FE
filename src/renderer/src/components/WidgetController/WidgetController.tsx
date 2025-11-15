import { useState, useEffect } from 'react';

/* 위젯 창을 제어하는 컴포넌트 메인 창에서 위젯 창을 열고 닫을 수 있습니다 */
export function WidgetController() {
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  /* 위젯 창이 열려있는지 확인 */
  useEffect(() => {
    const checkWidgetStatus = async () => {
      if (window.electronAPI?.widget) {
        const isOpen = await window.electronAPI.widget.isOpen();
        setIsWidgetOpen(isOpen);
      }
    };

    checkWidgetStatus();
  }, []);

  /*위젯 창 열기*/
  const handleOpenWidget = async () => {
    try {
      if (window.electronAPI?.widget) {
        await window.electronAPI.widget.open();
        setIsWidgetOpen(true);
        console.log('위젯 창이 열렸습니다');
      }
    } catch (error) {
      console.error('위젯 창 열기 실패:', error);
    }
  };

  /* 위젯 창 닫기 */
  const handleCloseWidget = async () => {
    try {
      if (window.electronAPI?.widget) {
        await window.electronAPI.widget.close();
        setIsWidgetOpen(false);
        console.log('위젯 창이 닫혔습니다');
      }
    } catch (error) {
      console.error('위젯 창 닫기 실패:', error);
    }
  };

  /* Electron 환경이 아닌 경우 */
  if (!window.electronAPI?.widget) {
    return (
      <div className="rounded bg-gray-100 p-4">
        <p>Electron 환경에서만 사용 가능합니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-4">
        <button
          onClick={handleOpenWidget}
          disabled={isWidgetOpen}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          위젯 열기
        </button>
        <button
          onClick={handleCloseWidget}
          disabled={!isWidgetOpen}
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          위젯 닫기
        </button>
      </div>
      <div className="text-sm text-gray-600">
        상태: {isWidgetOpen ? '열림' : '닫힘'}
      </div>
    </div>
  );
}
