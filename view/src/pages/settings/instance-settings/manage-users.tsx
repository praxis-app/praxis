import { api } from '@/client/api-client';
import { ManagedInstanceUser } from '@/components/moderation/managed-instance-user';
import { TopNav } from '@/components/nav/top-nav';
import { PermissionDenied } from '@/components/shared/permission-denied';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { NavigationPaths } from '@/constants/shared.constants';
import { useAbility } from '@/hooks/use-ability';
import { useMeQuery } from '@/hooks/use-me-query';
import { getModerationAccess } from '@/lib/moderation.utils';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const ManageUsers = () => {
  const { instanceAbility, serverAbility, isLoading } = useAbility();
  const { data: meData } = useMeQuery();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { canSuspendUsers, canDeleteUsers } = getModerationAccess(
    serverAbility,
    instanceAbility,
  );
  const canManageUsers = canSuspendUsers || canDeleteUsers;

  const usersQuery = useInfiniteQuery({
    queryKey: ['instance', 'users'],
    queryFn: ({ pageParam }) => api.getInstanceUsers(pageParam ?? undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: canManageUsers,
  });

  const topNavProps = {
    header: t('navigation.labels.users'),
    subheader: t('navigation.subheaders.instanceSettings'),
    subheaderAboveHeader: true,
    onBackClick: () => navigate(NavigationPaths.Settings),
  };

  if (isLoading) {
    return null;
  }

  if (!canManageUsers) {
    return <PermissionDenied topNavProps={topNavProps} />;
  }

  const users = usersQuery.data?.pages.flatMap((page) => page.users) ?? [];

  return (
    <>
      <TopNav {...topNavProps} />
      <Container className="flex flex-col gap-4">
        {usersQuery.isSuccess && (
          <Card className="py-4">
            <CardContent className="flex flex-col gap-4 px-4">
              {users.map((user) => {
                const isMe = user.id === meData?.user.id;
                return (
                  <ManagedInstanceUser
                    key={user.id}
                    user={user}
                    canSuspend={canSuspendUsers && !isMe}
                    canDelete={canDeleteUsers && !isMe}
                  />
                );
              })}
              {!users.length && (
                <p className="text-muted-foreground text-sm">
                  {t('moderation.prompts.noUsers')}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {usersQuery.hasNextPage && (
          <Button
            variant="outline"
            className="self-center"
            disabled={usersQuery.isFetchingNextPage}
            onClick={() => void usersQuery.fetchNextPage()}
          >
            {t('moderation.actions.loadMore')}
          </Button>
        )}

        {usersQuery.isError && <p>{t('errors.somethingWentWrong')}</p>}
      </Container>
    </>
  );
};
