import { useEffect, useRef } from 'react';
import summaryImage from '../../assets/ut/attendance_encouragement.png';
import characterImage from '../../assets/ut/average_posture_score.png';
import highlightsImage from '../../assets/ut/correct_posture_score.png';
import trendImage from '../../assets/ut/highlight.png';
import levelProgressImage from '../../assets/ut/level_reached.png';
import posturePatternImage from '../../assets/ut/posture_pattern_analysis.png';
import {
  PoseLandmark as AnalyzerPoseLandmark,
  calculatePI,
  checkFrontality,
  PostureClassifier,
  WorldLandmark,
} from '../../components/pose-detection';
import { useCameraStore } from '../../store/useCameraStore';
import { usePostureStore } from '../../store/usePostureStore';

import { useSaveMetricsMutation } from '../../api/session/useSaveMetricsMutation';
import { MetricData } from '../../types/main/session';
import MainHeader from './components/MainHeader';
import MiniRunningPanel from './components/MiniRunningPanel';
import WebcamPanel from './components/WebcamPanel';

const LOCAL_STORAGE_KEY = 'calibration_result_v1';

const MainPage = () => {
  const setStatus = usePostureStore((state) => state.setStatus);
  const { cameraState, setHide, setShow } = useCameraStore();

  // 메트릭 저장 mutation
  const { mutate: saveMetrics } = useSaveMetricsMutation();

  // 메트릭 데이터를 저장할 ref (리렌더링 방지)
  const metricsRef = useRef<MetricData[]>([]);

  // 마지막 저장 시간을 추적 (1초마다 저장용)
  const lastSaveTimeRef = useRef<number>(0);

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

  // 메트릭은 종료 시에만 서버로 전송됨 (WebcamPanel에서 호출)

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

    // 메트릭 데이터 수집 (1초마다 한 번씩만 저장)
    const currentTime = Date.now();
    const timeSinceLastSave = currentTime - lastSaveTimeRef.current;

    if (timeSinceLastSave >= 1000) {
      // 1초(1000ms) 이상 지났으면 저장
      metricsRef.current.push({
        score: result.Score,
        timestamp: new Date().toISOString(),
      });
      lastSaveTimeRef.current = currentTime;
    }

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
        <div className="grid h-screen w-full grid-cols-[1fr_minmax(336px,400px)] items-stretch gap-6">
          {/* 좌측 콘텐츠 영역: 스크롤 가능한 세로 스택 */}
          <section className="flex min-h-0 flex-col gap-2">
            {/* 헤더 (스크롤 제외) */}
            <MainHeader />

            <div className="flex min-h-0 flex-1 flex-col items-end gap-2 self-stretch overflow-y-auto">
              <div className="text-caption-xs-regular text-grey-200 mt-[clamp(8px,1.5vh,36px)] flex items-end justify-end">
                마지막 갱신일: 2025.10.22(수) 17:52
              </div>
              {/* ── 상단: 1:2 그리드 ───────────────────────────── */}
              <div className="grid flex-1 grid-cols-3 grid-rows-2 gap-x-4 gap-y-4 self-stretch">
                <div className="col-span-1 col-start-1 row-span-2 row-start-1 flex flex-1 flex-col items-start gap-[107px] self-stretch">
                  <img
                    src={characterImage}
                    alt="character"
                    className="object-fit h-full w-full"
                  />
                </div>
                <div className="col-span-2 col-start-2 row-span-2 row-start-1 grid flex-1 gap-x-2 gap-y-2 self-stretch">
                  <img
                    src={summaryImage}
                    alt="summary"
                    className="object-fit h-full w-full"
                  />
                </div>
              </div>

              {/* ── 하단: 별도 그리드 (좌 2fr | 우 1fr) ─────────── */}
              <div className="col-span-1 col-start-1 row-span-3 row-start-3 flex min-h-[300px] flex-1 items-start justify-center gap-4 self-stretch">
                {/* 왼쪽 컬럼: 위에서 아래로 스택 */}
                <div className="@container flex min-w-[552px] flex-1 flex-col items-start gap-4 self-stretch">
                  <div className="flex h-[170px] flex-col items-start self-stretch">
                    <img
                      src={levelProgressImage}
                      alt="level progress"
                      className="object-fit h-full w-full"
                    />
                  </div>
                  {/* highlights와 trend를 2열로 배치 (부모 너비 562px 이상일 때) */}
                  <div className="grid w-full grid-cols-1 gap-4 @[562px]:grid-cols-2">
                    <div className="flex max-h-[304px] min-h-[234px] w-full flex-col items-end gap-4">
                      <img
                        src={highlightsImage}
                        alt="highlights"
                        className="object-fit h-full w-full"
                      />
                    </div>
                    <div className="flex max-h-[304px] min-h-[234px] w-full flex-col items-end gap-4">
                      <img
                        src={trendImage}
                        alt="trend"
                        className="object-fit h-full w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* 오른쪽 컬럼: 패턴 패널만 */}
                <div className="h-[360px] min-h-[300px] w-[330px] max-w-[330px]">
                  <img
                    src={posturePatternImage}
                    alt="posture pattern"
                    className="object-fit h-full w-full"
                  />
                </div>
              </div>
            </div>
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
