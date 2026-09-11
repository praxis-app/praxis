import { api } from '@/client/api-client';
import { CreateProposalForm } from '@/components/polls/proposals/create-proposal-form/create-proposal-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useServerData } from '@/hooks/use-server-data';
import { handleError } from '@/lib/error.utils';
import { type ChannelRes } from '@/types/channel.types';
import { type ForumPostRes } from '@/types/forum.types';
import { type CreatePollReq } from '@/types/poll.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as zod from 'zod';

const schema = zod.object({
  title: zod.string().trim().min(1).max(100),
  body: zod.string().trim().min(1).max(6000),
});

interface Props {
  channel: ChannelRes;
  onSuccess: () => void;
}

export const ForumPostForm = ({ channel, onSuccess }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { serverId, serverPath } = useServerData();
  const [isAddingProposal, setIsAddingProposal] = useState(false);
  const form = useForm<zod.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', body: '' },
  });

  const completeCreation = (post: ForumPostRes) => {
    void queryClient.invalidateQueries({
      queryKey: ['servers', serverId, 'channels', channel.id, 'forum'],
    });
    onSuccess();
    navigate(`${serverPath}/c/${channel.id}/posts/${post.id}`);
  };

  const { mutate: createPost, isPending } = useMutation({
    mutationFn: (values: zod.infer<typeof schema>) => {
      if (!serverId) throw new Error('Server ID is required');
      return api.createForumPost(serverId, channel.id, values);
    },
    onSuccess: ({ post }) => completeCreation(post),
    onError: handleError,
  });

  const startProposal = async () => {
    if (await form.trigger()) {
      setIsAddingProposal(true);
    }
  };

  const createPostWithProposal = async (
    proposal: CreatePollReq,
    images: File[],
    eventCoverPhoto?: File,
  ) => {
    if (!serverId) throw new Error('Server ID is required');
    const values = form.getValues();
    const request = { ...values, proposal };
    const { post } = await api.createForumPost(
      serverId,
      channel.id,
      request,
      images,
      eventCoverPhoto,
    );
    if (!post.proposal) {
      throw new Error('Created forum proposal is missing');
    }
    completeCreation(post);
    return { poll: post.proposal };
  };

  return (
    <div className="space-y-4">
      {!isAddingProposal && (
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => createPost(values))}
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('forums.form.title')}</FormLabel>
                  <FormControl>
                    <Input {...field} autoFocus />
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
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? t('forums.actions.creatingPost')
                  : t('forums.actions.createDiscussion')}
              </Button>
              <Button type="button" variant="outline" onClick={startProposal}>
                {t('forums.actions.createWithProposal')}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {isAddingProposal && (
        <>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-medium">{t('forums.labels.proposal')}</h2>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAddingProposal(false)}
            >
              {t('forums.actions.back')}
            </Button>
          </div>
          <Separator />
          <CreateProposalForm
            channelId={channel.id}
            createProposal={createPostWithProposal}
            onSuccess={() => undefined}
            onNavigate={() => undefined}
          />
        </>
      )}
    </div>
  );
};
