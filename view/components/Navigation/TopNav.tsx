import { useReactiveVar } from '@apollo/client';
import { Search as SearchIcon } from '@mui/icons-material';
import {
  AppBar,
  AppBarProps,
  Box,
  IconButton,
  Slide,
  SxProps,
  Toolbar,
  useTheme,
} from '@mui/material';
import { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import appIconImg from '../../assets/images/app-icon.png';
import { NavigationPaths } from '../../constants/shared.constants';
import { isChatPanelOpenVar } from '../../graphql/cache';
import {
  ScrollDirection,
  useAboveBreakpoint,
  useIsDesktop,
} from '../../hooks/shared.hooks';
import { inDevToast } from '../../utils/shared.utils';
import LazyLoadImage from '../Images/LazyLoadImage';
import LevelOneHeading from '../Shared/LevelOneHeading';
import Link from '../Shared/Link';
import TopNavDesktop from './TopNavDesktop';

interface Props {
  appBarProps?: AppBarProps;
  scrollDirection?: ScrollDirection;
}

const TopNav = ({ appBarProps, scrollDirection }: Props) => {
  const isChatPanelOpen = useReactiveVar(isChatPanelOpenVar);

  const { pathname } = useLocation();
  const { t } = useTranslation();
  const isAboveSmall = useAboveBreakpoint('sm');
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const theme = useTheme();

  const appBarStyles: SxProps = {
    background: theme.palette.background.paper,
    borderBottom: isDesktop
      ? `1px solid ${theme.palette.divider}`
      : `0.1px solid ${theme.palette.background.default}`,
    boxShadow: 'none',
    transition: 'none',
  };

  const brandStyles: CSSProperties = {
    color: theme.palette.common.white,
    cursor: 'pointer',
    fontFamily: 'Inter Extra Bold',
    fontSize: isDesktop ? 24 : 18,
    letterSpacing: 0.25,
    minWidth: '75px',
    textTransform: 'none',
  };

  const desktopToolbarStyles: SxProps = {
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      minHeight: 60,
    },
  };

  const toolbarStyles: SxProps = {
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.up('md')]: {
      paddingX: '14px',
    },
    ...(isDesktop ? desktopToolbarStyles : {}),
  };

  const renderBrand = () => {
    if (pathname === NavigationPaths.Home) {
      if (isDesktop) {
        return (
          <LazyLoadImage
            alt="App icon"
            width="42px"
            height="auto"
            src={appIconImg}
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate(0)}
            skipAnimation
          />
        );
      }
      return (
        <LevelOneHeading onClick={() => navigate(0)} sx={brandStyles}>
          {t('brand')}
        </LevelOneHeading>
      );
    }
    if (isDesktop) {
      return (
        <Link
          href={NavigationPaths.Home}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <LazyLoadImage
            alt="App icon"
            width="42px"
            height="auto"
            src={appIconImg}
            sx={{ cursor: 'pointer' }}
            skipAnimation
          />
        </Link>
      );
    }
    return (
      <Link href={NavigationPaths.Home}>
        <LevelOneHeading sx={brandStyles}>{t('brand')}</LevelOneHeading>
      </Link>
    );
  };

  return (
    <Box position="fixed" width="100%" zIndex={5}>
      <Slide
        in={isAboveSmall || isChatPanelOpen || scrollDirection !== 'down'}
        appear={false}
        timeout={220}
      >
        <AppBar
          role="banner"
          position="relative"
          sx={appBarStyles}
          {...appBarProps}
        >
          <Toolbar sx={toolbarStyles}>
            {renderBrand()}

            {isDesktop ? (
              <TopNavDesktop />
            ) : (
              <IconButton
                aria-label={t('labels.menu')}
                edge="end"
                onClick={inDevToast}
                size="large"
              >
                <SearchIcon />
              </IconButton>
            )}
          </Toolbar>
        </AppBar>
      </Slide>
    </Box>
  );
};

export default TopNav;
