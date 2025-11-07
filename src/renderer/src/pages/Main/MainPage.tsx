import { useEffect, useRef } from 'react';
import {
  PoseLandmark as AnalyzerPoseLandmark,
  calculatePI,
  checkFrontality,
  PostureClassifier,
  WorldLandmark,
} from '../../components/pose-detection/PoseAnalyzer';
import { useCameraStore } from '../../store/useCameraStore';
import { usePostureStore } from '../../store/usePostureStore';
import { useSaveMetricsMutation } from '../../api/session/useSaveMetricsMutation';
import { MetricData } from '../../types/main/session';
import CharacterPanel from './components/CharacterPanel';
import HighlightsPanel from './components/HighlightsPanel';
import LevelProgressPanel from './components/LevelProgressPanel';
import MainHeader from './components/MainHeader';
import MiniRunningPanel from './components/MiniRunningPanel';
import SummaryPanel from './components/SummaryPanel';
import TrendPanel from './components/TrendPanel';
import WebcamPanel from './components/WebcamPanel';

const LOCAL_STORAGE_KEY = 'calibration_result_v1';

const MainPage = () => {
  const setStatus = usePostureStore((state) => state.setStatus);
  const { cameraState, setHide, setShow } = useCameraStore();

  // 메트릭 저장 mutation
  const { mutate: saveMetrics } = useSaveMetricsMutation();

  // 메트릭 데이터를 저장할 ref (리렌더링 방지)
  const metricsRef = useRef<MetricData[]>([]);

  const handleToggleWebcam = () => {
    if (cameraState === 'show') {
      setHide();
    } else {
      setShow();
    }
  };

  const classifierRef = useRef(new PostureClassifier());

  // 메트릭을 서버로 전송하는 함수
  const sendMetricsToServer = () => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId && metricsRef.current.length > 0) {
      saveMetrics({
        sessionId,
        metrics: metricsRef.current,
      });
      // 전송 후 메트릭 초기화
      metricsRef.current = [];
    }
  };

  // 캘리브레이션 로드
  const calib = (() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return { mu: parsed.mu_PI as number, sigma: parsed.sigma_PI as number };
    } catch {
      return null;
    }
  })();

  // 캘리브레이션이 로드될 때 EMA 초기화
  useEffect(() => {
    if (calib) {
      classifierRef.current.reset();
    }
  }, [calib]);

  const handleUserMediaError = () => {
    setHide();
  };

  const handlePoseDetected = async (
    landmarks: AnalyzerPoseLandmark[],
    worldLandmarks?: WorldLandmark[],
  ) => {
    if (!calib) return; // 캘리브레이션 없으면 판정 중지
    if (!landmarks || landmarks.length === 0) return;

    const world =
      worldLandmarks && worldLandmarks.length > 0
        ? worldLandmarks
        : (landmarks as unknown as WorldLandmark[]);
    const pi = calculatePI(landmarks, world);
    if (!pi) return;
    const frontal = checkFrontality(landmarks);

    const result = classifierRef.current.classify(
      pi,
      calib.mu,
      calib.sigma,
      frontal,
    );
    setStatus(result.text as '정상' | '거북목', result.cls);

    // 메트릭 데이터 수집 (서버 전송용)
    metricsRef.current.push({
      score: result.Score,
      timestamp: new Date().toISOString(),
    });

    // 기존 결과 배열 가져오기
    const existingData = localStorage.getItem('classificationResult');
    const existingResults = existingData ? JSON.parse(existingData) : [];

    // 배열이 아니면 새 배열로 시작
    const resultsArray = Array.isArray(existingResults) ? existingResults : [];

    // 새 결과 추가 (Score만)
    resultsArray.push(result.Score);

    // localStorage에 저장
    // localStorage.setItem('classificationResult', JSON.stringify(resultsArray));

    // Electron 환경에서 로그 파일로 저장
    if (typeof window !== 'undefined' && window.electronAPI?.writeLog) {
      try {
        const logData = JSON.stringify({
          score: result.Score,
          pi_ema: result.PI_EMA,
          z_pi: result.z_PI,
          status: result.text,
          timestamp: new Date().toISOString(),
        });
        await window.electronAPI.writeLog(logData);
      } catch (error) {
        console.error('Failed to write log file:', error);
      }
    }
  };

  return (
    <>
      <main className="bg-grey-25 min-h-screen p-4">
        {/* 전체 레이아웃: 좌(콘텐츠) / 우(웹캠 패널) - 화면 꽉 차게 */}
        <div className="grid h-full w-full grid-cols-1 items-stretch gap-6 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_400px]">
          {/* 좌측 콘텐츠 영역: 단일 Grid 구성 */}
          <section className="grid grid-cols-12 content-start gap-6 overflow-y-auto">
            {/* 헤더 */}
            <div className="col-span-12">
              <MainHeader />
            </div>

            <CharacterPanel />
            <SummaryPanel />
            <LevelProgressPanel />
            <HighlightsPanel />
            <TrendPanel />
          </section>

          {/* 우측 사이드 패널: 좌/우 구분선 */}
          <aside className="bg-grey-0 flex flex-col gap-8 rounded-4xl p-6">
            <WebcamPanel
              onUserMediaError={handleUserMediaError}
              onPoseDetected={handlePoseDetected}
              onToggleWebcam={handleToggleWebcam}
              onSendMetrics={sendMetricsToServer}
            />

            <div className="bg-grey-50 h-px w-full" />

            <MiniRunningPanel />
          </aside>
        </div>
      </main>
    </>
  );
};

export default MainPage;
