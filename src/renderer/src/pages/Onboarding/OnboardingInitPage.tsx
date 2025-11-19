import { useState } from 'react';
import ImageDescriptionPannel from './components/ImageDescriptionPanel';
import InfoPanel from './components/InfoPanel';

const OnboardinInitPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const handlePrev = () => {
    if (currentStep > 1) {
      setDirection('prev');
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setDirection('next');
      setCurrentStep(currentStep + 1);
    } else {
      // 5단계에서 시작하기 클릭 시 처리
      console.log('시작하기 클릭');
    }
  };

  return (
    <main className="hbp:pt-[75px] hbp:h-[calc(100vh-75px)] flex h-[calc(100vh-60px)] flex-col items-center">
      <div className="hbp:mx-auto hbp:max-w-screen-lg hbp:px-10 relative h-full w-full overflow-visible">
        <section className="hbp:gap-15 hbp:px-20 flex h-full w-full items-center">
          <ImageDescriptionPannel
            currentStep={currentStep}
            onPrev={handlePrev}
            direction={direction}
          />
          <InfoPanel
            currentStep={currentStep}
            onNext={handleNext}
            direction={direction}
          />
        </section>
      </div>
    </main>
  );
};

export default OnboardinInitPage;
