import { useEffect, useRef, useState } from 'react';
import DevNavbar from '../../components/DevNavbar/DevNavbar';
import {
  PoseLandmark as AnalyzerPoseLandmark,
  calculatePI,
  checkFrontality,
  PostureClassifier,
  WorldLandmark,
} from '../../components/pose-detection/PoseAnalyzer';
import CharacterPanel from './components/CharacterPanel';
import HighlightsPanel from './components/HighlightsPanel';
import LevelProgressPanel from './components/LevelProgressPanel';
import MiniRunningPanel from './components/MiniRunningPanel';
import SummaryPanel from './components/SummaryPanel';
import TrendPanel from './components/TrendPanel';
import WebcamPanel from './components/WebcamPanel';

const LOCAL_STORAGE_KEY = 'calibration_result_v1';

const MainPage = () => {
  const [isWebcamOn, setIsWebcamOn] = useState(true);
  const [statusText, setStatusText] = useState<'정상' | '거북목' | '측정중'>(
    '측정중',
  );

  const classifierRef = useRef(new PostureClassifier());

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
    setIsWebcamOn(false);
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
    setStatusText(result.text as '정상' | '거북목');

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
      <DevNavbar />
      <main className="bg-grey-50 h-screen min-h-screen">
        {/* 전체 레이아웃: 좌(콘텐츠) / 우(웹캠 패널) - 화면 꽉 차게 */}
        <div className="grid h-full w-full grid-cols-1 items-stretch gap-6 p-4 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_400px]">
          {/* 좌측 콘텐츠 영역: 단일 Grid 구성 */}
          <section className="grid grid-cols-12 content-start gap-6 overflow-y-auto">
            <CharacterPanel />
            <SummaryPanel />
            <LevelProgressPanel />
            <HighlightsPanel />
            <TrendPanel />
          </section>

          {/* 우측 사이드 패널: 좌/우 구분선 */}
          <aside className="border-grey-100 flex flex-col gap-6 border-l pl-6">
            <WebcamPanel
              isWebcamOn={isWebcamOn}
              onUserMediaError={handleUserMediaError}
              onPoseDetected={handlePoseDetected}
            />

            <MiniRunningPanel statusText={statusText} />
          </aside>
        </div>
      </main>
    </>
  );
};

export default MainPage;
