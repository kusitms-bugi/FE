import { useRef, useState, type RefObject } from 'react';
import Webcam from 'react-webcam';
import { Timer } from '../../../components/Timer/Timer';
import {
  PoseLandmark,
  WorldLandmark,
} from '../../../components/pose-detection/PoseAnalyzer';
import PoseDetection from '../../../components/pose-detection/PoseDetection';
import PoseVisualizer from '../../../components/pose-detection/PoseVisualizer';

interface WebcamViewProps {
  isWebcamOn: boolean;
  onPoseDetected?: (
    landmarks: PoseLandmark[],
    worldLandmarks?: WorldLandmark[],
  ) => void;
  showPoseOverlay?: boolean;
  showTimer?: boolean;
  remainingTime?: number;
}

const WebcamView = ({
  isWebcamOn,
  onPoseDetected,
  showPoseOverlay = false,
  showTimer = false,
  remainingTime = 0,
}: WebcamViewProps) => {
  const webcamRef = useRef<Webcam>(null);
  const [detectedLandmarks, setDetectedLandmarks] = useState<PoseLandmark[]>(
    [],
  );
  const [videoDimensions, setVideoDimensions] = useState({
    width: 760,
    height: 428,
  });

  const videoConstraints = {
    width: 760,
    height: 428,
    facingMode: 'user',
  };

  const handlePoseDetected = (
    landmarks: PoseLandmark[],
    worldLandmarks?: WorldLandmark[],
  ) => {
    setDetectedLandmarks(landmarks);
    onPoseDetected?.(landmarks, worldLandmarks);
  };

  const handleUserMedia = (stream: MediaStream | null) => {
    console.log('[WebcamView] handleUserMedia called, stream:', stream);
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        console.log('[WebcamView] Video settings:', settings);
        setVideoDimensions({
          width: settings.width || 760,
          height: settings.height || 428,
        });
      }
    } else {
      console.warn('[WebcamView] handleUserMedia called with null stream');
    }
  };

  const handleUserMediaError = (error: string | DOMException) => {
    console.error('[WebcamView] handleUserMediaError:', error);
    if (error instanceof DOMException) {
      console.error('[WebcamView] Error name:', error.name);
      console.error('[WebcamView] Error message:', error.message);
    }
  };

  return (
    <div className="relative">
      {isWebcamOn ? (
        <div className="relative">
          <Webcam
            ref={webcamRef}
            width={760}
            height={428}
            autoPlay
            playsInline
            videoConstraints={videoConstraints}
            onUserMedia={handleUserMedia}
            onUserMediaError={handleUserMediaError}
            className="scale-x-[-1] rounded-[24px]"
          />
          {showPoseOverlay && detectedLandmarks.length > 0 && (
            <PoseVisualizer
              landmarks={detectedLandmarks}
              videoWidth={videoDimensions.width}
              videoHeight={videoDimensions.height}
              isVisible={true}
            />
          )}
          {showTimer && (
            <div className="absolute right-4 bottom-4">
              <Timer
                value={
                  Math.min(5, Math.max(0, remainingTime)) as
                    | 0
                    | 1
                    | 2
                    | 3
                    | 4
                    | 5
                }
                size={80}
              />
            </div>
          )}
          <PoseDetection
            videoRef={webcamRef as RefObject<Webcam | { video?: HTMLVideoElement | null } | null>}
            onPoseDetected={handlePoseDetected}
            isEnabled={isWebcamOn}
          />
        </div>
      ) : (
        <div className="bg-grey-900 flex h-full w-full items-center justify-center rounded-[24px]">
          <div className="text-center text-white">
            <div className="mb-4 text-6xl">📹</div>
            <div className="text-headline-lg-regular">웹캠이 꺼져있습니다</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebcamView;
