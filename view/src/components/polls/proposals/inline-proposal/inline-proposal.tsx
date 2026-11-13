import {
  ProposalContent,
  type SourceCallContext,
} from '@/components/polls/proposals/inline-proposal/proposal-content';
import { Card } from '@/components/ui/card';
import { PollFeedItem } from '@/components/polls/poll-feed-item';
import { useModerationAccess } from '@/hooks/use-moderation-access';
import { type CallArtifactRes } from '@/types/call.types';
import { type ChannelRes } from '@/types/channel.types';
import { type PollRes } from '@/types/poll.types';
import { type CurrentUser } from '@/types/user.types';
import { type QueryKey } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

interface Props {
  poll: PollRes;
  channel: ChannelRes;
  feedQueryKey: QueryKey;
  me?: CurrentUser;
  onPollChange?: () => void;
  onViewCall?: (callId: string) => void;
  onJoinCall?: (callId: string) => void;
  sourceCall?: CallArtifactRes;
  sourceCallContext?: SourceCallContext;
  isJoiningSourceCall?: boolean;
  canMoveToForum?: boolean;
  onOpenThread?: () => void;
  onCopyThreadLink?: () => void;
  onImageLoad?: () => void;
}

export const InlineProposal = ({
  poll,
  channel,
  feedQueryKey,
  me,
  onPollChange,
  onViewCall,
  onJoinCall,
  sourceCall,
  sourceCallContext = 'in-call',
  isJoiningSourceCall = false,
  canMoveToForum = false,
  onOpenThread,
  onCopyThreadLink,
  onImageLoad,
}: Props) => {
  const { t } = useTranslation();
  const { canModerateProposals } = useModerationAccess();
  const { body, config } = poll;

  const modelLabel = {
    consent: t('proposals.labels.consentProposal'),
    consensus: t('proposals.labels.consensusProposal'),
    'majority-vote': t('proposals.labels.majorityProposal'),
  }[config.decisionMakingModel ?? 'consensus'];
  const label = body ? `${modelLabel}: ${body}` : modelLabel;

  return (
    <PollFeedItem
      poll={poll}
      me={me}
      onOpenThread={onOpenThread}
      canModerate={canModerateProposals}
      label={label}
    >
      <Card className="before:border-l-border @container relative max-w-full min-w-0 gap-3.5 rounded-md px-3 py-3.5 before:absolute before:top-0 before:bottom-0 before:left-0 before:mt-[-0.025rem] before:mb-[-0.025rem] before:w-3 before:rounded-l-md before:border-l-3">
        <ProposalContent
          poll={poll}
          channel={channel}
          feedQueryKey={feedQueryKey}
          me={me}
          onPollChange={onPollChange}
          onViewCall={onViewCall}
          onJoinCall={onJoinCall}
          sourceCall={sourceCall}
          sourceCallContext={sourceCallContext}
          isJoiningSourceCall={isJoiningSourceCall}
          canMoveToForum={canMoveToForum}
          onOpenThread={onOpenThread}
          onCopyThreadLink={onCopyThreadLink}
          onImageLoad={onImageLoad}
        />
      </Card>
    </PollFeedItem>
  );
};
