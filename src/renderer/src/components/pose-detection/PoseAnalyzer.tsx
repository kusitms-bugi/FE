export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface WorldLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

// PI 지표 계산 결과
export interface PIResult {
  PI_raw: number;
  S: { x: number; y: number; z: number };
  E: { x: number; y: number; z: number };
  W: number;
}

// 정면성 검사 결과
export interface FrontalityResult {
  pass: boolean;
  roll: number;
  centerRatio: number;
}

// EMA 스무딩 클래스
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

// PI 지표 계산 함수
export function calculatePI(
  landmarks: PoseLandmark[],
  worldLandmarks: WorldLandmark[],
): PIResult | null {
  if (!worldLandmarks) return null;

  const LEFT_EAR = 7;
  const RIGHT_EAR = 8;
  const LEFT_SHOULDER = 11;
  const RIGHT_SHOULDER = 12;

  const LE = worldLandmarks[LEFT_EAR];
  const RE = worldLandmarks[RIGHT_EAR];
  const LS = worldLandmarks[LEFT_SHOULDER];
  const RS = worldLandmarks[RIGHT_SHOULDER];

  if (!LE || !RE || !LS || !RS) return null;

  // S = (LEFT_SHOULDER + RIGHT_SHOULDER) / 2
  const S = {
    x: (LS.x + RS.x) / 2,
    y: (LS.y + RS.y) / 2,
    z: (LS.z + RS.z) / 2,
  };

  // E = (LEFT_EAR + RIGHT_EAR) / 2
  const E = {
    x: (LE.x + RE.x) / 2,
    y: (LE.y + RE.y) / 2,
    z: (LE.z + RE.z) / 2,
  };

  // W = || RIGHT_SHOULDER - LEFT_SHOULDER || (world 공간 길이)
  const W = Math.sqrt(
    Math.pow(RS.x - LS.x, 2) +
    Math.pow(RS.y - LS.y, 2) +
    Math.pow(RS.z - LS.z, 2),
  );

  if (W === 0) return null;

  // PI_raw = (z_S - z_E) / W
  const PI_raw = (S.z - E.z) / W;

  return { PI_raw, S, E, W };
}

// 정면성 검사 함수
export function checkFrontality(landmarks: PoseLandmark[]): FrontalityResult {
  const LEFT_EAR = 7;
  const RIGHT_EAR = 8;
  const LEFT_SHOULDER = 11;
  const RIGHT_SHOULDER = 12;
  const NOSE = 0;

  const LE = landmarks[LEFT_EAR];
  const RE = landmarks[RIGHT_EAR];
  const LS = landmarks[LEFT_SHOULDER];
  const RS = landmarks[RIGHT_SHOULDER];
  const nose = landmarks[NOSE];

  if (!LE || !RE || !LS || !RS || !nose) {
    return { pass: false, roll: 0, centerRatio: 1 };
  }

  // roll = atan2(|(R_e - L_e).y|, (R_e - L_e).x) [deg]
  const earDiff = { x: RE.x - LE.x, y: RE.y - LE.y };
  const roll = Math.abs(
    (Math.atan2(Math.abs(earDiff.y), earDiff.x) * 180) / Math.PI,
  );

  // center_ratio = |NOSE.x - S.x| / ||R_s - L_s||_2D
  const S_2D = { x: (LS.x + RS.x) / 2, y: (LS.y + RS.y) / 2 };
  const shoulderDiff = { x: RS.x - LS.x, y: RS.y - LS.y };
  const shoulderWidth2D = Math.sqrt(
    shoulderDiff.x * shoulderDiff.x + shoulderDiff.y * shoulderDiff.y,
  );
  const centerRatio =
    shoulderWidth2D > 0 ? Math.abs(nose.x - S_2D.x) / shoulderWidth2D : 1;

  // 정면성 패스: |roll| ≤ 10°, center_ratio ≤ 0.15
  const pass = roll <= 10 && centerRatio <= 0.15;

  return { pass, roll, centerRatio };
}

// 자세 판정 결과
export interface PostureClassification {
  text: string;
  cls: 'ok' | 'warn' | 'bad';
  zScore: number;
  PI_EMA: number;
  z_PI: number;
  gamma: number;
  Score: number;
  events: string[];
}

