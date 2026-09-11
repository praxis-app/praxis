import { api } from '@/client/api-client';
import { DecisionPanelItem } from '@/components/decisions/decision-panel-item';
import { getActiveDecisionsQueryKey } from '@/components/decisions/decisions-panel.utils';
import { Button } from '@/components/ui/button';
import { PubSubMessageType } from '@/constants/pub-sub.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useServerData } from '@/hooks/use-server-data';
import { useSubscriptions } from '@/hooks/use-subscription';
import { channelPubSubTopic } from '@/lib/pub-sub.utils';
import { useAuthStore } from '@/store/auth.store';
import { type PubSubMessage } from '@/types/shared.types';
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LuListTodo } from 'react-icons/lu';
import { MdClose, MdErrorOutline } from 'react-icons/md';

const DECISIONS_PAGE_SIZE = 10;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DecisionsPanel = ({ isOpen, onClose }: Props) => {
  const { inviteToken } = useAuthStore();
  const { isAuthError, isMeSuccess, isRegistered, me } = useAuthData();
  const { serverId, serverPath } = useServerData();

  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: joinedChannelsData } = useQuery({
    queryKey: ['servers', serverId, 'channels', 'joined'],
    queryFn: async () => {
      if (!serverId) {
        throw new Error('Current server not found');
      }
      return api.getJoinedChannels(serverId);
    },
    enabled: !!serverId && isMeSuccess && isRegistered,
  });

  const { data: publicChannelsData } = useQuery({
    queryKey: ['servers', serverId, 'channels', inviteToken],
    queryFn: async () => {
      if (!serverId) {
        throw new Error('Current server not found');
      }
      return api.getChannels(serverId);
    },
    enabled: !!serverId && (isAuthError || (isMeSuccess && !isRegistered)),
  });

  const channels = joinedChannelsData?.channels || publicChannelsData?.channels;
  const decisionTopics = useMemo(() => {
    if (!me || !serverId) {
      return [];
    }
    return (channels || []).map((channel) =>
      channelPubSubTopic('new-poll', serverId, channel.id, me.id),
    );
  }, [channels, me, serverId]);

  useSubscriptions(decisionTopics, {
    enabled: decisionTopics.length > 0,
    onMessage: (event) => {
      const {
        body,
      }: PubSubMessage<{
        type: PubSubMessageType;
      }> = JSON.parse(event.data);
      if (!body) {
        return;
      }
      void queryClient.invalidateQueries({
        queryKey: getActiveDecisionsQueryKey(serverId),
      });
    },
  });

  const decisionsQuery = useInfiniteQuery({
    queryKey: [
      ...getActiveDecisionsQueryKey(serverId),
      ...(inviteToken ? ['invite', inviteToken] : []),
    ],
    queryFn: async ({ pageParam }) => {
      if (!serverId) {
        throw new Error('Current server not found');
      }
      return api.getActiveDecisions(serverId, pageParam, DECISIONS_PAGE_SIZE);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: isOpen && !!serverId && (isAuthError || isMeSuccess),
  });

  const decisions = Array.from(
    new Map(
      decisionsQuery.data?.pages
        .flatMap((page) => page.decisions)
        .map((decision) => [decision.id, decision]),
    ).values(),
  );

  const listBottomRef = useInfiniteScroll({
    hasNextPage: !!decisionsQuery.hasNextPage,
    isLoadingMore: decisionsQuery.isFetchingNextPage,
    onLoadMore: () => {
      void decisionsQuery.fetchNextPage();
    },
  });

  return (
    <>
      {isOpen && (
        <aside
          id="active-decisions-panel"
          aria-label={t('decisions.headers.active')}
          className="bg-background flex h-full min-w-0 flex-1 flex-col"
        >
          <div className="flex h-13.75 shrink-0 items-center justify-between border-b px-4">
            <h2 className="font-semibold">{t('decisions.headers.active')}</h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('decisions.actions.closePanel')}
              onClick={onClose}
            >
              <MdClose className="size-5" />
            </Button>
          </div>

          <div
            data-testid="active-decisions-list"
            className="flex-1 overflow-y-auto p-3"
          >
            {decisionsQuery.isLoading && (
              <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                {t('decisions.prompts.loading')}
              </div>
            )}

            {decisionsQuery.isError && (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
                <MdErrorOutline className="text-muted-foreground size-8" />
                <div>
                  <p className="font-medium">
                    {t('decisions.errors.loadTitle')}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {t('decisions.errors.loadDescription')}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void decisionsQuery.refetch()}
                >
                  {t('actions.refresh')}
                </Button>
              </div>
            )}

            {decisionsQuery.isSuccess && decisions.length === 0 && (
              <div className="flex h-full -translate-y-10 flex-col items-center justify-center px-4 text-center">
                <LuListTodo className="text-muted-foreground size-8" />
                <p className="mt-3 font-medium">
                  {t('decisions.prompts.emptyTitle')}
                </p>
                <p className="text-muted-foreground mt-1 max-w-60 text-sm leading-5 text-pretty">
                  {t('decisions.prompts.emptyDescription')}
                </p>
              </div>
            )}

            {decisionsQuery.isSuccess && decisions.length > 0 && (
              <div className="space-y-2">
                {decisions.map((decision) => (
                  <DecisionPanelItem
                    key={decision.id}
                    decision={decision}
                    serverPath={serverPath}
                  />
                ))}
                {decisionsQuery.isFetchingNextPage && (
                  <p className="text-muted-foreground py-2 text-center text-xs">
                    {t('decisions.prompts.loadingMore')}
                  </p>
                )}
                <div ref={listBottomRef} className="h-px" aria-hidden="true" />
              </div>
            )}
          </div>
        </aside>
      )}
    </>
  );
};
