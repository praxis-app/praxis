import { useReactiveVar } from '@apollo/client';
import { Container } from '@mui/material';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { isChatPanelOpenVar } from '../../graphql/cache';
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
  const isChatPanelOpen = useReactiveVar(isChatPanelOpenVar);

  const { pathname } = useLocation();
  const isDesktop = useIsDesktop();
  const isLarge = useAboveBreakpoint('lg');
  const scrollDirection = useScrollDirection();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const renderMain = () => (
    <main role="main">
      <Outlet />
      <Toast />
      {isDesktop && <ScrollToTop />}
    </main>
  );

  const renderContent = () => {
    if (isChatPanelOpen) {
      return renderMain();
    }
    return <Container maxWidth="sm">{renderMain()}</Container>;
  };

  return (
    <AuthWrapper>
      <TopNav scrollDirection={scrollDirection} />
      {!isLarge && <BottomNav scrollDirection={scrollDirection} />}
      {isLarge && <LeftNav />}
      <NavDrawer />

      {renderContent()}
    </AuthWrapper>
  );
};

export default Layout;
