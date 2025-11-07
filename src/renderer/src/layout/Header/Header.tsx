import { useEffect, useState } from 'react';
import Logo from '../../assets/logo.svg?react';
import { ThemeToggleSwitch } from '../../components/ToggleSwitch/ToggleSwitch';

const Header = () => {
  const [isDark, setIsDark] = useState(() => {
    // localStorage에 값이 있으면 true/false로 변환해서 사용
    return localStorage.getItem('theme') === 'dark';
  });

  //테마 상태가 바뀔 때마다 HTML 클래스 + localStorage 업데이트
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark'); // 다크모드 기억
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light'); // 라이트모드 기억
    }
  }, [isDark]);

  return (
    <div className="bg-grey-0 hbp:h-[75px] hbp:px-7.5 hbp:py-5 fixed top-0 z-100 h-15 w-full px-6 py-4">
      <div className="flex w-full flex-row justify-between">
        <div className="hbp:gap-4 flex flex-row items-center gap-[10px]">
          <span className="hbp:w-[46px] aspect-[37/32] w-[37px] bg-[rgba(255,191,0,0.10)]" />
          <Logo className="hbp:h-[27px] hbp:w-[115px] [&>path]:fill-logo-fill flex h-[22px] w-[92px]" />
        </div>
        <ThemeToggleSwitch checked={isDark} onChange={setIsDark} />
      </div>
    </div>
  );
};

export default Header;
