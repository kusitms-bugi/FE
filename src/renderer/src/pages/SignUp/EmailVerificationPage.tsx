import { useNavigate } from 'react-router-dom';
import { Button } from '@shared/ui/button';
import {
  useResendVerifyEmailMuation,
  useEmailStore,
} from '@entities/user';
import EmailHeroSection from './components/EmailHeroSection';
import ResendSection from './components/ResendSection';

const EmailVerificationPage = () => {

  const resendverifyEmailMutation = useResendVerifyEmailMuation();
  const email = useEmailStore((state) => state.email);
  const navigate = useNavigate();

  /* 토큰 여부에 따른 이메일 인증 */


  /*이메일 다시 보내기 */
  const onResendClick = () => {
    resendverifyEmailMutation.mutate({ email: email, callbackUrl: '' });
  };

  return (
    <main className="hbp:min-h-[calc(100vh-75px)] flex min-h-[calc(100vh-60px)] flex-col items-center justify-center">
      <div className="hbp:mx-auto hbp:max-w-screen-lg hbp:px-10 relative w-full overflow-visible">
        <section className="= flex w-full flex-col items-center justify-center px-7">
          <EmailHeroSection />
          <Button
            onClick={() => navigate('/auth/login')}
            text="로그인"
            className="text-body-xl-medium h-[49px] w-[440px]"
          />
          <ResendSection onClick={onResendClick} />
        </section>
      </div>
    </main>
  );
};

export default EmailVerificationPage;
