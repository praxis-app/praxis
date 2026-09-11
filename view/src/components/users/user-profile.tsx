import { type CurrentUser } from '@/types/user.types';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { MdEdit } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { api } from '../../client/api-client';
import { UserSettingsSections } from '../../constants/shared.constants';
import { getUserSettingsPath } from '../../lib/user-settings.utils';
import { cn } from '../../lib/shared.utils';
import { LazyLoadImage } from '../images/lazy-load-image';
import { Button } from '../ui/button';
import { UserAvatar } from './user-avatar';

interface Props {
  userId?: string;
  me?: CurrentUser;
  className?: string;
}

export const UserProfile = ({ userId, me, className }: Props) => {
  const { t } = useTranslation();

  const resolvedUserId = userId || me?.id || '';
  const isMe = me?.id === resolvedUserId;

  const { data: profileData } = useQuery({
    queryKey: ['users', resolvedUserId, 'profile'],
    queryFn: () => api.getUserProfile(resolvedUserId),
    enabled: !!resolvedUserId && !!me && !(me.anonymous && !isMe),
  });

  if (!me) {
    return (
      <div
        className={cn(
          'flex h-21 flex-col items-center gap-4 pt-8 md:min-w-lg',
          className,
        )}
      >
        <p>{t('users.prompts.logInToViewProfile')}</p>
      </div>
    );
  }

  if (me.anonymous && !isMe) {
    return (
      <div
        className={cn(
          'flex h-21 flex-col items-center gap-4 pt-8 md:min-w-lg',
          className,
        )}
      >
        <p>{t('users.prompts.registerToViewOtherProfiles')}</p>
      </div>
    );
  }

  if (!profileData) {
    return null;
  }

  const resolvedName = profileData.user.displayName || profileData.user.name;

  return (
    <div className={cn('flex flex-col gap-4 md:min-w-lg', className)}>
      {/* TODO: Check if the relative class here is actually needed for anything */}
      <div className="relative">
        {profileData.user.coverPhoto?.id ? (
          <LazyLoadImage
            imageId={profileData.user.coverPhoto?.id}
            userId={profileData.user.id}
            alt={t('users.form.coverPhoto')}
            className="h-32 w-full rounded-t-2xl object-cover md:rounded-t-lg"
            skipAnimation={true}
          />
        ) : (
          <div className="bg-muted flex h-32 w-full rounded-t-2xl md:rounded-t-lg" />
        )}
      </div>

      <div className="-mt-12 flex flex-col gap-3 px-3 pb-6">
        <UserAvatar
          name={profileData.user.name}
          userId={profileData.user.id}
          imageId={profileData.user.profilePicture?.id}
          className="border-background size-24 border-4"
          fallbackClassName="text-4xl"
        />

        <div className="flex flex-col gap-0.5 px-2">
          <h2 className="text-xl font-medium">{resolvedName}</h2>
          <p className="text-muted-foreground text-sm">
            @{profileData.user.name}
          </p>
        </div>

        {profileData.user.bio && (
          <p className="text-foreground px-2 text-sm whitespace-pre-wrap">
            {profileData.user.bio}
          </p>
        )}

        {isMe && !me.anonymous && (
          <Link
            to={getUserSettingsPath(UserSettingsSections.Profile)}
            className="mt-2 px-2"
          >
            <Button variant="outline" className="w-full gap-1.5">
              <MdEdit className="size-4" /> {t('users.actions.editProfile')}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
