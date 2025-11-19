import FirstImageDescription from './FirstImageDescription';
import PrevIcon from '@assets/onboarding/prev_icon.svg?react';
import FirstImage from '@assets/onboarding/first_image.svg?react';
import SecondImage from '@assets/onboarding/second_image.svg?react';
import ThirdImage from '@assets/onboarding/third_image.svg?react';
import FourthImage from '@assets/onboarding/fourth_image.svg?react';
import RockIcon from '@assets/onboarding/rock_icon.svg?react';

/* 단계별 이미지 (1단계는 null, 2~5단계는 이미지) */
const STEP_IMAGES = [null, FirstImage, SecondImage, ThirdImage, FourthImage];

interface ImageDescriptionPannelProps {
  currentStep: number;
  onPrev: () => void;
  direction: 'next' | 'prev';
}

const ImageDescriptionPannel = ({
  currentStep,
  onPrev,
  direction,
}: ImageDescriptionPannelProps) => {
  const StepImage = STEP_IMAGES[currentStep - 1];

  return (
    <div className="h-full min-w-[894px] flex-1">
      <div className="relative flex h-full flex-col items-center justify-center px-20">
        {/* 2단계부터 이전 버튼 표시 */}
        {currentStep > 1 && (
          <div
            onClick={onPrev}
            className="absolute top-5 left-5 cursor-pointer p-2"
          >
            <PrevIcon className="[&_path:first-child]:fill-grey-25 [&_path:last-child]:stroke-grey-500 hover:[&_path:first-child]:fill-grey-0 [&_path:last-child]:fill-none" />
          </div>
        )}

        {/* 1단계: FirstImageDescription, 2~5단계: 이미지 */}
        <div
          key={currentStep}
          className={
            direction === 'next' ? 'animate-slide-next' : 'animate-slide-prev'
          }
        >
          {currentStep === 1 ? (
            <FirstImageDescription />
          ) : (
            StepImage && (
              <StepImage className="aspect-[784/510] w-full object-cover" />
            )
          )}
        </div>

        <p className="text-caption-xs-regular text-grey-300 absolute bottom-6 flex items-center gap-1">
          <RockIcon />
          <span>
            영상은 사용자의 PC에서만 처리되며, 어디에도 저장되거나 전송되지
            않으니 안심하세요.
          </span>
        </p>
      </div>
    </div>
  );
};

export default ImageDescriptionPannel;
