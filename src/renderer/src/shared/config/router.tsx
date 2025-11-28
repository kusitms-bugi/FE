import api from '@shared/api';
import { createBrowserRouter, redirect } from 'react-router-dom';
import Layout from '../../app/layouts/Layout';
import {
  CalibrationPage,
  EmailVerificationCallbackPage,
  EmailVerificationPage,
  LoginPage,
  MainPage,
  OnboardingCompletionPage,
  OnboardingInitPage,
  OnboardingPage,
  ResendVerificationPage,
  SignUpPage,
  WidgetPage,
} from '../../pages';

// 인증이 필요한 페이지용 loader
const requireAuthLoader = async () => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    return redirect('/');
  }

  try {
    await api.get('/users/me');
    return null;
  } catch {
    localStorage.clear();
    return redirect('/');
  }
};

// 로그인 페이지용 loader (토큰이 있으면 메인으로 리다이렉트)
const loginPageLoader = async () => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    return null;
  }

  try {
    await api.get('/users/me');
    return redirect('/main');
  } catch {
    localStorage.clear();
    return null;
  }
};

export const router = createBrowserRouter([
  {
    path: '/main',
    loader: requireAuthLoader,
    element: <MainPage />,
  },
  {
    element: <Layout />,
    path: '/auth',
    children: [
      {
        path: 'login',
        loader: loginPageLoader,
        element: <LoginPage />,
      },
      { path: 'signup', element: <SignUpPage /> },
      { path: 'verify', element: <EmailVerificationPage /> },
      { path: 'verify-callback', element: <EmailVerificationCallbackPage /> },
      { path: 'resend', element: <ResendVerificationPage /> },
    ],
  },
  {
    element: <Layout />,
    path: '/',
    children: [
      {
        path: '',
        loader: loginPageLoader,
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <Layout />,
    path: '/onboarding',
    children: [
      { path: '', element: <OnboardingPage /> },
      { path: 'calibration', element: <CalibrationPage /> },
      { path: 'completion', element: <OnboardingCompletionPage /> },
      { path: 'init', element: <OnboardingInitPage /> },
    ],
  },
  {
    path: '/widget',
    children: [{ path: '', element: <WidgetPage /> }],
  },
]);