// 자세 판정 엔진
export class PostureClassifier {
  private prevState = {
    PI_EMA: null as number | null,
    state: 'normal' as 'normal' | 'bad',
  };
  private emaSmoother = new EmaSmoother(0.25);

  classify(
    piData: PIResult,
    mu: number,
    sigma: number,
    frontality: FrontalityResult,
  ): PostureClassification {
    if (sigma === 0) {
      return {
        text: '측정중',
        cls: 'warn',
        zScore: 0,
        PI_EMA: 0,
        z_PI: 0,
        gamma: 0,
        Score: 0,
        events: [],
      };
    }

    const PI_raw = piData.PI_raw;

    // PI_EMA_t = alpha * PI_raw + (1-alpha) * PI_EMA_(t-1)
    const PI_EMA = this.emaSmoother.next(PI_raw);

    // z_PI = (PI_EMA_t - mu_PI) / (sigma_PI + 1e-6)
    const z_PI = (PI_EMA - mu) / (sigma + 1e-6);

    // 정면성 가중치 gamma ∈ [0,1]
    const gamma = frontality.pass ? 1.0 : 0.4;

    // Score = gamma * z_PI
    const Score = gamma * z_PI;

    // 히스테리시스 임계값
    const enter_bad = 1.2; // Score ≥ 1.2 → 거북목 진입
    const exit_bad = 0.8; // Score ≤ 0.8 → 거북목 해제

    // 상태 결정 (히스테리시스 반영)
    let newState = this.prevState.state;
    const events: string[] = [];

    if (this.prevState.state === 'normal' && Score >= enter_bad) {
      newState = 'bad';
      events.push('enter_bad');
    } else if (this.prevState.state === 'bad' && Score <= exit_bad) {
      newState = 'normal';
      events.push('exit_bad');
    }

    // 상태 업데이트
    this.prevState = { PI_EMA, state: newState };

    // UI용 텍스트 변환
    const text = newState === 'bad' ? '거북목' : '정상';
    const cls = newState === 'bad' ? 'bad' : 'ok';

    return {
      text,
      cls,
      zScore: Score,
      PI_EMA,
      z_PI,
      gamma,
      Score,
      events,
    };
  }

  reset() {
    this.prevState = { PI_EMA: null, state: 'normal' };
    this.emaSmoother.reset();
  }
}

// 캘리브레이션 상태
export interface CalibrationState {
  isCalibrating: boolean;
  isCalibrated: boolean;
  startTime: number;
  frames: Array<{
    lms: PoseLandmark[];
    pi: PIResult;
    worldLms: WorldLandmark[];
    pi_ema?: number; // EMA 적용된 PI 값 (선택적)
    brightness?: number; // 프레임의 평균 밝기 (0.0 ~ 1.0)
  }>;
  mu_PI: number;
  sigma_PI: number;
  quality: 'poor' | 'medium' | 'good' | 'unknown';
}

// 상하 5% 절사 평균 및 표준편차 계산
export function trimmedStats(values: number[], trimPercent: number = 0.05) {
  if (values.length === 0) return { mean: 0, std: 0 };

  const sorted = [...values].sort((a, b) => a - b);
  const trimCount = Math.floor(sorted.length * trimPercent);
  const trimmed = sorted.slice(trimCount, sorted.length - trimCount);

  if (trimmed.length === 0) return { mean: 0, std: 0 };

  const mean = trimmed.reduce((sum, v) => sum + v, 0) / trimmed.length;
  const variance =
    trimmed.reduce((sum, v) => sum + (v - mean) ** 2, 0) / trimmed.length;
  const std = Math.sqrt(variance);

  return { mean, std };
}

