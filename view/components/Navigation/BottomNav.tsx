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
  Paper,
  SxProps,
  Typography,
} from '@mui/material';
import { produce } from 'immer';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavigationPaths } from '../../constants/shared.constants';
import { isLoggedInVar, isNavDrawerOpenVar } from '../../graphql/cache';
import {
  NotificationsDocument,
  NotificationsQuery,
} from '../../graphql/notifications/queries/gen/Notifications.gen';
import {
  UnreadNotificationsDocument,
  UnreadNotificationsQuery,
  useUnreadNotificationsQuery,
} from '../../graphql/notifications/queries/gen/UnreadNotifications.gen';
import { useNotifiedSubscription } from '../../graphql/notifications/subscriptions/gen/Notified.gen';
import { Blurple } from '../../styles/theme';
import { scrollTop } from '../../utils/shared.utils';
import Flex from '../Shared/Flex';

const PAPER_STYLES: SxProps = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 5,
};

const BottomNav = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const isNavDrawerOpen = useReactiveVar(isNavDrawerOpenVar);
  const [value, setValue] = useState(0);

  const { data: unreadNotificationsData } = useUnreadNotificationsQuery();

  useNotifiedSubscription({
    onData({ data: { data }, client: { cache } }) {
      if (!data?.notification) {
        return;
      }
      cache.updateQuery<NotificationsQuery>(
        {
          query: NotificationsDocument,
          variables: { limit: 10, offset: 0 },
        },
        (notificationsData) =>
          produce(notificationsData, (draft) => {
            if (!draft) {
              return;
            }
            draft.notifications.unshift(data.notification);
            draft.notificationsCount += 1;
          }),
      );
      cache.updateQuery<UnreadNotificationsQuery>(
        { query: UnreadNotificationsDocument },
        (notificationsData) =>
          produce(notificationsData, (draft) => {
            if (!draft) {
              return;
            }
            draft.unreadNotificationsCount += 1;
          }),
      );
    },
  });

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
                {!!unreadNotificationsData?.unreadNotificationsCount && (
                  <Flex
                    bgcolor={Blurple.Marina}
                    height="18px"
                    width="18px"
                    position="absolute"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="9999px"
                    bottom="13px"
                    left="10px"
                  >
                    <Typography fontSize="12px" color="primary">
                      {unreadNotificationsData?.unreadNotificationsCount}
                    </Typography>
                  </Flex>
                )}
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
    </Paper>
  );
};

export default BottomNav;
