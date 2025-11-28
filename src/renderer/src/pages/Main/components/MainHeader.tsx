import DashboardIcon from '@assets/dashboard.svg?react';
import SettingIcon from '@assets/setting.svg?react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../../assets/logo.svg?react';
import NotificationIcon from '../../../assets/main/bell_icon.svg?react';
import Symbol from '../../../assets/symbol.svg?react';
import { Button } from '@shared/ui/button';

import { ThemeToggleSwitch } from '@shared/ui/theme-toggle-switch';
import { useThemePreference } from '@shared/hooks/use-theme-preference';
import { cn } from '@shared/lib/cn';

type TabType = 'dashboard' | 'plan' | 'settings';

interface MainHeaderProps {
  onClickNotification?: () => void;
}

const MainHeader = ({ onClickNotification }: MainHeaderProps) => {
  const [isDark, setIsDark] = useThemePreference();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  /* 임시 로그아웃 기능 */
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: '대시보드',
      icon: DashboardIcon,
      disabled: false,
    },
    {
      id: 'settings' as TabType,
      label: '설정',
      icon: SettingIcon,
      disabled: true,
    }, // 임시 비활성화
  ];

  return (
    <div className="bg-grey-0 mr-4 flex justify-between rounded-[999px] p-2">
      {/* 타이틀 영역 */}
      <div className="flex items-center gap-10">
        <div className="ml-3 flex items-center gap-[10px]">
          <Symbol className="flex h-[27px] w-[27px]" />
          <Logo className="hbp:h-[27px] hbp:w-[115px] [&>path]:fill-logo-fill flex h-[22px] w-[92px]" />
        </div>

        {/* 네비게이션 탭 */}
        <nav className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'settings') {
                    handleLogout();
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                disabled={tab.disabled}
                variant={isActive ? 'primary' : 'grey'}
                size="sm"
                className={cn(
                  'group',
                  isActive
                    ? 'text-grey-1000 dark:text-grey-0 bg-yellow-400'
                    : 'bg-grey-25 text-grey-400 group-hover:text-grey-700',
                )}
                text={
                  <div className="flex items-center gap-2">
                    <Icon
                      className={cn(
                        'h-[18px] w-[18px]',
                        isActive
                          ? 'text-grey-1000 dark:text-grey-0'
                          : 'text-grey-400 group-hover:text-grey-700',
                      )}
                    />
                    <span className="text-body-md-medium group-hover:text-grey-700">
                      {tab.label}
                    </span>
                  </div>
                }
              />
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggleSwitch checked={isDark} onChange={setIsDark} />
        <Button
          onClick={onClickNotification}
          variant="grey"
          className="h-[34px] w-[34px] p-[7px]"
          text={<NotificationIcon className="[&>path]:stroke-grey-400" />}
        />
      </div>
    </div>
  );
};

export default MainHeader;
