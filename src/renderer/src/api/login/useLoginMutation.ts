import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { LoginInput, LoginResponse } from '../../types/login/mutation';

/*로그인 api */
const login = async (data: LoginInput): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', data);
  const result = response.data;

  if (!result.success) {
    throw new Error(result.message || '로그인 실패');
  }

  return result;
};

export const useLoginMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: login,
    onSuccess: async (res) => {
      console.log('로그인 성공', res);

      /*access Token, refresh Token 저장 */
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);

      navigate('/onboarding/init');
    },
    onError: (error) => {
      console.error('로그인 오류:', error);
      alert('로그인 실패');
    },
  });
};
