import CalibrationResetIcon from '@assets/option/CalibrationResetIcon.svg?react';
import LogoutIcon from '@assets/option/LogoutIcon.svg?react';
import WithdrawIcon from '@assets/option/WithdrawIcon.svg?react';
import {
  clearCalibrationGate,
  requestCalibrationReset,
} from '@shared/lib/calibration-gate';
import { Button } from '@shared/ui/button';
import { ModalPortal } from '@shared/ui/modal';
import { useNavigate } from 'react-router-dom';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal = ({ onClose }: SettingsModalProps) => {
  const navigate = useNavigate();

  const clearLocalAuthData = (userId: string | null, clearCalibration: boolean) => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('sessionStartAt');
    localStorage.removeItem('sessionStartDistance');
    localStorage.removeItem('lastSessionId');
    localStorage.removeItem('widgetVisibleStartAt');
    localStorage.removeItem('mainWindowActiveAt');

    if (clearCalibration) {
      localStorage.removeItem('calibration_result_v1');
      clearCalibrationGate(userId);
    }
  };

  const handleLogout = () => {
    const userId = localStorage.getItem('userId');
    clearLocalAuthData(userId, false);
    onClose();
    navigate('/auth/login', { replace: true });
  };

  const handleWithdraw = () => {
    const shouldProceed = window.confirm(
      '회원탈퇴 API가 아직 없어 로컬 데이터만 삭제합니다. 계속할까요?',
    );
    if (!shouldProceed) return;

    const userId = localStorage.getItem('userId');
    clearLocalAuthData(userId, true);
    onClose();
    navigate('/auth/signup', { replace: true });
  };

  const handleCalibrationReset = () => {
    const userId = localStorage.getItem('userId');
    requestCalibrationReset(userId);
    onClose();
    navigate('/onboarding/init');
  };

  const actionItems = [
    { label: '로그아웃', icon: <LogoutIcon />, onClick: handleLogout },
    { label: '회원탈퇴', icon: <WithdrawIcon />, onClick: handleWithdraw },
    {
      label: '캘리브레이션 재설정',
      icon: <CalibrationResetIcon />,
      onClick: handleCalibrationReset,
    },
  ];

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-999999 flex h-full w-full items-center justify-center bg-black/40 dark:bg-black/70"
        onClick={onClose}
      >
        <div
          className="bg-surface-modal border-grey-0 flex w-[339px] flex-col gap-4 rounded-[24px] border p-4 shadow-[0_0_24px_rgba(0,0,0,0.12)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-surface-modal-container rounded-[12px] p-3">
            <h2 className="text-body-lg-semibold text-grey-900">설정</h2>
          </div>

          <div className="bg-surface-modal-container flex flex-col overflow-hidden rounded-[12px]">
            {actionItems.map((item, index) => (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={`font-['Pretendard'] text-[12px] leading-[150%] font-medium text-grey-700 hover:bg-grey-25 flex cursor-pointer items-center gap-2 px-3 py-[10px] text-left ${
                  index === actionItems.length - 1
                    ? ''
                    : 'border-grey-50 border-b'
                }`}
              >
                <span className="flex size-6 shrink-0 items-center justify-center">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <Button
            onClick={onClose}
            text="닫기"
            variant="primary"
            size="md"
            className="text-body-md-medium h-[43px] w-full"
          />
        </div>
      </div>
    </ModalPortal>
  );
};

export default SettingsModal;
