import { useEffect, useRef, useState } from 'react';
import { useSaveMetricsMutation } from '../../api/session/useSaveMetricsMutation';
import {
  PoseLandmark as AnalyzerPoseLandmark,
  calculatePI,
  checkFrontality,
  PostureClassifier,
  WorldLandmark,
} from '../../components/pose-detection';
import { useCameraStore } from '../../store/useCameraStore';
import { usePostureStore } from '../../store/usePostureStore';
import { MetricData } from '../../types/main/session';
import AveragePosturePanel from './components/AveragePosturePanel';
import AttendacePanel from './components/AttendacePanel';
import HighlightsPanel from './components/HighlightsPanel';
import MainHeader from './components/MainHeader';
import MiniRunningPanel from './components/MiniRunningPanel';
import PosePatternPanel from './components/PosePatternPanel';
import WebcamPanel from './components/WebcamPanel';
import TotalDistancePanel from './components/TotalDistancePanel';
import NotificationModal from '../../components/Modal/NotificationModal';
import { ModalPortal } from '@ui/Modal/ModalPortal';
import AverageGraphPannel from './components/AverageGraph/AverageGraphPannel';
import { useModal } from '../../hooks/useModal';

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

  /* 모달 오픈 */
  const { isOpen, open: handleOpenModal, close: handleCloseModal } = useModal();

  return (
    <>
      <main className="bg-grey-25 flex h-screen flex-col overflow-hidden p-4">
        <div className="grid min-h-0 w-full flex-1 grid-cols-[1fr_minmax(336px,400px)] items-stretch gap-2">
          {/* 좌측 영역 */}
          <div className="h-full min-h-0 w-full">
            <div className="flex h-full min-h-0 flex-col gap-[clamp(8px,calc(4.375vw-48px),36px)]">
              <MainHeader onClickNotification={handleOpenModal} />
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="text-caption-xs-regular text-grey-200 mr-4 flex shrink-0 items-end justify-end">
                  마지막 갱신일: 2025.10.22(수) 17:52
                </div>

                {/* 스크롤 영역 래퍼 */}
                <div className="min-h-0 flex-1 overflow-hidden">
                  <div className="custom-scrollbar flex h-full min-h-full w-full flex-col overflow-y-auto overscroll-y-contain pr-4">
                    {/* 상단 부분 */}
                    <div className="mb-4 grid h-[268px] shrink-0 grid-cols-[1fr_2fr] gap-4">
                      {/* 평균 자세 점수 부분 */}
                      <AveragePosturePanel />
                      <div className="bg-grey-0 rounded-3xl">
                        <AttendacePanel />
                      </div>
                    </div>

                    {/* 하단 부분 */}
                    <div className="flex min-h-max flex-1 items-stretch gap-4">
                      <div className="@container flex min-h-0 w-full min-w-[552px] flex-1 flex-col items-start gap-4 self-stretch">
                        {/*레벨 및 이동거리 section */}
                        <div className="bg-grey-0 relative h-[170px] w-full shrink-0 rounded-3xl py-5 pr-4 pl-2">
                          <TotalDistancePanel />
                        </div>

                        {/* 시계열 그래프 */}
                        <div className="grid min-h-0 w-full flex-1 grid-cols-1 gap-4 @[562px]:grid-cols-2">
                          <div className="bg-grey-0 h-full min-h-[224px] w-full min-w-[270px] rounded-3xl @[552px]:min-h-[210px]">
                            <AverageGraphPannel />
                          </div>

                          {/*하이라이트 */}
                          <div className="bg-grey-0 h-full min-h-[224px] w-full min-w-[270px] rounded-3xl @[552px]:min-h-[210px]">
                            <HighlightsPanel />
                          </div>
                        </div>
                      </div>
                      <div className="bg-grey-0 min-h-[300px] w-full max-w-[330px] min-w-[330px] flex-1 rounded-3xl">
                        <PosePatternPanel />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 우측영역 */}
          <div className="bg-grey-0 flex h-full w-full flex-col gap-[clamp(16px,calc(16px+(100vh-810px)*16/270),32px)] rounded-4xl p-6">
            <WebcamPanel
              onUserMediaError={handleUserMediaError}
              onPoseDetected={handlePoseDetected}
              onToggleWebcam={handleToggleWebcam}
              onSendMetrics={sendMetricsToServer}
            />

            <div className="bg-grey-50 h-px w-full" />

            <MiniRunningPanel />
          </div>
          {isOpen && (
            <ModalPortal>
              <NotificationModal onClose={handleCloseModal} />
            </ModalPortal>
          )}
        </div>
      </main>
    </>
  );
};

export default MainPage;