// 캘리브레이션 데이터 처리
export function processCalibrationData(
  frames: CalibrationState['frames'],
  skipFrontalCheck: boolean = false,
) {
  const nTotal = frames.length;
  let nPass = 0;
  const piValues: number[] = [];

  for (const frame of frames) {
    const frontality = checkFrontality(frame.lms);
    const shouldInclude = skipFrontalCheck || frontality.pass;

    if (shouldInclude && frame.pi !== null) {
      // PI_EMA가 있으면 사용, 없으면 PI_raw 사용 (하위 호환성)
      const piValue =
        frame.pi_ema !== undefined ? frame.pi_ema : frame.pi.PI_raw;
      piValues.push(piValue);
      nPass++;
    }
  }

  if (piValues.length < 5) {
    const passRate = ((nPass / nTotal) * 100).toFixed(1);
    return {
      success: false,
      message: `정면성 통과 프레임이 너무 적습니다.\n통과: ${nPass}/${nTotal} (${passRate}%)\n\n💡 팁:\n- 정면을 바라보세요\n- 고개를 살짝 움직여보세요`,
    };
  }

  const stats = trimmedStats(piValues, 0.05);
  const passRate = nPass / nTotal;

  let quality: 'poor' | 'medium' | 'good' = 'poor';
  if (passRate >= 0.5 && stats.std < 0.2) {
    quality = 'good';
  } else if (passRate >= 0.3 && stats.std < 0.3) {
    quality = 'medium';
  }

  return {
    success: true,
    nTotal,
    nPass,
    mu_PI: stats.mean,
    sigma_PI: stats.std,
    quality,
    passRate,
  };
}

// 캘리브레이션 프레임 타입
export type CalibrationFrame = CalibrationState['frames'][number];

// 스텝 1: 측정 시작 전 체크 - "귀와 어깨가 일직선이 되도록 턱을 살짝 당겨주세요"
export function checkStep1Error(
  landmarks: PoseLandmark[],
  worldLandmarks: WorldLandmark[],
): string | null {
  const pi = calculatePI(landmarks, worldLandmarks);
  if (!pi) return null;

  // PI 값이 너무 낮으면 (턱이 앞으로 나와있음)
  // 임계값: -0.3 (경험적 값, 필요시 조정)
  if (pi.PI_raw < -0.3) {
    return '귀와 어깨가 일직선이 되도록 턱을 살짝 당겨주세요';
  }

  return null;
}

// 스텝 2: 측정 중 예외 케이스 체크 함수들

// 1. 얼굴과 어깨 visibility 체크
export function checkLandmarkVisibility(
  frames: CalibrationFrame[],
): string | null {
  if (frames.length < 5) return null;

  const recentFrames = frames.slice(-10);
  const requiredLandmarks = [7, 8, 11, 12]; // LEFT_EAR, RIGHT_EAR, LEFT_SHOULDER, RIGHT_SHOULDER
  const minVisibility = 0.5;

  let lowVisibilityCount = 0;
  for (const frame of recentFrames) {
    const hasLowVisibility = requiredLandmarks.some((idx) => {
      const lm = frame.lms[idx];
      return !lm || (lm.visibility || 0) < minVisibility;
    });
    if (hasLowVisibility) lowVisibilityCount++;
  }

  // 10개 중 5개 이상이 낮으면 경고
  if (lowVisibilityCount >= 5) {
    return '얼굴과 어깨가 모두 보일 수 있게 뒤로 가주세요';
  }
  return null;
}

// 2. 거리 및 위치 체크
export function checkDistanceAndPosition(
  frames: CalibrationFrame[],
): string | null {
  if (frames.length < 5) return null;

  const recentFrames = frames.slice(-10);

  // 평균 어깨 너비 계산
  const avgW =
    recentFrames.reduce((sum, f) => {
      const LS = f.worldLms[11];
      const RS = f.worldLms[12];
      if (!LS || !RS) return sum;

      const W = Math.sqrt(
        Math.pow(RS.x - LS.x, 2) +
        Math.pow(RS.y - LS.y, 2) +
        Math.pow(RS.z - LS.z, 2),
      );
      return sum + W;
    }, 0) / recentFrames.length;

  // 평균 어깨 중심 위치 계산
  const avgShoulderCenter = recentFrames.reduce(
    (sum, f) => {
      const LS = f.lms[11];
      const RS = f.lms[12];
      if (!LS || !RS) return sum;

      const centerX = (LS.x + RS.x) / 2;
      const centerY = (LS.y + RS.y) / 2;
      return {
        x: sum.x + centerX,
        y: sum.y + centerY,
      };
    },
    { x: 0, y: 0 },
  );

  avgShoulderCenter.x /= recentFrames.length;
  avgShoulderCenter.y /= recentFrames.length;

  const distanceFromCenter = Math.sqrt(
    Math.pow(avgShoulderCenter.x - 0.5, 2) +
    Math.pow(avgShoulderCenter.y - 0.5, 2),
  );

  // 너무 멀리 있거나 화면 중앙에서 벗어난 경우
  if (avgW < 0.1 || distanceFromCenter > 0.3) {
    return '조금 더 가까이, 화면 중앙으로 와주세요';
  }
  return null;
}

