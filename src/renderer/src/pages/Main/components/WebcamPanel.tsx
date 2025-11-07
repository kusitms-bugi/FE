import { Button } from '../../../components';
import ShowIcon from '@assets/show.svg?react';
import HideIcon from '@assets/hide.svg?react';
import {
  PoseLandmark,
  WorldLandmark,
} from '../../../components/pose-detection/PoseAnalyzer';
import WebcamView from '../../Calibration/components/WebcamView';
import { useCameraStore } from '../../../store/useCameraStore';
import { useCreateSessionMutation } from '../../../api/session/useCreateSessionMutation';
import { useStopSessionMutation } from '../../../api/session/useStopSessionMutation';

interface Props {
  onUserMediaError: (e: string | DOMException) => void;
  onPoseDetected: (
    landmarks: PoseLandmark[],
    worldLandmarks?: WorldLandmark[],
  ) => void;
  onToggleWebcam: () => void;
}

const WebcamPanel = ({ onPoseDetected, onToggleWebcam }: Props) => {
  const { cameraState, setShow, setExit } = useCameraStore();
  const isWebcamOn = cameraState === 'show';
  const isExit = cameraState === 'exit';

  const { mutate: createSession, isPending: isCreatingSession } =
    useCreateSessionMutation();
  const { mutate: stopSession, isPending: isStoppingSession } =
    useStopSessionMutation();

  const handleStartStop = () => {
    if (isExit) {
      // 시작하기: 세션 생성 후 카메라 시작
      createSession(undefined, {
        onSuccess: () => {
          setShow();
        },
      });
    } else {
      // 종료하기: 세션 중단 후 카메라 종료
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
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

  return (
    <div className="flex w-full flex-col gap-3">
      <WebcamView onPoseDetected={onPoseDetected} showPoseOverlay={true} />

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
          className="h-11 w-full max-w-[300px]"
          onClick={handleStartStop}
          disabled={isCreatingSession || isStoppingSession}
        />
        <Button
          size={'md'}
          variant={'grey'}
          text={
            isWebcamOn ? (
              <HideIcon className="h-6 w-6" />
            ) : (
              <ShowIcon className="h-6 w-6" />
            )
          }
          onClick={onToggleWebcam}
          className="h-11 w-11 px-0"
        />
      </div>
    </div>
  );
};

export default WebcamPanel;
