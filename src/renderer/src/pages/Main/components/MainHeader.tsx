import DashboardIcon from '@assets/dashboard.svg?react';
import PlanIcon from '@assets/plan.svg?react';
import ProfileIcon from '@assets/profile.svg?react';
import SettingIcon from '@assets/setting.svg?react';
import { useEffect, useState } from 'react';
import Logo from '../../../assets/logo.svg?react';
import Symbol from '../../../assets/symbol.svg?react';
import { Button } from '../../../components/Button/Button';

import { ThemeToggleSwitch } from '../../../components/ThemeToggleSwitch/ThemeToggleSwitch';
import { cn } from '../../../utils/cn';

type TabType = 'dashboard' | 'plan' | 'settings';

const MainHeader = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // SSR 안전 가드
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('theme') === 'dark';
  });

  // 테마 상태가 바뀔 때마다 HTML 클래스 + localStorage 업데이트
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark'); // 다크모드 기억
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light'); // 라이트모드 기억
    }
  }, [isDark]);

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabs = [
    { id: 'dashboard' as TabType, label: '대시보드', icon: DashboardIcon },
    { id: 'plan' as TabType, label: '계획', icon: PlanIcon },
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
        <ProfileIcon />
      </div>
    </div>
  );
};

export default MainHeader;
