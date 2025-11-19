import { getScoreLevel } from '../../utils/getScoreLevel';
import { EmaSmoother } from './calculations';
import { PostureStabilizer } from './PostureStabilizer';
import { ScoreProcessor } from './ScoreProcessor';
import { FrontalityResult, PIResult, PostureClassification } from './types';

// 안정화 검사 및 점수 업데이트 주기
// 거북이/기린 경계 전환: 매우 빠르게 반영 (100ms)
// 일반 레벨 변경: 빠르게 반영 (150ms)
// 레벨 유지 시: 더 빠르게 반영 (200ms)
const SCORE_UPDATE_INTERVAL_MS_NORMAL = 200; // 일반 업데이트 주기
const SCORE_UPDATE_INTERVAL_MS_LEVEL_CHANGE = 150; // 레벨 변경 시 주기
const SCORE_UPDATE_INTERVAL_MS_BOUNDARY = 50; // 거북이/기린 경계 전환 시 주기

// 자세 판정 엔진
export class PostureClassifier {
  private prevState = {
    PI_EMA: null as number | null,
    state: 'normal' as 'normal' | 'bad',
  };

  private emaSmoother = new EmaSmoother(0.25);
  private scoreProcessor = new ScoreProcessor();
  // windowMs=300ms, threshold=0.6, minBufferSize=3으로 조정하여 더 빠른 반응
  private stabilizer = new PostureStabilizer(300, 0.6, 3);

  // 마지막으로 반환된 안정화된 상태
  private lastStableState: PostureClassification | null = null;
  // 마지막 스코어 업데이트 시간
  private lastScoreUpdateTime: number = 0;

  classify(
    piData: PIResult,
    mu: number,
    sigma: number,
    frontality: FrontalityResult,
  ): PostureClassification {
    const currentTime = Date.now();

    // 캘리브레이션 데이터가 유효하지 않으면 초기 상태 반환
    if (sigma === 0) {
      return (
        this.lastStableState ?? {
          text: '측정중',
          cls: 0,
          zScore: 0,
          PI_EMA: 0,
          z_PI: 0,
          gamma: 0,
          Score: 0,
          events: [],
        }
      );
    }

    const PI_raw = piData.PI_raw;
    const PI_EMA = this.emaSmoother.next(PI_raw);
    const z_PI = (PI_EMA - mu) / (sigma + 1e-6);
    const gamma = 1.0;
    const rawScore = gamma * z_PI;
    const finalScore = this.scoreProcessor.next(rawScore);

    // 현재 프레임의 분류 결과 생성
    const currentClassification = this.createClassification(finalScore, {
      PI_EMA,
      z_PI,
      gamma,
    });

    // 안정화 버퍼에 현재 점수 추가
    this.stabilizer.addScore(currentClassification.Score, currentTime);

    // 레벨 변경 여부 확인
    const levelChanged = this.lastStableState
      ? this.lastStableState.cls !== currentClassification.cls
      : false;

    // 거북이/기린 경계 전환 여부 확인 (레벨 3↔4 전환)
    const isBoundaryCrossing =
      levelChanged &&
      this.lastStableState &&
      ((this.lastStableState.cls === 3 && currentClassification.cls === 4) ||
        (this.lastStableState.cls === 4 && currentClassification.cls === 3));

    // 업데이트 주기 결정: 경계 전환 > 레벨 변경 > 일반 업데이트
    const requiredInterval = isBoundaryCrossing
      ? SCORE_UPDATE_INTERVAL_MS_BOUNDARY
      : levelChanged
        ? SCORE_UPDATE_INTERVAL_MS_LEVEL_CHANGE
        : SCORE_UPDATE_INTERVAL_MS_NORMAL;

    // 업데이트 주기가 되지 않았으면 이전 상태 반환
    const timeSinceLastUpdate = currentTime - this.lastScoreUpdateTime;
    if (timeSinceLastUpdate < requiredInterval && this.lastStableState) {
      return this.lastStableState;
    }

    // 안정화 검사
    // 거북이/기린 경계 전환 시에는 threshold를 완화하여 더 빠르게 반영
    const relaxedThreshold = isBoundaryCrossing ? 0.6 * 2 : undefined; // 경계 전환 시 2배 완화
    const shouldUpdate = this.stabilizer.shouldUpdate(
      currentClassification.Score,
      relaxedThreshold,
    );

    if (shouldUpdate) {
      // 안정화 통과: 새로운 상태를 안정된 상태로 업데이트
      this.lastStableState = currentClassification;
    }
    // 안정화 실패 시, lastStableState는 변경되지 않고 유지됨

    // 업데이트 시간 갱신
    this.lastScoreUpdateTime = currentTime;

    // 항상 마지막으로 안정화된 상태를 반환 (실패 시 이전 상태가 반환됨)
    return (
      this.lastStableState ?? {
        // 초기 상태 (null일 경우 대비)
        text: '측정중',
        cls: 0,
        zScore: 0,
        PI_EMA: 0,
        z_PI: 0,
        gamma: 0,
        Score: 0,
        events: [],
      }
    );
  }

  /**
   * 점수와 추가 데이터를 기반으로 PostureClassification 객체를 생성합니다.
   * 히스테리시스 로직을 포함합니다.
   */
  private createClassification(
    score: number,
    details: { PI_EMA: number; z_PI: number; gamma: number },
  ): PostureClassification {
    const enter_bad = 1.2;
    const exit_bad = 0.8;

    let newState = this.prevState.state;
    const events: string[] = [];

    if (this.prevState.state === 'normal' && score >= enter_bad) {
      newState = 'bad';
      events.push('enter_bad');
    } else if (this.prevState.state === 'bad' && score <= exit_bad) {
      newState = 'normal';
      events.push('exit_bad');
    }

    this.prevState = { PI_EMA: details.PI_EMA, state: newState };

    const levelInfo = getScoreLevel(score);

    return {
      text: levelInfo.name,
      cls: levelInfo.level,
      zScore: score,
      Score: score,
      events,
      ...details,
    };
  }

  reset() {
    this.prevState = { PI_EMA: null, state: 'normal' };
    this.emaSmoother.reset();
    this.scoreProcessor.reset();
    this.stabilizer.reset();
    this.lastStableState = null;
    this.lastScoreUpdateTime = 0;
  }
}
