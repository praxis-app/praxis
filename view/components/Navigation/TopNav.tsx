import { Search as SearchIcon } from '@mui/icons-material';
import {
  AppBar,
  AppBarProps,
  IconButton,
  SxProps,
  Toolbar,
  useTheme,
} from '@mui/material';
import { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { NavigationPaths } from '../../constants/shared.constants';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { inDevToast } from '../../utils/shared.utils';
import LevelOneHeading from '../Shared/LevelOneHeading';
import Link from '../Shared/Link';
import TopNavDesktop from './TopNavDesktop';

interface Props {
  appBarProps?: AppBarProps;
}

const TopNav = ({ appBarProps }: Props) => {
  const { t } = useTranslation();
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
    alignSelf: 'center',
    width: 'calc(100% - 200px)',
    [theme.breakpoints.up('sm')]: {
      minHeight: 60,
    },
  };

  const toolbarStyles: SxProps = {
    display: 'flex',
    justifyContent: 'space-between',
    ...(isDesktop ? desktopToolbarStyles : {}),
  };

  const renderBrand = () => (
    // TODO: Add reload functionality
    // if (asPath === NavigationPaths.Home) {
    //   return (
    //     <LevelOneHeading onClick={() => reload()} sx={brandStyles}>
    //       {t('brand')}
    //     </LevelOneHeading>
    //   );
    // }

    <Link href={NavigationPaths.Home}>
      <LevelOneHeading sx={brandStyles}>{t('brand')}</LevelOneHeading>
    </Link>
  );

  return (
    <AppBar role="banner" position="fixed" sx={appBarStyles} {...appBarProps}>
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
  );
};

export default TopNav;
