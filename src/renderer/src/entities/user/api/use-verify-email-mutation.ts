import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@shared/api';
import { ResendVerifyEmailRequest } from '../types';

/*이메일 인증 api*/
const verifyEmail = async (token: string) => {
  try {
    const response = await api.post('/auth/verify-email', { token });
    const result = response.data;

    if (!result.success) {
      throw new Error(result.message || '인증 실패');
    }

    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.response?.data) {
      const errorData = error.response.data;
      throw new Error(errorData.message || errorData.code || '인증 실패');
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('인증 실패');
  }
};

/*이메일 인증 다시 보내기 api*/
const resendVerifyEmail = async (data: ResendVerifyEmailRequest) => {
  try {
    const response = await api.post('/auth/resend-verification-email', {
      ...data,
      callbackUrl: `${window.location.origin}/auth/resend`,
    });

    const result = response.data;

    if (!result.success) {
      throw new Error(result.message || '다시 보내기 실패');
    }

    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.response?.data) {
      const errorData = error.response.data;
      throw new Error(
        errorData.message || errorData.code || '다시 보내기 실패',
      );
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('다시 보내기 실패');
  }
};

export const useVerifyEmailMutation = () => {
  return useMutation({
    mutationFn: verifyEmail,

    onSuccess: (data) => {
      console.log('이메일 인증 성공:', data);
      alert('인증 성공!');
      localStorage.clear();
    },
    onError: (error: unknown) => {
      console.error('인증 실패:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '인증 실패! 다시 시도해주세요';
      alert(errorMessage);
    },
  });
};

export const useResendVerifyEmailMuation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: resendVerifyEmail,

    onSuccess: (data) => {
      navigate('/auth/resend');
      console.log('인증 다시 보내기 성공:', data);
    },
    onError: (error: unknown) => {
      console.error('인증 다시 보내기 실패:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '인증 다시 보내기 실패';
      alert(errorMessage);
    },
  });
};
