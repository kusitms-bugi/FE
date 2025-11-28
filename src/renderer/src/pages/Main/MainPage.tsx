import {
  PoseLandmark as AnalyzerPoseLandmark,
  calculatePI,
  checkFrontality,
  PostureClassifier,
  usePostureStore,
  WorldLandmark,
} from '@entities/posture';
import { useModal } from '@shared/hooks/use-modal';
import { ModalPortal } from '@shared/ui/modal';
import { useEffect, useRef } from 'react';
import { useSaveMetricsMutation } from '../../api/session/useSaveMetricsMutation';
import NotificationModal from '../../components/Modal/NotificationModal';
import { useAutoMetricsSender } from '../../hooks/useAutoMetricsSender';
import { useNotificationScheduler } from '../../hooks/useNotificationScheduler';
import { useSessionCleanup } from '../../hooks/useSessionCleanup';
import { useCameraStore } from '../../store/useCameraStore';
import { MetricData } from '../../types/main/session';
import AttendacePanel from './components/AttendacePanel';
import AverageGraphPannel from './components/AverageGraph/AverageGraphPannel';
import AveragePosturePanel from './components/AveragePosture/AveragePosturePanel';
import HighlightsPanel from './components/HighlightsPanel';
import MainHeader from './components/MainHeader';
import MiniRunningPanel from './components/MiniRunningPanel';
import PosePatternPanel from './components/PosePatternPanel';
import TotalDistancePanel from './components/TotalDistancePanel';
import WebcamPanel from './components/WebcamPanel';

const LOCAL_STORAGE_KEY = 'calibration_result_v1';

const MainPage = () => {
  const setStatus = usePostureStore((state) => state.setStatus);
  const { cameraState, setHide, setShow, setExit } = useCameraStore();

  // 메트릭 저장 mutation
  const { mutate: saveMetrics } = useSaveMetricsMutation();

  // 메트릭 데이터를 저장할 ref (리렌더링 방지)
  const metricsRef = useRef<MetricData[]>([]);

  // 마지막 저장 시간을 추적 (1초마다 저장용)
  const lastSaveTimeRef = useRef<number>(0);

  const classifierRef = useRef(new PostureClassifier());

  // 메트릭을 서버로 전송하는 함수 (Promise 반환)
  const sendMetricsToServer = (): Promise<void> => {
    return new Promise((resolve) => {
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId && metricsRef.current.length > 0) {
        saveMetrics(
          {
            sessionId,
            metrics: metricsRef.current,
          },
          {
            onSuccess: () => {
              // 전송 완료 후 메트릭 초기화
              metricsRef.current = [];
              resolve();
            },
            onError: () => {
              // 에러가 발생해도 resolve (계속 진행)
              metricsRef.current = [];
              resolve();
            },
          },
        );
      } else {
        // 전송할 데이터가 없으면 즉시 완료
        resolve();
      }
    });
  };

  /* 창 닫기 시 세션 정리 (메트릭 전송, 세션 종료, 카메라 종료, 위젯 닫기) */
  useSessionCleanup(metricsRef, setExit);

  /* 5분마다 자동으로 메트릭 전송 */
  useAutoMetricsSender(metricsRef, sendMetricsToServer);

  const handleToggleWebcam = () => {
    if (cameraState === 'show') {
      setHide();
    } else {
      setShow();
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

  // 캘리브레이션이 로드될 때 초기화
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

    // PostureClassifier가 내부적으로 안정화 로직을 처리함
    const result = classifierRef.current.classify(
      pi,
      calib.mu,
      calib.sigma,
      frontal,
    );

    // 안정화된 결과로 상태 업데이트
    setStatus(result.cls, result.Score);

    // 메트릭 데이터 수집 (1초마다 한 번씩만 저장)
    const currentTime = Date.now();
    const timeSinceLastSave = currentTime - lastSaveTimeRef.current;

    if (timeSinceLastSave >= 1000) {
      // 1초(1000ms) 이상 지났으면 저장
      // KST(UTC+9) 시간으로 변환
      const kstTime = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString();
      metricsRef.current.push({
        score: result.cls, // 자세 상태별 레벨 (1~6) 저장
        timestamp: kstTime,
      });
      lastSaveTimeRef.current = currentTime;
    }

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

  /* 알림 스케줄러 활성화 */
  useNotificationScheduler();

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
