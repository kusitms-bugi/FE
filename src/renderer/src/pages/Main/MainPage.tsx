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
import MainHeader from './components/MainHeader';
import MiniRunningPanel from './components/MiniRunningPanel';
import WebcamPanel from './components/WebcamPanel';

const LOCAL_STORAGE_KEY = 'calibration_result_v1';

const MainPage = () => {
  const setStatus = usePostureStore((state) => state.setStatus);
  const { cameraState, setHide, setShow } = useCameraStore();

  const handleToggleWebcam = () => {
    if (cameraState === 'show') {
      setHide();
    } else {
      setShow();
    }
  };

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
        <div className="grid h-screen w-full items-stretch gap-6 grid-cols-[1fr_minmax(336px,400px)]">
          {/* 좌측 콘텐츠 영역: 스크롤 가능한 세로 스택 */}
          <section className="flex min-h-0 flex-col gap-2">
            {/* 헤더 (스크롤 제외) */}
            <MainHeader />


            <div className="flex flex-col items-end gap-2 flex-1 self-stretch overflow-y-auto min-h-0">
              <div className="text-caption-xs-regular text-grey-200 flex items-end justify-end
                mt-[clamp(8px,1.5vh,36px)]">
                마지막 갱신일: 2025.10.22(수) 17:52
              </div>
              {/* ── 상단: 1:2 그리드 ───────────────────────────── */}
              <div className="grid gap-x-4 gap-y-4 flex-1 self-stretch grid-rows-2 grid-cols-3">
                <div className="flex flex-col items-start gap-[107px] flex-1 self-stretch row-span-2 row-start-1 col-span-1 col-start-1">
                  <img src={characterImage} alt="character" className="w-full h-full object-fit" />
                </div>
                <div className="grid gap-y-2 gap-x-2 flex-1 self-stretch row-span-2 row-start-1 col-span-2 col-start-2">
                  <img src={summaryImage} alt="summary" className="w-full h-full object-fit" />
                </div>
              </div>


              {/* ── 하단: 별도 그리드 (좌 2fr | 우 1fr) ─────────── */}
              <div className="flex justify-center items-start gap-4 flex-1 self-stretch row-span-3 row-start-3 col-span-1 col-start-1 min-h-[300px]">
                {/* 왼쪽 컬럼: 위에서 아래로 스택 */}
                <div className="@container flex min-w-[552px] flex-col items-start gap-4 flex-1 self-stretch">
                  <div className="flex h-[170px] flex-col items-start self-stretch">
                    <img src={levelProgressImage} alt="level progress" className="w-full h-full object-fit" />
                  </div>
                  {/* highlights와 trend를 2열로 배치 (부모 너비 562px 이상일 때) */}
                  <div className="grid grid-cols-1 @[562px]:grid-cols-2 gap-4 w-full">
                    <div className="flex min-h-[234px] max-h-[304px] w-full flex-col items-end gap-4">
                      <img src={highlightsImage} alt="highlights" className="w-full h-full object-fit" />
                    </div>
                    <div className="flex min-h-[234px] max-h-[304px] w-full flex-col items-end gap-4">
                      <img src={trendImage} alt="trend" className="w-full h-full object-fit" />
                    </div>
                  </div>
                </div>

                {/* 오른쪽 컬럼: 패턴 패널만 */}
                <div className='min-h-[300px] h-[360px] max-w-[330px] w-[330px]'>
                  <img src={posturePatternImage} alt="posture pattern" className="w-full h-full object-fit" />
                </div>
              </div>
            </div>

          </section>

          {/* 우측 사이드 패널: 좌/우 구분선 */}
          <aside className="bg-grey-0 flex flex-col p-6 rounded-4xl gap-8">
            <WebcamPanel
              onUserMediaError={handleUserMediaError}
              onPoseDetected={handlePoseDetected}
              onToggleWebcam={handleToggleWebcam}
            />

            <div className='h-px w-full bg-grey-50' />

            <MiniRunningPanel />
          </aside>
        </div>
      </main>
    </>
  );
};

export default MainPage;
