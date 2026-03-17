import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@shared/api';
import { ResendVerifyEmailRequest } from '../types';
import { AnalyticsEvents } from '@shared/lib/analytics/events';
import { markCalibrationInitialRequired } from '@shared/lib/calibration-gate';
import axios from 'axios';

type VerifyEmailResponse = {
  timestamp?: string;
  success: boolean;
  code?: string;
  message?: string | null;
  data?: {
    id?: string;
    userId?: string;
  };
};

type UseVerifyEmailMutationOptions = {
  redirectTo?: string;
};

/*이메일 인증 api*/
const verifyEmail = async (token: string) => {
  try {
    const response = await api.post<VerifyEmailResponse>('/auth/verify-email', {
      token,
    });
    const result = response.data as VerifyEmailResponse;

    if (!result.success) {
      throw new Error(result.message || '인증 실패');
    }

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorData = error.response.data as { message?: string; code?: string };
      throw new Error(errorData.message || errorData.code || '인증 실패');
    }
    throw error instanceof Error ? error : new Error('인증 실패');
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
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorData = error.response.data as { message?: string; code?: string };
      throw new Error(errorData.message || errorData.code || '다시 보내기 실패');
    }
    throw error instanceof Error ? error : new Error('다시 보내기 실패');
  }
};

export const useVerifyEmailMutation = (
  options?: UseVerifyEmailMutationOptions,
) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: verifyEmail,

    onSuccess: (data) => {
      console.log('이메일 인증 성공:', data);
      let userId: string | undefined =
        (data as VerifyEmailResponse | undefined)?.data?.userId ??
        (data as VerifyEmailResponse | undefined)?.data?.id;

      if (!userId) {
        console.warn('[GA] sign_up_complete: user_id is missing from response');
      }

      const tsRaw = (data as VerifyEmailResponse | undefined)?.timestamp;
      const signupCompletedAt = tsRaw ? Date.parse(tsRaw) : NaN;

      if (!tsRaw) {
        console.warn('[GA] sign_up_complete: server timestamp missing, using client time');
      } else if (!Number.isFinite(signupCompletedAt)) {
        console.warn('[GA] sign_up_complete: server timestamp parsing failed, using client time', { tsRaw });
      }

      const signupCompletedAtMs = Number.isFinite(signupCompletedAt)
        ? signupCompletedAt
        : Date.now();

      // Keep retention anchor across localStorage.clear()
      const preserved: Record<string, string> = {
        signupCompletedAt: signupCompletedAtMs.toString(),
      };
      const gaFirstMeasure = localStorage.getItem('ga_first_measure_start_sent');
      const gaMeaningful = localStorage.getItem('ga_meaningful_use_sent');
      const gaOnboardingEnter = localStorage.getItem('ga_onboarding_enter_sent');

      if (gaFirstMeasure) preserved.ga_first_measure_start_sent = gaFirstMeasure;
      if (gaMeaningful) preserved.ga_meaningful_use_sent = gaMeaningful;
      if (gaOnboardingEnter) preserved.ga_onboarding_enter_sent = gaOnboardingEnter;

      AnalyticsEvents.signUpComplete({ user_id: userId });

      alert('인증 성공!');
      localStorage.clear();
      Object.entries(preserved).forEach(([k, v]) => localStorage.setItem(k, v));
      markCalibrationInitialRequired(userId);
      if (options?.redirectTo) {
        navigate(options.redirectTo, { replace: true });
      }
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
