import { useReactiveVar } from '@apollo/client';
import {
  EventNote,
  Group,
  Home,
  Menu,
  Notifications,
} from '@mui/icons-material';
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Collapse,
  Paper,
  SxProps,
} from '@mui/material';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavigationPaths } from '../../constants/shared.constants';
import { isLoggedInVar, isNavDrawerOpenVar } from '../../graphql/cache';
import { ScrollDirection } from '../../hooks/shared.hooks';
import { scrollTop } from '../../utils/shared.utils';
import NotificationCount from '../Notifications/NotificationCount';

const PAPER_STYLES: SxProps = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 5,
};

interface Props {
  scrollDirection: ScrollDirection;
}

const BottomNav = ({ scrollDirection }: Props) => {
  const [value, setValue] = useState(0);
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const isNavDrawerOpen = useReactiveVar(isNavDrawerOpenVar);

  const { pathname } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isNavDrawerOpen) {
      return;
    }
    if (pathname === NavigationPaths.Home) {
      setValue(0);
      return;
    }
    if (
      !isLoggedIn &&
      (pathname === NavigationPaths.Events ||
        pathname.includes(NavigationPaths.Events))
    ) {
      setValue(1);
      return;
    }
    if (
      pathname === NavigationPaths.Groups ||
      pathname.includes(NavigationPaths.Groups)
    ) {
      setValue(2);
      return;
    }
    if (isLoggedIn && pathname === NavigationPaths.Activity) {
      setValue(3);
      return;
    }
    setValue(4);
  }, [pathname, isNavDrawerOpen, isLoggedIn]);

  const handleHomeButtonClick = () => {
    if (pathname === NavigationPaths.Home) {
      scrollTop();
    } else {
      navigate(NavigationPaths.Home);
    }
  };

  const handleNavChange = (
    _: SyntheticEvent<Element, Event>,
    newValue: number,
  ) => setValue(newValue);

  return (
    <Paper sx={PAPER_STYLES}>
      <Collapse in={scrollDirection !== 'down'}>
        <BottomNavigation
          onChange={handleNavChange}
          role="navigation"
          showLabels
          value={value}
        >
          <BottomNavigationAction
            icon={<Home />}
            label={t('navigation.home')}
            onClick={handleHomeButtonClick}
          />

          {!isLoggedIn && (
            <BottomNavigationAction
              icon={<EventNote />}
              label={t('navigation.events')}
              onClick={() => navigate(NavigationPaths.Events)}
            />
          )}

          <BottomNavigationAction
            icon={<Group />}
            label={t('navigation.groups')}
            onClick={() => navigate(NavigationPaths.Groups)}
          />

          {isLoggedIn && (
            <BottomNavigationAction
              icon={
                <Box position="relative">
                  <Notifications />
                  <NotificationCount />
                </Box>
              }
              label={t('navigation.activity')}
              onClick={() => navigate(NavigationPaths.Activity)}
            />
          )}

          <BottomNavigationAction
            icon={<Menu />}
            label={t('navigation.menu')}
            onClick={() => isNavDrawerOpenVar(!isNavDrawerOpen)}
          />
        </BottomNavigation>
      </Collapse>
    </Paper>
  );
};

export default BottomNav;
