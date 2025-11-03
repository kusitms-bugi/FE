import CompletionCharacter from '../../assets/completion.svg?react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';

const OnboardingCompletionPage = () => {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#FDFBF5]">
      <div className="relative flex w-full flex-col items-center justify-center px-7">
        {/* 캐릭터 영역 */}
        <CompletionCharacter />
        {/* 색종이 효과 */}

        {/* 텍스트 영역 */}
        <div className="mb-12 flex flex-col items-center gap-4">
          <h1 className="text-title-4xl-bold text-grey-700">자세 등록 완료</h1>
          <p className="text-headline-2xl-regular text-grey-500 text-center">
            이제부터 거부기린과 함께 거북목을 고쳐볼까요?
          </p>
        </div>

        {/* 버튼 */}
        <div className="pb-30">
          <Button
            variant="primary"
            size="xl"
            className="w-[440px]"
            text="시작하기"
            onClick={() => navigate('/main')}
          />
        </div>
      </div>
    </main>
  );
};

export default OnboardingCompletionPage;
