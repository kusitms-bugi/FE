import DashboardIcon from '@assets/dashboard.svg?react';
import SettingIcon from '@assets/setting.svg?react';
import { useState } from 'react';
import Logo from '../../../assets/logo.svg?react';
import NotificationIcon from '../../../assets/main/bell_icon.svg?react';
import Symbol from '../../../assets/symbol.svg?react';
import { Button } from '../../../components/Button/Button';

import { ThemeToggleSwitch } from '../../../components/ThemeToggleSwitch/ThemeToggleSwitch';
import { useThemePreference } from '../../../hooks/useThemePreference';
import { cn } from '../../../utils/cn';

type TabType = 'dashboard' | 'plan' | 'settings';

interface MainHeaderProps {
  onClickNotification?: () => void;
}

const MainHeader = ({ onClickNotification }: MainHeaderProps) => {
  const [isDark, setIsDark] = useThemePreference();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabs = [
    { id: 'dashboard' as TabType, label: '대시보드', icon: DashboardIcon },
    { id: 'settings' as TabType, label: '설정', icon: SettingIcon },
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
                onClick={() => setActiveTab(tab.id)}
                variant={isActive ? 'primary' : 'grey'}
                size="sm"
                className={cn(
                  'group',
                  isActive
                    ? 'text-grey-1000 bg-yellow-400'
                    : 'bg-grey-25 text-grey-400 group-hover:text-grey-700',
                )}
                text={
                  <div className="flex items-center gap-2">
                    <Icon
                      className={cn(
                        'h-[18px] w-[18px]',
                        isActive
                          ? 'text-grey-1000'
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
