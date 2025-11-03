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
