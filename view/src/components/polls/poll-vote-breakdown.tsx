import { api } from '@/client/api-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserAvatar } from '@/components/users/user-avatar';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { useServerData } from '@/hooks/use-server-data';
import { useAuthStore } from '@/store/auth.store';
import { type PollRes } from '@/types/poll.types';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  poll: PollRes;
  channelId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PollVoteBreakdown = ({
  poll,
  channelId,
  open,
  onOpenChange,
}: Props) => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const { serverId } = useServerData();
  const { inviteToken } = useAuthStore();

  const { body, options, votes } = poll;
  const totalVotes = votes?.length ?? 0;

  const defaultTab = options?.[0]?.id ?? '';
  const [activeTab, setActiveTab] = useState(defaultTab);

  const { data: votersData } = useQuery({
    queryKey: [
      'poll-option-voters',
      serverId,
      channelId,
      poll.id,
      activeTab,
      inviteToken,
    ],
    queryFn: () => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      return api.getVotersByPollOption(serverId, channelId, poll.id, activeTab);
    },
    enabled: open && !!activeTab && !!serverId,
  });

  const voters = votersData?.voters ?? [];

  const content = (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
      <TabsList className="w-full">
        {options?.map((option) => (
          <TabsTrigger key={option.id} value={option.id}>
            {option.text}
          </TabsTrigger>
        ))}
      </TabsList>

      {options?.map((option) => (
        <TabsContent key={option.id} value={option.id} className="pt-2">
          <div className="text-muted-foreground mb-5 text-sm">
            <span className="font-medium">{option.text}</span>
            {' - '}
            {t('polls.labels.totalVotes', { count: option.voteCount })}
          </div>

          {voters.length > 0 ? (
            <div className="space-y-2">
              {voters.map((voter) => (
                <div key={voter.id} className="flex items-center gap-2">
                  <UserAvatar
                    name={voter.displayName || voter.name}
                    userId={voter.id}
                    imageId={voter.profilePicture?.id}
                  />
                  <span className="text-sm">
                    {voter.displayName || voter.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              {t('polls.labels.noVotesYet')}
            </p>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="md:w-xl">
          <DialogHeader>
            <DialogTitle>{body}</DialogTitle>
            <VisuallyHidden>
              <DialogDescription>
                {t('polls.headers.voteBreakdown')}
              </DialogDescription>
            </VisuallyHidden>
          </DialogHeader>

          <p className="text-muted-foreground text-sm">
            {t('polls.labels.totalVotes', { count: totalVotes })}
          </p>

          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="min-h-[calc(100%-4.2rem)] px-4 pb-6">
        <DrawerHeader className="pt-5 pb-2">
          <DrawerTitle>{body}</DrawerTitle>
          <VisuallyHidden>
            <DialogDescription>
              {t('polls.headers.voteBreakdown')}
            </DialogDescription>
          </VisuallyHidden>
        </DrawerHeader>

        <p className="text-muted-foreground pt-1 pb-5 text-center text-sm">
          {t('polls.labels.totalVotes', { count: totalVotes })}
        </p>
        {content}
      </DrawerContent>
    </Drawer>
  );
};
