import { Container } from '@mui/material';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  useAboveBreakpoint,
  useIsDesktop,
  useScrollDirection,
} from '../../hooks/shared.hooks';
import AuthWrapper from '../Auth/AuthWrapper';
import BottomNav from '../Navigation/BottomNav';
import LeftNav from '../Navigation/LeftNav';
import NavDrawer from '../Navigation/NavDrawer';
import ScrollToTop from '../Navigation/ScrollToTop';
import TopNav from '../Navigation/TopNav';
import Toast from '../Shared/Toast';

const Layout = () => {
  const { pathname } = useLocation();
  const isDesktop = useIsDesktop();
  const isLarge = useAboveBreakpoint('lg');
  const scrollDirection = useScrollDirection();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <AuthWrapper>
      <TopNav scrollDirection={scrollDirection} />
      {!isLarge && <BottomNav scrollDirection={scrollDirection} />}
      {isLarge && <LeftNav />}
      <NavDrawer />

      <Container maxWidth="sm">
        <main role="main">
          <Outlet />
          <Toast />
          {isDesktop && <ScrollToTop />}
        </main>
      </Container>
    </AuthWrapper>
  );
};

export default Layout;
