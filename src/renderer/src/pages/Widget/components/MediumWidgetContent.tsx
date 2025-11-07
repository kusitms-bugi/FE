import MediumGiraffe from '../../../assets/widget/medium_giraffe.svg?react';
import MediumTurtle from '../../../assets/widget/medium_turtle.svg?react';

/* 실시간 자세 판별 */
type PostureState = 'turtle' | 'giraffe';

interface MediumWidgetContentProps {
  posture: PostureState;
}

/* 미디엄 위젯 레이아웃 */
export function MediumWidgetContent({ posture }: MediumWidgetContentProps) {
  const isGiraffe = posture === 'giraffe';
  const gradient = isGiraffe
    ? 'linear-gradient(180deg, var(--color-olive-green) 0.18%, var(--color-success) 99.7%)'
    : 'linear-gradient(180deg, var(--color-coral-red) 0%, var(--color-error) 100%)';

  /* 게이지 비율: 거북목 25%, 정상 75% */
  const gaugeWidth = isGiraffe ? '75%' : '25%';

  return (
    <div className="flex h-full w-full flex-col transition-colors duration-500 ease-in-out">
      {/* 캐릭터 영역 */}
      <div
        className="mini:h-auto mini: mb-[3px] flex aspect-[1/1] h-full w-full flex-1 rounded-lg transition-all duration-500 ease-in-out"
        style={{ background: gradient }}
      >
        {isGiraffe ? (
          <MediumGiraffe className="ml-[-10px] h-full object-contain" />
        ) : (
          <MediumTurtle className="h-full object-contain" />
        )}
      </div>

      {/* 상세 정보 영역 */}
      <div className="bg-grey-0 flex w-full flex-1 flex-col justify-center px-2">
        {/* 진행 바 */}
        <div className="h-fit w-full rounded-lg">
          <div className="bg-grey-50 h-3 w-full rounded-full">
            <div
              className="flex h-full justify-end rounded-lg bg-green-500 p-[2px] transition-all duration-500 ease-in-out"
              style={{ width: gaugeWidth, background: gradient }}
            >
              <div className="bg-dot h-2 w-2 rounded-full opacity-50" />
            </div>
          </div>
        </div>

        {/* 메시지 */}
        <div className="bg-grey-0 mt-2">
          <div className="text-body-md-semibold text-grey-700">
            {isGiraffe
              ? '좋아요, 기린 상태 유지중!'
              : '앗! 지금은 거북이 상태예요'}
          </div>
          <div className="text-caption-xs-meidum text-grey-400">
            {isGiraffe ? '집중력 최고 상태에요' : '42인치 TV를 얹고 있어요'}
          </div>
        </div>
      </div>
    </div>
  );
}
