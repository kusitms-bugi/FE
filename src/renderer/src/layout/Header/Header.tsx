import Logo from '../../assets/logo.svg?react';

const Header = () => {
  return (
    <div className="bg-grey-0 hbp:h-[75px] hbp:px-7.5 hbp:py-5 fixed top-0 z-100 h-15 w-full px-6 py-4">
      <div className="hbp:gap-4 flex flex-row items-center gap-[10px]">
        <span className="hbp:w-[46px] aspect-[37/32] w-[37px] bg-[rgba(255,191,0,0.10)]" />
        <Logo className="hbp:h-[27px] hbp:w-[115px] flex h-[22px] w-[92px]" />
      </div>
    </div>
  );
};

export default Header;
