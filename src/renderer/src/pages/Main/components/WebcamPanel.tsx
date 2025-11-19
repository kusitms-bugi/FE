import HideIcon from '@assets/hide.svg?react';
import ShowIcon from '@assets/show.svg?react';
import WidgetIcon from '@assets/widget.svg?react';
import { useCreateSessionMutation } from '../../../api/session/useCreateSessionMutation';
import { usePauseSessionMutation } from '../../../api/session/usePauseSessionMutation';
import { useResumeSessionMutation } from '../../../api/session/useResumeSessionMutation';
import { useStopSessionMutation } from '../../../api/session/useStopSessionMutation';
import { Button } from '../../../components';
import {
  PoseLandmark,
  WorldLandmark,
} from '../../../components/pose-detection';
import { useWidget } from '../../../hooks/useWidget';
import { useCameraStore } from '../../../store/useCameraStore';
import WebcamView from '../../Calibration/components/WebcamView';

interface Props {
  onUserMediaError: (e: string | DOMException) => void;
  onPoseDetected: (
    landmarks: PoseLandmark[],
    worldLandmarks?: WorldLandmark[],
  ) => void;
  onToggleWebcam: () => void;
  onSendMetrics: () => void;
}

const WebcamPanel = ({
  onPoseDetected,
  onToggleWebcam,
  onSendMetrics,
}: Props) => {
  const { cameraState, setShow, setHide, setExit } = useCameraStore();
  const { toggleWidget } = useWidget();
  const isWebcamOn = cameraState === 'show';
  const isExit = cameraState === 'exit';

  const { mutate: createSession, isPending: isCreatingSession } =
    useCreateSessionMutation();
  const { mutate: stopSession, isPending: isStoppingSession } =
    useStopSessionMutation();
  const { mutate: pauseSession, isPending: isPausingSession } =
    usePauseSessionMutation();
  const { mutate: resumeSession, isPending: isResumingSession } =
    useResumeSessionMutation();
  const handleStartStop = () => {
    if (isExit) {
      // 시작하기: 세션 생성 후 카메라 시작
      createSession(undefined, {
        onSuccess: () => {
          setShow();
        },
      });
    } else {
      // 종료하기: 메트릭 전송 → 세션 중단 → 카메라 종료
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        // 1. 수집된 메트릭을 서버로 전송
        onSendMetrics();

        // 2. 세션 종료
        stopSession(sessionId, {
          onSuccess: () => {
            setExit();
          },
        });
      } else {
        // sessionId가 없으면 그냥 카메라만 종료
        setExit();
      }
    }
  };

  // 카메라 보이기/숨기기 버튼: 일시정지/재개
  const handleToggleCamera = () => {
    const sessionId = localStorage.getItem('sessionId');

    if (isWebcamOn) {
      // 카메라 보이는 상태 → 숨기기: 세션 일시정지
      if (sessionId) {
        pauseSession(sessionId, {
          onSuccess: () => {
            setHide();
            onToggleWebcam();
          },
        });
      } else {
        setHide();
        onToggleWebcam();
      }
    } else {
      // 카메라 숨김 상태 → 보이기: 세션 재개
      if (sessionId) {
        resumeSession(sessionId, {
          onSuccess: () => {
            setShow();
            onToggleWebcam();
          },
        });
      } else {
        setShow();
        onToggleWebcam();
      }
    }
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <div className='aspect-video max-w-[352px] max-h-[198px] relative'>
        <WebcamView onPoseDetected={onPoseDetected} showPoseOverlay={true} />
        <Button
          size={'md'}
          variant={'grey'}
          text={
            isWebcamOn ? (
              <HideIcon className="h-[18px] w-[18px]" />
            ) : (
              <ShowIcon className="h-[18px] w-[18px]" />
            )
          }
          onClick={handleToggleCamera}
          disabled={isPausingSession || isResumingSession}
          className="h-[30px] w-[30px] px-0 absolute top-2 right-2"
        />
      </div>
      <div className="flex gap-2">
        <Button
          size={'md'}
          variant={'primary'}
          text={
            isCreatingSession
              ? '세션 생성 중...'
              : isStoppingSession
                ? '세션 종료 중...'
                : isExit
                  ? '시작하기'
                  : '종료하기'
          }
          className="h-11 w-full max-w-[196px] labtop:max-w-[260px]"
          onClick={handleStartStop}
          disabled={isCreatingSession || isStoppingSession}
        />
        <Button
          size="md"
          variant="sub"
          onClick={toggleWidget}
          className='w-[84px] h-11 py-[10px] px-[12px]'
          text={
            <div className="flex items-center gap-1 text-yellow-500 text-body-md-medium">
              <WidgetIcon className="h-6 w-6" />
              위젯
            </div>
          }
        />
      </div>
    </div>
  );
};

export default WebcamPanel;
