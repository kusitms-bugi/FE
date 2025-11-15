import { EmaSmoother } from './calculations';
import { FrontalityResult, PIResult, PostureClassification } from './types';

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
    const gamma = 1.0;

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
