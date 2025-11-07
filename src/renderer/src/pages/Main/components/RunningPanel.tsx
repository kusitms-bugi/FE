import backgroundImage from "@assets/background.svg";
import bugiVideo from "@assets/video/bugi.gif";
import RiniVideo from "@assets/video/rini.gif";
import WidgetIcon from "@assets/widget.svg?react";
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
                } else {
                    await window.electronAPI.widget.open();
                    setIsWidgetOpen(true);
                    console.log('위젯 창이 열렸습니다');
                }
            }
        } catch (error) {
            console.error('위젯 창 토글 실패:', error);
        }
    };

    return (
        <div className="">
            <div className="flex items-center justify-between mb-4">
                <p className="text-caption-sm-medium text-grey-400">{runningStatus}</p>
                <Button
                    size="xs"
                    variant="sub"
                    onClick={handleToggleWidget}
                    text={
                        <div className="flex items-center gap-2 text-yellow-500">
                            <WidgetIcon className="w-[18px] h-[18px]" />
                            위젯
                        </div>
                    }
                />
            </div>

            <div
                className="h-[421px] w-full rounded-xl bg-cover bg-center bg-no-repeat overflow-hidden"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            >
                {/* 게이지바 */}
                <div className="mt-4 mx-4">
                    {/* 흰색 트랙 */}
                    <div className="h-5 w-full bg-grey-50 rounded-full relative">
                        {/* 산호색 진행 바 (약 25-30%) */}
                        <div
                            className="h-full rounded-full transition-all duration-1000 flex items-center justify-end pr-[3px] py-[3px]"
                            style={{
                                width: isTurtle ? '25%' : '75%',
                                background: gradient
                            }}
                        >
                            <div className="bg-dot h-[14px] w-[14px] rounded-full opacity-50" />
                        </div>
                    </div>
                </div>

                {/* 움직이는 동영상 영역 */}
                <div className={cn("px-4 flex items-center justify-center", isTurtle ? 'mt-26' : 'mt-12')}>
                    <img
                        src={isTurtle ? bugiVideo : RiniVideo}
                        alt="Running animation"
                        className="w-full h-auto max-h-[320px] rounded-lg object-contain bg-transparent"
                    />
                </div>
            </div>
        </div>
    );
};

export default RunningPanel;

