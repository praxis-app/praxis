import { api } from '@/client/api-client';
import { CreateProposalForm } from '@/components/polls/proposals/create-proposal-form/create-proposal-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useServerData } from '@/hooks/use-server-data';
import { handleError } from '@/lib/error.utils';
import { type ChannelRes } from '@/types/channel.types';
import { type ForumPostRes } from '@/types/forum.types';
import { type CreatePollReq } from '@/types/poll.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuListTodo } from 'react-icons/lu';
import {
  MdLockOpen,
  MdLockOutline,
  MdMoreHoriz,
  MdSettings,
} from 'react-icons/md';

interface Props {
  channel: ChannelRes;
  post: ForumPostRes;
  isAuthor: boolean;
  onViewProposalSettings: () => void;
}

export const ForumPostMenu = ({
  channel,
  post,
  isAuthor,
  onViewProposalSettings,
}: Props) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const { serverId } = useServerData();

  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const showClosePostButton =
    isAuthor && post.status === 'open' && post.proposal?.stage !== 'voting';

  const showCreateProposalButton =
    isAuthor && post.status === 'open' && !post.proposal;

  const invalidateForum = () =>
    queryClient.invalidateQueries({
      queryKey: ['servers', serverId, 'channels', channel.id, 'forum'],
    });

  const { mutate: updatePostStatus, isPending: isUpdatingStatus } = useMutation(
    {
      mutationFn: () => {
        if (!serverId) throw new Error('Server ID is required');
        return post.status === 'open'
          ? api.closeForumPost(serverId, channel.id, post.id)
          : api.reopenForumPost(serverId, channel.id, post.id);
      },
      onSuccess: () => void invalidateForum(),
      onError: handleError,
    },
  );

  const createProposal = async (
    request: CreatePollReq,
    images: File[],
    eventCoverPhoto?: File,
  ) => {
    if (!serverId) throw new Error('Server ID is required');
    if (post.status === 'closed') {
      throw new Error(t('forums.prompts.closedPost'));
    }
    const { post: updatedPost } = await api.createForumPostProposal(
      serverId,
      channel.id,
      post.id,
      request,
      images,
      eventCoverPhoto,
    );
    if (!updatedPost.proposal) {
      throw new Error('Created forum proposal is missing');
    }
    void invalidateForum();
    return { poll: updatedPost.proposal };
  };

  return (
    <>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-gray-500 dark:text-gray-400"
            aria-label={t('forums.actions.openPostMenu')}
            onPointerDown={(event) => event.preventDefault()}
            onPointerUp={() => setIsMenuOpen((open) => !open)}
          >
            <MdMoreHoriz className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {post.proposal && (
            <DropdownMenuItem onSelect={onViewProposalSettings}>
              <MdSettings />
              {t('forums.actions.viewProposalSettings')}
            </DropdownMenuItem>
          )}
          {showCreateProposalButton && (
            <DropdownMenuItem onSelect={() => setIsCreateOpen(true)}>
              <LuListTodo />
              {t('forums.actions.createProposalFromDiscussion')}
            </DropdownMenuItem>
          )}
          {showClosePostButton && (
            <DropdownMenuItem
              disabled={isUpdatingStatus}
              onSelect={() => updatePostStatus()}
            >
              <MdLockOutline />
              {t('forums.actions.closePost')}
            </DropdownMenuItem>
          )}
          {isAuthor && post.status === 'closed' && (
            <DropdownMenuItem
              disabled={isUpdatingStatus}
              onSelect={() => updatePostStatus()}
            >
              <MdLockOpen />
              {t('forums.actions.reopenPost')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={post.status === 'open' && isCreateOpen}
        onOpenChange={setIsCreateOpen}
      >
        <DialogContent
          ref={dialogRef}
          className="max-h-[90vh] overflow-y-auto md:w-xl"
        >
          <DialogHeader>
            <DialogTitle>
              {t('forums.actions.createProposalFromDiscussion')}
            </DialogTitle>
            <DialogDescription>
              {t('proposals.descriptions.create')}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <CreateProposalForm
            channelId={channel.id}
            createProposal={createProposal}
            onSuccess={() => setIsCreateOpen(false)}
            onNavigate={() => dialogRef.current?.scrollTo({ top: 0 })}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
