import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PoseLandmark as AnalyzerPoseLandmark,
  calculatePI,
  PIResult,
  processCalibrationData,
  WorldLandmark,
} from '../../components/pose-detection/PoseAnalyzer';
import MeasuringPanel from './components/MeasuringPanel';
import WebcamView from './components/WebcamView';
import WelcomePanel from './components/WelcomePanel';

interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

// EMA 스무딩 클래스 (PostureClassifier와 동일한 로직)
class EmaSmoother {
  private alpha: number;
  private y: number | null = null;

  constructor(alpha: number = 0.25) {
    this.alpha = alpha;
  }

  next(x: number): number {
    this.y = this.y === null ? x : this.alpha * x + (1 - this.alpha) * this.y;
    return this.y;
  }

  reset() {
    this.y = null;
  }
}

const CalibrationPage = () => {
  const navigate = useNavigate();
  const LOCAL_STORAGE_KEY = 'calibration_result_v1';
  const [isWebcamOn, setIsWebcamOn] = useState(true); // 기본적으로 웹캠 켜짐
  const [detectedLandmarks, setDetectedLandmarks] = useState<PoseLandmark[]>(
    [],
  );
  const [isPoseDetected, setIsPoseDetected] = useState(false);
  // 최신 랜드마크 값을 읽기 위한 ref (useEffect 재시작 없이 읽기)
  const detectedLandmarksRef = useRef<PoseLandmark[]>([]);

  // 캘리브레이션 상태
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(5);
  const worldLandmarksRef = useRef<WorldLandmark[]>([]);
  const [calibrationFrames, setCalibrationFrames] = useState<
    Array<{
      lms: PoseLandmark[];
      pi: PIResult;
      worldLms: WorldLandmark[];
    }>
  >([]);

  const handlePoseDetected = (
    landmarks: PoseLandmark[],
    detectedWorldLandmarks?: WorldLandmark[],
  ) => {
    setDetectedLandmarks(landmarks);
    detectedLandmarksRef.current = landmarks;
    if (detectedWorldLandmarks !== undefined) {
      worldLandmarksRef.current = detectedWorldLandmarks;
    }
    setIsPoseDetected(landmarks.length > 0);
  };

  // 캘리브레이션 시작
  const startCalibration = useCallback(() => {
    setIsCalibrating(true);
    setCalibrationFrames([]);
    setCalibrationProgress(0);
    setRemainingTime(5);
  }, []);

  // 캘리브레이션 중단
  const stopCalibration = () => {
    setIsCalibrating(false);
  };

  // 캘리브레이션 취소
  const cancelCalibration = () => {
    setIsCalibrating(false);
    setCalibrationProgress(0);
    setCalibrationFrames([]);
  };

  // 측정하기 버튼 클릭
  const handleStartMeasurement = () => {
    if (detectedLandmarks.length > 0) {
      setTimeout(() => {
        startCalibration();
      }, 1000);
    }
  };

  // 캘리브레이션 처리
  useEffect(() => {
    if (!isCalibrating) return;

    const frames: Array<{
      lms: PoseLandmark[];
      pi: PIResult;
      worldLms: WorldLandmark[];
      pi_ema?: number; // EMA 적용된 PI 값
    }> = [];
    const startTime = Date.now();
    const emaSmoother = new EmaSmoother(0.25); // 메인과 동일한 alpha 값
    emaSmoother.reset(); // 캘리브레이션 시작 시 초기화

    // 타이머 업데이트 (1초마다)
    const timerInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / 5000) * 100);
      const remaining = Math.max(0, Math.ceil((5000 - elapsed) / 1000));
      setCalibrationProgress(progress);
      setRemainingTime(remaining);

      if (elapsed >= 5000) {
        clearInterval(timerInterval);
        clearInterval(dataInterval);
        stopCalibration();
        const result = processCalibrationData(frames, true);
        if (result.success) {
          setCalibrationFrames(frames);
          // 측정 완료 수치를 한 번만 콘솔에 출력
          console.log('측정 완료 수치', {
            mu_PI: (result.mu_PI || 0).toFixed(4),
            sigma_PI: (result.sigma_PI || 0).toFixed(4),
            passRate: ((result.passRate || 0) * 100).toFixed(1) + '%',
            quality: result.quality || 'unknown',
            nPass: result.nPass || 0,
            nTotal: result.nTotal || 0,
          });

          // 로컬 스토리지 저장
          try {
            const payload = {
              mu_PI: result.mu_PI || 0,
              sigma_PI: result.sigma_PI || 0,
              passRate: result.passRate || 0,
              quality: result.quality || 'unknown',
              nPass: result.nPass || 0,
              nTotal: result.nTotal || 0,
              timestamp: Date.now(),
            };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
          } catch {
            // 저장 실패 시 무시 (사일런트)
          }

          // 완료 페이지로 이동
          navigate('/onboarding/completion');
        } else {
          console.error('캘리브레이션 실패:', result.message);
        }
      }
    }, 1000); // 1초마다 타이머 업데이트

    // 데이터 수집 (100ms마다)
    const dataInterval = setInterval(() => {
      const current2D = detectedLandmarksRef.current;
      const currentWorld = worldLandmarksRef.current;

      if (current2D.length === 0 && currentWorld.length === 0) return;

      const landmarksToUse = currentWorld.length > 0 ? currentWorld : current2D;
      if (landmarksToUse.length === 0) return;

      const pi = calculatePI(
        current2D as AnalyzerPoseLandmark[],
        landmarksToUse,
      );
      if (!pi) return;

      // EMA 적용 (메인과 동일한 방식)
      const pi_ema = emaSmoother.next(pi.PI_raw);

      // const frontality = checkFrontality(current2D as AnalyzerPoseLandmark[]);

      frames.push({
        lms: current2D,
        pi,
        worldLms: currentWorld,
        pi_ema, // EMA 적용된 값 저장
      });
    }, 100); // 100ms마다 데이터 수집

    return () => {
      clearInterval(timerInterval);
      clearInterval(dataInterval);
    };
  }, [isCalibrating]);

  return (
    <main className="bg-grey-50 flex min-h-screen flex-col items-center">
      <section className="hbp:px-[105px] flex h-screen w-full items-center justify-center">
        {/* 메인 콘텐츠 영역 */}
        <div className="flex w-full justify-center gap-12">
          {/* 왼쪽 웹캠 영역 */}
          <WebcamView
            isWebcamOn={isWebcamOn}
            onPoseDetected={handlePoseDetected}
            showPoseOverlay={true}
            showTimer={isCalibrating}
            remainingTime={remainingTime}
          />
          {/* 오른쪽 안내 영역 - 상태별 컴포넌트 (완료 화면 제거) */}
          {isCalibrating ? (
            <MeasuringPanel />
          ) : (
            <WelcomePanel
              isPoseDetected={isPoseDetected}
              onStartMeasurement={handleStartMeasurement}
            />
          )}
        </div>
      </section>
    </main>
  );
};

export default CalibrationPage;
