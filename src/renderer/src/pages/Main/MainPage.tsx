import { useEffect, useRef } from 'react';
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
      <main className="bg-grey-25 h-screen overflow-hidden flex flex-col p-4">
        <div className="grid flex-1 min-h-0 w-full items-stretch gap-2 grid-cols-[1fr_minmax(336px,400px)]">

          {/* 좌측 영역 */}
          <div className='w-full h-full min-h-0'>
            <div className="flex flex-col h-full min-h-0 gap-[clamp(8px,calc(17.5vw-216px),36px)]">
              <MainHeader />
              <div className="flex flex-col flex-1 min-h-0">

                <div className='text-caption-xs-regular text-grey-200 flex items-end justify-end shrink-0 mr-4'>
                  마지막 갱신일: 2025.10.22(수) 17:52</div>

                {/* 스크롤 영역 래퍼 */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  <div className="w-full h-full min-h-full overflow-y-auto overscroll-y-contain pr-4 flex flex-col custom-scrollbar">
                    {/* 상단 부분 */}
                    <div className='grid grid-cols-[1fr_2fr] h-[268px] mb-4 gap-4 shrink-0'>
                      <div className='bg-amber-700'></div>
                      <div className='bg-grey-0 rounded-3xl'></div>
                    </div>

                    {/* 하단 부분 */}
                    <div className='flex items-stretch gap-4 flex-1 min-h-max'>
                      <div className='@container flex flex-col items-start gap-4 flex-1 self-stretch min-w-[552px] w-full min-h-0'>
                        <div className='h-[170px] w-full bg-grey-0 rounded-3xl shrink-0'>레벨 거부기</div>
                        <div className='grid grid-cols-1 @[562px]:grid-cols-2 gap-4 w-full flex-1 min-h-0'>
                          <div className='bg-grey-0 rounded-3xl min-h-[224px] min-w-[270px] w-full h-full'>시계열 그래프</div>
                          <div className='bg-grey-0 rounded-3xl min-h-[224px] min-w-[270px] w-full h-full'>하이라이트</div>
                        </div>
                      </div>
                      <div className='w-full min-h-[300px] min-w-[330px] max-w-[330px] bg-grey-0 rounded-3xl flex-1'>asd</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 우측영역 */}
          <div className='bg-grey-0 rounded-4xl w-full h-full p-6 flex flex-col gap-[clamp(16px,calc(16px+(100vh-810px)*16/270),32px)]'>
            <WebcamPanel
              onUserMediaError={handleUserMediaError}
              onPoseDetected={handlePoseDetected}
              onToggleWebcam={handleToggleWebcam}
            />

            <div className='h-px w-full bg-grey-50' />

            <MiniRunningPanel />
          </div>
        </div>
      </main>
    </>
  );
};

export default MainPage;
