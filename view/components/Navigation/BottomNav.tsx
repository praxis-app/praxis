import { useReactiveVar } from '@apollo/client';
import { EventNote, Group, Home, Menu } from '@mui/icons-material';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  SxProps,
} from '@mui/material';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { isNavDrawerOpenVar } from '../../apollo/cache';
import { NavigationPaths } from '../../constants/shared.constants';
import { scrollTop } from '../../utils/shared.utils';

const PAPER_STYLES: SxProps = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 5,
};

const BottomNav = () => {
  const [value, setValue] = useState(0);
  const isNavDrawerOpen = useReactiveVar(isNavDrawerOpenVar);

  const { pathname } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNavDrawerOpen) {
      const getMatching = (path: string): string => {
        const match = pathname.match(path);
        if (match) {
          return pathname;
        }
        return '';
      };

      switch (pathname) {
        case NavigationPaths.Home:
          setValue(0);
          break;
        case getMatching('groups'):
        case NavigationPaths.Groups:
          setValue(2);
          break;
        case getMatching('events'):
        case NavigationPaths.Events:
          setValue(1);
          break;
        default:
          setValue(3);
      }
    }
  }, [pathname, isNavDrawerOpen]);

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

        <BottomNavigationAction
          icon={<EventNote />}
          label={t('navigation.events')}
          onClick={() => navigate(NavigationPaths.Events)}
        />

        <BottomNavigationAction
          icon={<Group />}
          label={t('navigation.groups')}
          onClick={() => navigate(NavigationPaths.Groups)}
        />

        <BottomNavigationAction
          icon={<Menu />}
          label={t('navigation.menu')}
          onClick={() => isNavDrawerOpenVar(!isNavDrawerOpen)}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
