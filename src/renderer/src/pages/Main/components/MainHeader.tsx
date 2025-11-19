import DashboardIcon from '@assets/dashboard.svg?react';
import SettingIcon from '@assets/setting.svg?react';
import { useEffect, useRef, useState } from 'react';
import Logo from '../../../assets/logo.svg?react';
import NotificationIcon from '../../../assets/main/bell_icon.svg?react';
import Symbol from '../../../assets/symbol.svg?react';
import { Button } from '../../../components/Button/Button';

import { ThemeToggleSwitch } from '../../../components/ThemeToggleSwitch/ThemeToggleSwitch';
import { cn } from '../../../utils/cn';

type TabType = 'dashboard' | 'plan' | 'settings';

interface MainHeaderProps {
  onClickNotification?: () => void;
}

const MainHeader = ({ onClickNotification }: MainHeaderProps) => {
  // 시스템 테마 적용 중인지 추적 (localStorage 저장 방지용)
  const isApplyingSystemTheme = useRef(false);

  const [isDark, setIsDark] = useState<boolean>(() => {
    // SSR 안전 가드
    if (typeof window === 'undefined') return false;

    // localStorage에 저장된 테마가 있으면 사용
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme === 'dark';
    }

    // 저장된 테마가 없으면 기본값 false (시스템 테마는 useEffect에서 확인)
    return false;
  });

  // 초기 로드 시 시스템 테마 확인 (localStorage에 값이 없을 때만)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');

    // localStorage에 테마가 저장되어 있지 않으면 시스템 테마 사용
    if (!savedTheme && window.electronAPI?.getSystemTheme) {
      isApplyingSystemTheme.current = true;
      window.electronAPI
        .getSystemTheme()
        .then((systemTheme: 'dark' | 'light') => {
          const shouldBeDark = systemTheme === 'dark';
          setIsDark(shouldBeDark);
          // 시스템 테마를 즉시 적용 (localStorage에는 저장하지 않음)
          if (shouldBeDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          // 시스템 테마 적용 완료 후 플래그 해제
          setTimeout(() => {
            isApplyingSystemTheme.current = false;
          }, 0);
        })
        .catch((error) => {
          console.error('시스템 테마 조회 실패:', error);
          isApplyingSystemTheme.current = false;
        });
    } else if (savedTheme) {
      // 저장된 테마가 있으면 즉시 적용
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // 테마 상태가 바뀔 때마다 HTML 클래스 + localStorage 업데이트
  // 단, 시스템 테마 적용 중일 때는 localStorage에 저장하지 않음
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 시스템 테마 적용 중이 아닐 때만 localStorage에 저장
    if (!isApplyingSystemTheme.current) {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
  }, [isDark]);

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
