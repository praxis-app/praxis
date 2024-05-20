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
import { activeChatVar } from '../../graphql/cache';
import {
  ScrollDirection,
  useAboveBreakpoint,
  useIsDesktop,
  useScrollPosition,
} from '../../hooks/shared.hooks';
import { inDevToast, scrollTop } from '../../utils/shared.utils';
import LazyLoadImage from '../Images/LazyLoadImage';
import Flex from '../Shared/Flex';
import LevelOneHeading from '../Shared/LevelOneHeading';
import TopNavDesktop from './TopNavDesktop';

interface Props {
  appBarProps?: AppBarProps;
  scrollDirection?: ScrollDirection;
}

const TopNav = ({ appBarProps, scrollDirection }: Props) => {
  const activeChat = useReactiveVar(activeChatVar);

  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const scrollPosition = useScrollPosition();
  const isAboveSmall = useAboveBreakpoint('sm');
  const isDesktop = useIsDesktop();
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

  const handleBrandClick = () => {
    if (scrollPosition > window.document.body.offsetHeight * 0.025) {
      scrollTop();
      return;
    }
    if (pathname !== NavigationPaths.Home) {
      navigate(NavigationPaths.Home);
      return;
    }
    navigate(0);
  };

  return (
    <Box position="fixed" width="100%" zIndex={5}>
      <Slide
        in={!!activeChat || isAboveSmall || scrollDirection !== 'down'}
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
            <Flex alignItems="center" onClick={handleBrandClick}>
              {isDesktop ? (
                <LazyLoadImage
                  alt="App icon"
                  width="42px"
                  height="auto"
                  src={appIconImg}
                  sx={{ cursor: 'pointer' }}
                  skipAnimation
                />
              ) : (
                <LevelOneHeading sx={brandStyles}>{t('brand')}</LevelOneHeading>
              )}
            </Flex>

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
