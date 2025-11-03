import { useEffect, useRef } from 'react';

interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface PoseVisualizerProps {
  landmarks: PoseLandmark[];
  videoWidth: number;
  videoHeight: number;
  isVisible?: boolean;
}

// EMA 스무딩 클래스
class LandmarkSmoother {
  private smoothedLandmarks: PoseLandmark[] = [];
  private alpha: number = 0.3; // 스무딩 강도 (0.1 = 강한 스무딩, 0.9 = 약한 스무딩)

  smooth(landmarks: PoseLandmark[]): PoseLandmark[] {
    if (this.smoothedLandmarks.length === 0) {
      // 첫 번째 프레임은 그대로 사용
      this.smoothedLandmarks = landmarks.map((landmark) => ({ ...landmark }));
      return this.smoothedLandmarks;
    }

    // EMA 스무딩 적용
    this.smoothedLandmarks = landmarks.map((landmark, index) => {
      const prev = this.smoothedLandmarks[index];
      if (!prev) return { ...landmark };

      return {
        x: this.alpha * landmark.x + (1 - this.alpha) * prev.x,
        y: this.alpha * landmark.y + (1 - this.alpha) * prev.y,
        z: this.alpha * landmark.z + (1 - this.alpha) * prev.z,
        visibility: landmark.visibility,
      };
    });

    return this.smoothedLandmarks;
  }

  reset() {
    this.smoothedLandmarks = [];
  }
}

const PoseVisualizer = ({
  landmarks,
  videoWidth,
  videoHeight,
  isVisible = true,
}: PoseVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smootherRef = useRef<LandmarkSmoother>(new LandmarkSmoother());

  // 랜드마크가 완전히 바뀔 때 스무더 리셋
  useEffect(() => {
    smootherRef.current.reset();
  }, [landmarks.length]);

  useEffect(() => {
    if (!isVisible || landmarks.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 부모 컨테이너의 실제 크기 가져오기
    const parent = canvas.parentElement;
    const displayWidth = parent?.clientWidth || videoWidth;
    const displayHeight = parent?.clientHeight || videoHeight;

    // 캔버스 실제 해상도 설정 (고해상도 유지)
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = displayWidth * devicePixelRatio;
    canvas.height = displayHeight * devicePixelRatio;

    // CSS 크기는 부모에 맞게 설정
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    // 고해상도 대응 스케일
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // 캔버스 초기화
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // 스무딩 적용
    const smoothedLandmarks = smootherRef.current.smooth(landmarks);

    // 랜드마크 그리기 (거울모드 반전)
    smoothedLandmarks.forEach((landmark, index) => {
      if (landmark.visibility && landmark.visibility > 0.2) {
        // 임계값 낮춤
        // displayWidth/Height로 변환 (실제 표시 크기에 맞춤)
        const x = displayWidth - landmark.x * displayWidth; // X축 반전 (거울모드)
        const y = landmark.y * displayHeight;

        // 랜드마크 점 크기 (얼굴은 작게, 어깨는 크게)
        const pointSize = index < 11 ? 4 : 6;

        // 랜드마크 점 그리기
        ctx.beginPath();
        ctx.arc(x, y, pointSize, 0, 2 * Math.PI);

        // 색상 구분 (얼굴: 연한 회색, 어깨: 파란색)
        if (index >= 0 && index <= 10) {
          // 얼굴 (0-10)
          ctx.fillStyle = '#e5e7eb'; // 연한 회색
        } else if (index === 11 || index === 12) {
          // 어깨 (11, 12)
          ctx.fillStyle = '#60a5fa'; // 파란색
        } else {
          ctx.fillStyle = '#e5e7eb'; // 기본값
        }

        ctx.fill();
        ctx.strokeStyle = 'rgba(229,231,235,0.9)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 랜드마크 번호 표시 (작은 폰트로)
        ctx.fillStyle = 'rgba(229,231,235,0.9)';
        ctx.font = '11px ui-sans-serif, system-ui';
        ctx.textAlign = 'left';
        ctx.fillText(index.toString(), x + 5, y - 5);
      }
    });

    // 연결선 그리기 (HTML 스타일)
    ctx.lineWidth = 4;

    // 어깨 라인 (흰색 반투명)
    const leftShoulder = smoothedLandmarks[11];
    const rightShoulder = smoothedLandmarks[12];
    if (
      leftShoulder &&
      rightShoulder &&
      (leftShoulder.visibility ?? 0) > 0.2 &&
      (rightShoulder.visibility ?? 0) > 0.2
    ) {
      const leftShoulderX = displayWidth - leftShoulder.x * displayWidth;
      const leftShoulderY = leftShoulder.y * displayHeight;
      const rightShoulderX = displayWidth - rightShoulder.x * displayWidth;
      const rightShoulderY = rightShoulder.y * displayHeight;

      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.moveTo(leftShoulderX, leftShoulderY);
      ctx.lineTo(rightShoulderX, rightShoulderY);
      ctx.stroke();
    }

    // 귀 중점 - 어깨 중점 라인 (상태에 따른 색상)
    const leftEar = smoothedLandmarks[7];
    const rightEar = smoothedLandmarks[8];
    const leftShoulder2 = smoothedLandmarks[11];
    const rightShoulder2 = smoothedLandmarks[12];

    if (
      leftEar &&
      rightEar &&
      leftShoulder2 &&
      rightShoulder2 &&
      (leftEar.visibility ?? 0) > 0.2 &&
      (rightEar.visibility ?? 0) > 0.2 &&
      (leftShoulder2.visibility ?? 0) > 0.2 &&
      (rightShoulder2.visibility ?? 0) > 0.2
    ) {
      // 귀 중점 계산 (displayWidth/Height 사용)
      const leftEarX = displayWidth - leftEar.x * displayWidth;
      const leftEarY = leftEar.y * displayHeight;
      const rightEarX = displayWidth - rightEar.x * displayWidth;
      const rightEarY = rightEar.y * displayHeight;
      const earMidX = (leftEarX + rightEarX) / 2;
      const earMidY = (leftEarY + rightEarY) / 2;

      // 어깨 중점 계산 (displayWidth/Height 사용)
      const leftShoulderX = displayWidth - leftShoulder2.x * displayWidth;
      const leftShoulderY = leftShoulder2.y * displayHeight;
      const rightShoulderX = displayWidth - rightShoulder2.x * displayWidth;
      const rightShoulderY = rightShoulder2.y * displayHeight;
      const shoulderMidX = (leftShoulderX + rightShoulderX) / 2;
      const shoulderMidY = (leftShoulderY + rightShoulderY) / 2;

      // 귀-어깨 중점 연결선 (초록색)
      ctx.strokeStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(shoulderMidX, shoulderMidY);
      ctx.lineTo(earMidX, earMidY);
      ctx.stroke();

      // 어깨 중점 강조 (파란색)
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(shoulderMidX, shoulderMidY, 6, 0, Math.PI * 2);
      ctx.fill();

      // 귀 중점 강조 (분홍색)
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(earMidX, earMidY, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [landmarks, videoWidth, videoHeight, isVisible]);

  if (!isVisible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute top-0 left-0 h-full w-full"
    />
  );
};

export default PoseVisualizer;
