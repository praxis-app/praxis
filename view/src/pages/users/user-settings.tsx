import { api } from '@/client/api-client';
import { TopNav } from '@/components/nav/top-nav';
import { NotificationSettingsForm } from '@/components/settings/notification-settings-form';
import { UserSettingsSection } from '@/components/settings/user-settings-section';
import { Container } from '@/components/ui/container';
import { UserProfileForm } from '@/components/users/user-profile-form';
import {
  NavigationPaths,
  UserSettingsSections,
} from '@/constants/shared.constants';
import { useMeQuery } from '@/hooks/use-me-query';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';
import { Navigate } from 'react-router-dom';

export const UserSettings = () => {
  const { t } = useTranslation();

  const { data: meData } = useMeQuery();
  const userId = meData?.user?.id || '';

  const { data: profileData } = useQuery({
    queryKey: ['users', userId, 'profile'],
    queryFn: () => api.getUserProfile(userId),
    enabled: !!userId,
  });

  const {
    data: userConfigData,
    isPending: isUserConfigPending,
    error: userConfigError,
  } = useQuery({
    queryKey: ['users', 'me', 'configs'],
    queryFn: () => api.getUserConfig(),
    enabled: !!userId,
  });

  if (!meData?.user) {
    return null;
  }

  if (meData.user.anonymous) {
    return <Navigate to={NavigationPaths.Explore} />;
  }

  // Placed only once content is known, so a link lands on the settled position
  if (!profileData?.user) {
    return null;
  }

  return (
    <>
      <TopNav
        header={t('settings.headers.userSettings')}
        backBtnIcon={<MdClose className="size-6" />}
        goBackOnEscape
      />

      <Container className="flex flex-col gap-8">
        <UserSettingsSection
          section={UserSettingsSections.Profile}
          title={t('navigation.labels.profile')}
          description={t('settings.descriptions.profileSection')}
          isFirst
        >
          <UserProfileForm userProfile={profileData.user} me={meData.user} />
        </UserSettingsSection>

        <UserSettingsSection
          section={UserSettingsSections.Notifications}
          title={t('navigation.labels.notifications')}
          description={t('settings.descriptions.notificationSection')}
        >
          {userConfigError && <p>{t('errors.somethingWentWrong')}</p>}
          {!userConfigError && !isUserConfigPending && (
            <NotificationSettingsForm userConfig={userConfigData.userConfig} />
          )}
        </UserSettingsSection>
      </Container>
    </>
  );
};
