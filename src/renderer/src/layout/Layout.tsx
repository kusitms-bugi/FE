import { Outlet, useLocation } from 'react-router-dom';
import DevNavbar from '../components/DevNavbar/DevNavbar';
import Header from './Header/Header';

const Layout = () => {
  /* 로그인 페이지 헤더 숨김 */
  const location = useLocation();
  const hideHeader = location.pathname === '/auth/login';

  return (
    <div className={`min-h-screen ${!hideHeader ? 'hbp:pt-[75px] pt-15' : ''}`}>
      <DevNavbar />
      {!hideHeader && <Header />}
      <Outlet />
    </div>
  );
};

export default Layout;
