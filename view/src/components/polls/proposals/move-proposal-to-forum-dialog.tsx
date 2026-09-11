import { api } from '@/client/api-client';
import {
  getActiveDecisionsQueryKey,
  updateActiveDecisionCache,
} from '@/components/decisions/decisions-panel.utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useServerData } from '@/hooks/use-server-data';
import { handleError } from '@/lib/error.utils';
import { replaceProposalWithForumReference } from '@/lib/feed.utils';
import { truncate } from '@/lib/text.utils';
import { type ChannelRes, type FeedQuery } from '@/types/channel.types';
import { type PollRes } from '@/types/poll.types';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as zod from 'zod';

const schema = zod.object({
  destinationChannelId: zod.string().min(1),
  title: zod.string().trim().min(1).max(100),
  body: zod.string().trim().min(1).max(6000),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poll: PollRes;
  sourceChannel: ChannelRes;
  feedQueryKey: QueryKey;
}

export const MoveProposalToForumDialog = ({
  open,
  onOpenChange,
  poll,
  sourceChannel,
  feedQueryKey,
}: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { serverId, serverPath } = useServerData();
  const fallbackBody = t('forums.prompts.movedProposalDiscussion');
  const form = useForm<zod.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      destinationChannelId: '',
      title: truncate(poll.body || t('forums.labels.untitledProposal'), 100),
      body: poll.body || fallbackBody,
    },
  });

  const { data: channelsData, isLoading: isLoadingChannels } = useQuery({
    queryKey: ['servers', serverId, 'channels', 'joined'],
    queryFn: () => {
      if (!serverId) throw new Error('Server ID is required');
      return api.getJoinedChannels(serverId);
    },
    enabled: open && !!serverId,
  });
  const forumChannels =
    channelsData?.channels.filter(
      (channel) => channel.channelType === 'forum',
    ) ?? [];

  const { mutate: moveProposal, isPending } = useMutation({
    mutationFn: (values: zod.infer<typeof schema>) => {
      if (!serverId) throw new Error('Server ID is required');
      return api.moveProposalToForum(
        serverId,
        sourceChannel.id,
        poll.id,
        values,
      );
    },
    onSuccess: ({ post, sourceReference }) => {
      queryClient.setQueryData<FeedQuery>(feedQueryKey, (oldData) =>
        replaceProposalWithForumReference(oldData, sourceReference),
      );
      void queryClient.invalidateQueries({
        queryKey: [
          'servers',
          serverId,
          'channels',
          sourceReference.destinationChannelId,
          'forum',
        ],
      });

      const destinationChannelName =
        sourceReference.destinationChannelName ||
        forumChannels.find(
          (channel) => channel.id === sourceReference.destinationChannelId,
        )?.name;

      if (destinationChannelName) {
        updateActiveDecisionCache(
          queryClient,
          serverId,
          poll.id,
          (decision) => ({
            ...decision,
            channelId: sourceReference.destinationChannelId,
            channelName: destinationChannelName,
            channelType: 'forum',
            forumPostId: sourceReference.forumPostId,
          }),
        );
      } else {
        void queryClient.invalidateQueries({
          queryKey: getActiveDecisionsQueryKey(serverId),
        });
      }

      onOpenChange(false);
      navigate(
        `${serverPath}/c/${sourceReference.destinationChannelId}/posts/${post.id}`,
      );
    },
    onError: handleError,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('proposals.actions.moveToForum')}</DialogTitle>
          <DialogDescription>
            {t('forums.prompts.moveProposal')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => moveProposal(values))}
          >
            <FormField
              control={form.control}
              name="destinationChannelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('forums.form.destinationChannel')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t('forums.form.destinationChannel')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {forumChannels.map((channel) => (
                        <SelectItem key={channel.id} value={channel.id}>
                          {channel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  {!isLoadingChannels && forumChannels.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      {t('forums.prompts.noForumChannels')}
                    </p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('forums.form.title')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('forums.form.body')}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={6} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('actions.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={
                  isPending || isLoadingChannels || forumChannels.length === 0
                }
              >
                {isPending
                  ? t('forums.actions.movingProposal')
                  : t('forums.actions.moveProposal')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
