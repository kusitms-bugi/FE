import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
// import api from '@shared/api';
import { LoginInput, LoginResponse } from '../types';

/*로그인 api (목 데이터) */
const login = async (data: LoginInput): Promise<LoginResponse> => {
  // const response = await api.post<LoginResponse>('/auth/login', data);
  // const result = response.data;

  // if (!result.success) {
  //   throw new Error(result.message || '로그인 실패');
  // }

  // return result;

  // 목 데이터 반환
  return {
    timestamp: new Date().toISOString(),
    success: true,
    data: {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    },
    code: 'SUCCESS',
    message: '로그인 성공',
  };
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

      /* 사용자 정보 조회 후 이름 저장 */
      // try {
      //   const userResponse = await api.get('/users/me');
      //   if (userResponse.data.success && userResponse.data.data.name) {
      //     localStorage.setItem('userName', userResponse.data.data.name);
      //   }
      // } catch (error) {
      //   console.error('사용자 정보 조회 실패:', error);
      // }

      // 목 데이터: 사용자 이름 저장
      localStorage.setItem('userName', '테스트 사용자');

      navigate('/onboarding/init');
    },
    onError: (error) => {
      console.error('로그인 오류:', error);
    },
  });
};
