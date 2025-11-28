import api from '@shared/api';
import { createBrowserRouter, redirect } from 'react-router-dom';
import Layout from '../../layout/Layout';
import CalibrationPage from '../../pages/Calibration/CalibrationPage';
import LoginPage from '../../pages/Login/LoginPage';
import MainPage from '../../pages/Main/MainPage';
import OnboardingCompletionPage from '../../pages/Onboarding/OnboardingCompletionPage';
import OnboardinInitPage from '../../pages/Onboarding/OnboardingInitPage';
import OnboardingPage from '../../pages/Onboarding/OnboardingPage';
import EmailVerificationCallbackPage from '../../pages/SignUp/EmailVerificationCallbackPage';
import EmailVerificationPage from '../../pages/SignUp/EmailVerificationPage';
import ResendVerificationPage from '../../pages/SignUp/ResendVerificationPage';
import SignUpPage from '../../pages/SignUp/SignUpPage';
import { WidgetPage } from '../../pages/Widget/WidgetPage';

// 인증이 필요한 페이지용 loader
const requireAuthLoader = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        return redirect('/');
    }

    try {
        await api.get('/users/me');
        return null;
    } catch (error) {
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
    } catch (error) {
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
            { path: 'init', element: <OnboardinInitPage /> },
        ],
    },
    {
        path: '/widget',
        children: [{ path: '', element: <WidgetPage /> }],
    },
]);

