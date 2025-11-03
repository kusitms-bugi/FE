import Logo from '../../../assets/logo.svg?react';

export default function HeroSection() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="hbp:gap-6 flex w-full flex-row items-center justify-center gap-5">
        <span className="hbp:w-[92px] aspect-[1/1] w-[74px] bg-[rgba(255,191,0,0.10)]" />
        <Logo className="hbp:h-[55px] hbp:w-[230px] flex h-[44px] w-[184px]" />
      </div>
      <p className="text-body-lg-medium text-grey-400 hbp:text-headline-2xl-medium">
        세상 모든 거북목들이 기린이 될 때까지
      </p>
    </div>
  );
}
