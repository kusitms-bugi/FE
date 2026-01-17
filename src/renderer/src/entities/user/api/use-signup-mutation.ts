import api from '@shared/api';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { SignupRequest } from '../types';

/* 이메일 중복 확인 api */
const duplicatedEmail = async (email: string) => {
  const response = await api.post('/auth/check-email', { email });
  return response.data;
};

/* 회원가입 api */
const signupUser = async (data: SignupRequest) => {
  try {
    const response = await api.post(`/auth/sign-up`, {
      ...data,
      callbackUrl: `${window.location.origin}/auth/verify-callback`,
    });
    const result = response.data;

    /* 회원가입 실패 시 예외 처리 */
    if (!result.success) {
      throw new Error(result.message || '회원가입 실패');
    }

    return response.data;
  } catch (error: any) {
    // axios 에러인 경우 response.data에서 메시지 추출
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.response?.data) {
      const errorData = error.response.data;
      throw new Error(errorData.message || errorData.code || '회원가입 실패');
    }
    // 일반 에러인 경우
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('회원가입 실패');
  }
};

export const useDuplicatedEmailMutation = () => {
  return useMutation({
    mutationFn: duplicatedEmail,
  });
};

export const useSignupMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: signupUser,
    onSuccess: (data) => {
      // 회원가입 성공 시, 인증 안내 페이지로 이동
      navigate('/auth/verify');
      console.log('회원가입 성공:', data);
    },
    onError: (error: unknown) => {
      console.error('회원가입 실패:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.';
      alert(errorMessage);
    },
  });
};
