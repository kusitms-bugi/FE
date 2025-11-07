import { Button } from '../../../components';
import ShowIcon from "@assets/show.svg?react"
import HideIcon from "@assets/hide.svg?react"
import {
  PoseLandmark,
  WorldLandmark,
} from '../../../components/pose-detection/PoseAnalyzer';
import WebcamView from '../../Calibration/components/WebcamView';
import { useCameraStore } from '../../../store/useCameraStore';

interface Props {
  onUserMediaError: (e: string | DOMException) => void;
  onPoseDetected: (
    landmarks: PoseLandmark[],
    worldLandmarks?: WorldLandmark[],
  ) => void;
  onToggleWebcam: () => void;
}

const WebcamPanel = ({
  onPoseDetected,
  onToggleWebcam,
}: Props) => {
  const { cameraState, setShow, setExit } = useCameraStore();
  const isWebcamOn = cameraState === 'show';
  const isExit = cameraState === 'exit';

  const handleStartStop = () => {
    if (isExit) {
      setShow();
    } else {
      setExit();
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">

      <WebcamView
        onPoseDetected={onPoseDetected}
        showPoseOverlay={true}
      />

      <div className='flex gap-2'>
        <Button
          size={"md"}
          variant={"primary"}
          text={isExit ? '시작하기' : '종료하기'}
          className='w-full max-w-[300px] h-11'
          onClick={handleStartStop}
        />
        <Button
          size={"md"}
          variant={"grey"}
          text={isWebcamOn ? <HideIcon className='w-6 h-6' /> : <ShowIcon className='w-6 h-6' />}
          onClick={onToggleWebcam}
          className='w-11 h-11 px-0'
        />
      </div>
    </div>
  );
};

export default WebcamPanel;
