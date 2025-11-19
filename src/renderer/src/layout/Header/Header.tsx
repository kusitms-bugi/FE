import { useEffect, useRef, useState } from 'react';
import Logo from '../../assets/logo.svg?react';
import Symbol from '../../assets/symbol.svg?react';
import { ThemeToggleSwitch } from '../../components/ThemeToggleSwitch/ThemeToggleSwitch';

const Header = () => {
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

  return (
    <div className="bg-grey-0 hbp:h-[75px] hbp:px-7.5 hbp:py-5 fixed top-0 z-100 h-15 w-full px-6 py-4">
      <div className="flex w-full flex-row justify-between">
        <div className="hbp:gap-4 flex flex-row items-center gap-[10px]">
          <Symbol className="flex h-[27px] w-[27px]" />
          <Logo className="hbp:h-[27px] hbp:w-[115px] [&>path]:fill-logo-fill flex h-[22px] w-[92px]" />
        </div>
        <ThemeToggleSwitch checked={isDark} onChange={setIsDark} />
      </div>
    </div>
  );
};

export default Header;
