import { useNavigate } from 'react-router-dom';
import CompletionCharacter from '../../assets/completion.svg?react';
import { Button } from '../../components/Button/Button';
import { useCreateSessionMutation } from '../../api/session/useCreateSessionMutation';
import { useCameraStore } from '../../store/useCameraStore';

const OnboardingCompletionPage = () => {
  const navigate = useNavigate();
  const { mutate: createSession, isPending } = useCreateSessionMutation();
  const { setShow } = useCameraStore();

  const handleStart = () => {
    /* 세션 생성 후 메인 페이지로 이동 */
    createSession(undefined, {
      onSuccess: () => {
        setShow(); // 카메라 활성화
        navigate('/main');
      },
    });
  };

  return (
    <main className="hbp:h-[calc(100vh-75px)] flex h-[calc(100vh-60px)] flex-col items-center">
      <div className="relative flex w-full flex-col items-center justify-center px-7">
        {/* 캐릭터 영역 */}
        <CompletionCharacter className="labtop:w-[560px] labtop:h-[560px] h-[415px] w-[415px]" />
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
            text={isPending ? '세션 생성 중...' : '시작하기'}
            onClick={handleStart}
            disabled={isPending}
          />
        </div>
      </div>
    </main>
  );
};

export default OnboardingCompletionPage;
