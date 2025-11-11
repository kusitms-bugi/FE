import MiniGiraffe from '../../../assets/widget/mini_giraffe.svg?react';
import MiniTurtle from '../../../assets/widget/mini_turtle.svg?react';

/* 실시간 자세 판별 */
type PostureState = 'turtle' | 'giraffe';

interface MiniWidgetContentProps {
  posture: PostureState;
}

/* 미니 위젯 레이아웃 - 최대 50px 높이에 맞게 가로 배치 */
export function MiniWidgetContent({ posture }: MiniWidgetContentProps) {
  const isGiraffe = posture === 'giraffe';
  const gradient = isGiraffe
    ? 'linear-gradient(180deg, var(--color-olive-green) 0.18%, var(--color-success) 99.7%)'
    : 'linear-gradient(180deg, var(--color-coral-red) 0%, var(--color-error) 100%)';

  /* 게이지 비율: 거북목 25%, 정상 75% */
  const gaugeWidth = isGiraffe ? '75%' : '25%';

  return (
    <div className="bg-grey-100 relative flex w-full items-center rounded-lg transition-colors duration-500 ease-in-out">
      {/* 캐릭터 이미지 영역 - 작게 */}
      <div
        className="h-full w-full rounded-lg transition-all duration-500 ease-in-out"
        style={{ width: gaugeWidth, background: gradient }}
      ></div>
      <div className="absolute flex h-full">
        {isGiraffe ? (
          <MiniGiraffe className="h-full w-full object-contain" />
        ) : (
          <MiniTurtle className="h-full w-full object-contain" />
        )}
      </div>
    </div>
  );
}
