import { createBrowserRouter } from 'react-router-dom';
import Layout from '../layout/Layout';
import CalibrationPage from '../pages/Calibration/CalibrationPage';
import LoginPage from '../pages/Login/LoginPage';
import MainPage from '../pages/Main/MainPage';
import OnboardingCompletionPage from '../pages/Onboarding/OnboardingCompletionPage';
import OnboardingPage from '../pages/Onboarding/OnboardingPage';
import EmailVerificationPage from '../pages/SignUp/EmailVerificationPage';
import ResendVerificationPage from '../pages/SignUp/ResendVerificationPage';
import SignUpPage from '../pages/SignUp/SignUpPage';
import { WidgetPage } from '../pages/Widget/WidgetPage';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    path: '/',
    children: [{ path: '', element: <OnboardingPage /> }],
  },
  {
    path: '/main',
    children: [{ path: '', element: <MainPage /> }],
  },
  {
    element: <Layout />,
    path: '/auth',
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignUpPage /> },
      { path: 'verify', element: <EmailVerificationPage /> },
      { path: 'resend', element: <ResendVerificationPage /> },
    ],
  },
  {
    element: <Layout />,
    path: '/onboarding',
    children: [
      { path: '', element: <OnboardingPage /> },
      { path: 'calibration', element: <CalibrationPage /> },
      { path: 'completion', element: <OnboardingCompletionPage /> },
    ],
  },
  {
    path: '/widget',
    children: [{ path: '', element: <WidgetPage /> }],
  },
]);
