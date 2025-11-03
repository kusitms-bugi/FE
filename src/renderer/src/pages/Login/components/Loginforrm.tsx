import { useForm } from 'react-hook-form';
import TextInput from '../../../components/InputField/TextField';
import SaveIdIcon from '../../../assets/auth/saveid_icon.svg?react';
import LoginButton from './LoginButton';
import PasswordField from './PasswordField';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../../../api/login/useLoginMutation';
import FailIcon from '../../../assets/auth/error_icon.svg?react';

interface LoginFormData {
  email: string;
  password: string;
  saveId: boolean;
}

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm<LoginFormData>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      saveId: false,
    },
  });

  const loginMutation = useLoginMutation();
  const navigate = useNavigate();

  const onSubmit = (data: LoginFormData) => {
    console.log('로그인 시도:', data);
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  const email = watch('email');
  const password = watch('password');

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="hbp:w-[550px] flex w-[440px] flex-col items-center gap-3"
      >
        {/* 이메일 */}
        <TextInput
          type="text"
          placeholder="이메일"
          {...register('email')}
          className="hbp:text-body-lg-regular aspect-[44/6]"
        />

        {/* 비밀번호 */}
        <PasswordField {...register('password')} hasValue={!!password} />
        {loginMutation.isError && (
          <div className="text-caption-sm-regular flex items-center gap-1 self-start text-red-500">
            <FailIcon className="h-[16px] w-[16px]" />
            <span>이메일 또는 비밀번호가 올바르지 않습니다.</span>
          </div>
        )}

        {/* 아이디 저장 */}
        <div className="text-caption-sm-regular hbp:text-body-lg-regular text-grey-400 mt-1 flex w-full justify-start gap-3">
          <label className="hbp:gap-2.5 flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              {...register('saveId')}
              className="sr-only"
            />
            <SaveIdIcon
              className={watch('saveId') ? '[&>rect]:fill-yellow-400' : ''}
            />
            <span>아이디 저장</span>
          </label>
        </div>

        {/* 버튼 */}
        <LoginButton type="submit" disabled={!email || !password} />
      </form>

      {/* 회원가입 / 비밀번호 찾기 */}
      <div className="text-grey-300 text-caption-sm-regular hbp:text-body-lg-regular hbp:mt-[-20px] hbp:gap-[25px] mt-[-16px] flex flex-row gap-5">
        <span
          onClick={() => navigate('/auth/signup')}
          className="hover:text-grey-200 cursor-pointer"
        >
          회원가입
        </span>
        <span>|</span>
        <span className="hover:text-grey-200 cursor-pointer">
          비밀번호 찾기
        </span>
      </div>
    </>
  );
};

export default LoginForm;
