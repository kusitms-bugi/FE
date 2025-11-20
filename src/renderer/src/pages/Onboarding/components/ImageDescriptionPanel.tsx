import FirstImageDescription from './FirstImageDescription';
import PrevIcon from '@assets/onboarding/prev_icon.svg?react';
import firstImage from '@assets/onboarding/first_image.png';
import secondImage from '@assets/onboarding/second_image.png';
import thirdImage from '@assets/onboarding/third_image.png';
import fourthImage from '@assets/onboarding/fourth_image.png';
import firstDarkImage from '@assets/onboarding/first_dark_image.png';
import secondDarkImage from '@assets/onboarding/second_dark_image.png';
import thirdDarkImage from '@assets/onboarding/third_dark_image.png';
import fourthDarkImage from '@assets/onboarding/fourth_dark_image.png';
import RockIcon from '@assets/onboarding/rock_icon.svg?react';
import { useState, useEffect } from 'react';

/* 단계별 이미지 (1단계는 null, 2~5단계는 이미지) */
const STEP_IMAGES_LIGHT = [
  null,
  firstImage,
  secondImage,
  thirdImage,
  fourthImage,
];
const STEP_IMAGES_DARK = [
  null,
  firstDarkImage,
  secondDarkImage,
  thirdDarkImage,
  fourthDarkImage,
];

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
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const stepImages = isDark ? STEP_IMAGES_DARK : STEP_IMAGES_LIGHT;
  const stepImage = stepImages[currentStep - 1];

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
          className={`flex aspect-[784/510] w-full max-w-[1010px] items-center p-5 ${direction === 'next' ? 'animate-slide-next' : 'animate-slide-prev'}`}
        >
          {currentStep === 1 ? (
            <FirstImageDescription />
          ) : (
            stepImage && (
              <img
                src={stepImage}
                alt={`step ${currentStep}`}
                className="h-full object-contain"
              />
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
