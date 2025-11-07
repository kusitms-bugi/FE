import SleepIcon from "@assets/sleep.svg?react";
import { useEffect, useRef, useState, type RefObject } from 'react';
import Webcam from 'react-webcam';
import { Timer } from '../../../components/Timer/Timer';
import {
  PoseLandmark,
  WorldLandmark,
} from '../../../components/pose-detection/PoseAnalyzer';
import PoseDetection from '../../../components/pose-detection/PoseDetection';
import PoseVisualizer from '../../../components/pose-detection/PoseVisualizer';
import { useCameraStore } from '../../../store/useCameraStore';

interface WebcamViewProps {
  onPoseDetected?: (
    landmarks: PoseLandmark[],
    worldLandmarks?: WorldLandmark[],
  ) => void;
  showPoseOverlay?: boolean;
  showTimer?: boolean;
  remainingTime?: number;
  onVideoRefReady?: (videoRef: RefObject<Webcam>) => void;
}

const WebcamView = ({
  onPoseDetected,
  showPoseOverlay = false,
  showTimer = false,
  remainingTime = 0,
  onVideoRefReady,
}: WebcamViewProps) => {
  const webcamRef = useRef<Webcam>(null);

  // 비디오 ref를 부모 컴포넌트에 전달
  useEffect(() => {
    if (onVideoRefReady) {
      onVideoRefReady(webcamRef as RefObject<Webcam | null>);
    }
  }, [onVideoRefReady]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [detectedLandmarks, setDetectedLandmarks] = useState<PoseLandmark[]>(
    [],
  );
  const [videoDimensions, setVideoDimensions] = useState({
    width: 760,
    height: 428,
  });

  const { cameraState, setShow } = useCameraStore();
  const isWebcamOn = cameraState === 'show';

  const videoConstraints = {
    facingMode: 'user', width: 1000,
    height: 563,
  };

  const handlePoseDetected = (
    landmarks: PoseLandmark[],
    worldLandmarks?: WorldLandmark[],
  ) => {
    setDetectedLandmarks(landmarks);
    onPoseDetected?.(landmarks, worldLandmarks);
  };

  const handleUserMedia = (stream: MediaStream | null) => {

    if (stream) {
      setShow();
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
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

  useEffect(() => {
    if (cameraState === 'hide' || cameraState === 'exit') {
      if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.srcObject) {
        const stream = webcamRef.current.video.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    }
  }, [cameraState]);

  return (
    <div className="relative" ref={containerRef}>
      {cameraState === 'show' ? (
        <div className="relative">
          <Webcam
            ref={webcamRef}
            width={videoDimensions.width}
            height={videoDimensions.height}
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
            videoRef={
              webcamRef as RefObject<
                Webcam | { video?: HTMLVideoElement | null } | null
              >
            }
            onPoseDetected={handlePoseDetected}
            isEnabled={isWebcamOn}
          />
        </div>
      ) : cameraState === 'hide' ? (
        <div
          className="bg-grey-50 flex items-center justify-center rounded-2xl"
          style={{
            width: containerRef.current?.clientWidth || videoDimensions.width,
            height: containerRef.current?.clientHeight || videoDimensions.height,
          }}
        >
          <div className="text-center text-grey-300">
            측정을 멈췄어요! <br />
            준비되면 카메라 버튼을 눌러주세요.
          </div>
        </div>
      ) : (
        <div
          className="bg-grey-50 flex items-center justify-center rounded-2xl"
          style={{
            width: containerRef.current?.clientWidth || videoDimensions.width,
            height: containerRef.current?.clientHeight || videoDimensions.height,
          }}
        >
          <div className="text-center text-grey-300 flex flex-col items-center">
            <div className='flex flex-col items-center gap-6'>
              오늘 한걸음 나아갔네요 <br />
              내일을 위해 쉬어요
              <SleepIcon />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebcamView;