// 비디오 프레임의 평균 밝기 계산 (0.0 ~ 1.0)
export function calculateFrameBrightness(
  videoElement: HTMLVideoElement,
): number | null {
  if (!videoElement || videoElement.readyState < 2) return null;

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    canvas.width = videoElement.videoWidth || 640;
    canvas.height = videoElement.videoHeight || 480;

    // 비디오 프레임을 캔버스에 그리기
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // 이미지 데이터 가져오기
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // RGB 값을 밝기(Luminance)로 변환
    // Luminance = 0.299*R + 0.587*G + 0.114*B
    let totalBrightness = 0;
    const pixelCount = data.length / 4; // RGBA이므로 4개씩

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Luminance 계산 (0~255 범위)
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      // 0.0 ~ 1.0 범위로 정규화
      totalBrightness += luminance / 255;
    }

    return totalBrightness / pixelCount;
  } catch (error) {
    console.error('Failed to calculate frame brightness:', error);
    return null;
  }
}

// 3. 밝기 체크 (실제 프레임 밝기 사용)
export function checkBrightness(frames: CalibrationFrame[]): string | null {
  if (frames.length < 5) return null;

  const recentFrames = frames.slice(-15);

  // brightness 값이 있는 프레임만 필터링
  const framesWithBrightness = recentFrames.filter(
    (frame) => frame.brightness !== undefined && frame.brightness !== null,
  );

  if (framesWithBrightness.length < 5) return null;

  // 평균 밝기 계산
  const avgBrightness =
    framesWithBrightness.reduce((sum, frame) => {
      return sum + (frame.brightness || 0);
    }, 0) / framesWithBrightness.length;

  // 밝기가 0.3 미만이면 어둡다고 판단 (0.0 ~ 1.0 범위)
  if (avgBrightness < 0.3) {
    return '주변을 조금 더 밝게 해주세요';
  }

  return null;
}

// 4. 자세 안정성 체크
export function checkPostureStability(
  frames: CalibrationFrame[],
): string | null {
  // 최소 프레임 수 (5개 이상)
  if (frames.length < 3) return null;

  // 최근 5개 프레임만 확인
  const recentFrames = frames.slice(-3);
  const recentPIs = recentFrames.map((f) => {
    // EMA 대신 PI_raw 사용 (변동을 더 정확히 감지하기 위해)
    return f.pi.PI_raw;
  });

  // 표준편차 체크
  const mean = recentPIs.reduce((a, b) => a + b, 0) / recentPIs.length;
  const variance =
    recentPIs.reduce((sum, pi) => {
      return sum + Math.pow(pi - mean, 2);
    }, 0) / recentPIs.length;
  const std = Math.sqrt(variance);

  // 연속된 프레임 간의 급격한 변화 체크 (포즈가 갑자기 감지될 때)
  for (let i = 1; i < recentPIs.length; i++) {
    const diff = Math.abs(recentPIs[i] - recentPIs[i - 1]);
    // 연속된 프레임 간 차이가 0.2 이상이면 급격한 변화
    if (diff > 0.2) {
      return '정확한 측정을 위해, 5초 동안 자세를 그대로 유지해주세요';
    }
  }

  // 표준편차 임계값을 더 낮춤 (0.08 -> 0.06) - 더 엄격한 기준
  if (std > 0.02) {
    return '정확한 측정을 위해, 5초 동안 자세를 그대로 유지해주세요';
  }

  return null;
}

// 스텝 2 에러 메시지 결정 (우선순위 순)
export function getStep2Error(frames: CalibrationFrame[]): string | null {
  // Step 2 에러들 (우선순위 순)
  return (
    checkLandmarkVisibility(frames) ||
    checkDistanceAndPosition(frames) ||
    checkBrightness(frames) ||
    checkPostureStability(frames)
  );
}
