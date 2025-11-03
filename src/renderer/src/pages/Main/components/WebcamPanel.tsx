import {
  PoseLandmark,
  WorldLandmark,
} from '../../../components/pose-detection/PoseAnalyzer';
import WebcamView from '../../Calibration/components/WebcamView';

interface Props {
  isWebcamOn: boolean;
  onUserMediaError: (e: string | DOMException) => void;
  onPoseDetected: (
    landmarks: PoseLandmark[],
    worldLandmarks?: WorldLandmark[],
  ) => void;
}

const WebcamPanel = ({
  isWebcamOn,
  onUserMediaError,
  onPoseDetected,
}: Props) => {
  return (
    <div className="border-grey-100 rounded-2xl border bg-white p-4">
      <div className="relative">
        <WebcamView
          isWebcamOn={isWebcamOn}
          onPoseDetected={onPoseDetected}
          showPoseOverlay={true}
        />
      </div>
    </div>
  );
};

export default WebcamPanel;
