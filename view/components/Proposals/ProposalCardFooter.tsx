// TODO: Add basic functionality for sharing - below is a WIP

import { useReactiveVar } from '@apollo/client';
import { Comment, Reply } from '@mui/icons-material';
import { Box, CardActions, Divider, SxProps, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isLoggedInVar, isVerifiedVar, toastVar } from '../../graphql/cache';
import { ProposalCardFragment } from '../../graphql/proposals/fragments/gen/ProposalCard.gen';
import { useSyncProposalMutation } from '../../graphql/proposals/mutations/gen/SyncProposal.gen';
import { useProposalCommentsLazyQuery } from '../../graphql/proposals/queries/gen/ProposalComments.gen';
import { useIsProposalRatifiedSubscription } from '../../graphql/proposals/subscriptions/gen/IsProposalRatified.gen';
import { useInView } from '../../hooks/shared.hooks';
import CommentForm from '../Comments/CommentForm';
import CommentsList from '../Comments/CommentList';
import SharePostModal from '../Posts/SharePostModal';
import CardFooterButton from '../Shared/CardFooterButton';
import Flex from '../Shared/Flex';
import VoteBadges from '../Votes/VoteBadges';
import VoteButton from '../Votes/VoteButton';
import ProposalModal from './ProposalModal';
import ProposalSharesModal from './ProposalSharesModal';

const ICON_STYLES: SxProps = {
  marginRight: '0.4ch',
};

const ROTATED_ICON_STYLES = {
  transform: 'rotateY(180deg)',
  ...ICON_STYLES,
};

interface Props {
  currentUserId?: number;
  proposal: ProposalCardFragment;
  inModal?: boolean;
  groupId?: number;
  isProposalPage: boolean;
}

const ProposalCardFooter = ({
  proposal,
  currentUserId,
  inModal,
  isProposalPage,
  groupId,
}: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [showComments, setShowComments] = useState(inModal || isProposalPage);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isProposalSharesModalOpen, setIsProposalSharesModalOpen] =
    useState(false);

  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const isVerified = useReactiveVar(isVerifiedVar);

  const [getProposalComments, { data: proposalCommentsData }] =
    useProposalCommentsLazyQuery();

  const [syncProposal, { called: syncProposalCalled }] =
    useSyncProposalMutation();

  const ref = useRef<HTMLDivElement>(null);
  const { viewed } = useInView(ref, '100px');
  const { data: isProposalRatifiedData } = useIsProposalRatifiedSubscription({
    skip: !isVerified || !viewed || proposal.stage === 'Ratified',
    variables: { proposalId: proposal.id },

    onData: ({ data: { data }, client: { cache } }) => {
      if (data?.isProposalRatified) {
        cache.modify({
          id: cache.identify(proposal),
          fields: { stage: () => 'Ratified' },
        });
      }
    },
  });

  const { t } = useTranslation();

  useEffect(() => {
    const hasVotingTimeLimit = !!proposal.settings.closingAt;
    const isVotingStage = proposal.stage === 'Voting';

    if (
      !viewed ||
      !isVerified ||
      !isVotingStage ||
      !hasVotingTimeLimit ||
      syncProposalCalled
    ) {
      return;
    }

    if (Date.now() >= Number(proposal.settings.closingAt)) {
      syncProposal({
        variables: {
          proposalId: proposal.id,
          isVerified,
          isLoggedIn,
        },
      });
    }
  }, [
    isLoggedIn,
    isVerified,
    proposal,
    syncProposal,
    syncProposalCalled,
    viewed,
  ]);

  useEffect(() => {
    if (inModal || isProposalPage) {
      getProposalComments({
        variables: {
          id: proposal.id,
          isLoggedIn,
        },
      });
    }
  }, [
    getProposalComments,
    groupId,
    inModal,
    isLoggedIn,
    isProposalPage,
    proposal,
  ]);

  const {
    group,
    myVote,
    settings,
    shareCount,
    commentCount,
    voteCount,
    stage,
  } = proposal;

  const me = proposalCommentsData?.me;
  const comments = proposalCommentsData?.proposal?.comments;
  const isVoteBtnDisabled = (!!group && !group.isJoinedByMe) || !currentUserId;
  const isClosed = stage === 'Closed';

  const isRatified =
    isProposalRatifiedData?.isProposalRatified || stage === 'Ratified';

  const canManageComments = !!(
    group?.myPermissions?.manageComments || me?.serverPermissions.manageComments
  );

  const handleVoteBtnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!isLoggedIn) {
      toastVar({
        status: 'info',
        title: t('proposals.prompts.loginToVote'),
      });
      return;
    }
    if (!isVerified) {
      toastVar({
        status: 'info',
        title: t('proposals.prompts.verifiedOnlyVote'),
      });
      return;
    }
    if (isVoteBtnDisabled) {
      toastVar({
        status: 'info',
        title: t('proposals.prompts.joinGroupToVote'),
      });
      return;
    }
    if (isRatified) {
      toastVar({
        status: 'info',
        title: t('proposals.toasts.noVotingAfterRatification'),
      });
      return;
    }
    if (isClosed) {
      toastVar({
        status: 'info',
        title: t('proposals.toasts.noVotingAfterClose'),
      });
      return;
    }
    setMenuAnchorEl(event.currentTarget);
  };

  const handleCommentBtnClick = async () => {
    if (inModal || isProposalPage) {
      return;
    }
    const { data } = await getProposalComments({
      variables: { id: proposal.id, isLoggedIn },
    });
    const comments = data?.proposal.comments;
    if (comments && comments.length > 1) {
      setIsModalOpen(true);
    } else {
      setShowComments(true);
    }
  };

  const handleShareBtnClick = () => {
    if (!isVerified) {
      toastVar({
        title: t('posts.prompts.verifyToShare'),
        status: 'info',
      });
      return;
    }
    setIsShareModalOpen(true);
  };

  const handleViewSharesBtnClick = () => {
    if (!isVerified) {
      toastVar({
        title: t('posts.prompts.verifyToViewShares'),
        status: 'info',
      });
      return;
    }
    setIsProposalSharesModalOpen(true);
  };

  return (
    <Box ref={ref}>
      <Flex
        justifyContent={voteCount ? 'space-between' : 'end'}
        paddingBottom={voteCount || commentCount || shareCount ? 0.8 : 0}
        paddingX={inModal ? 0 : '16px'}
      >
        {!!voteCount && <VoteBadges proposal={proposal} />}

        {!!(commentCount + shareCount) && (
          <Flex sx={{ transform: 'translateY(3px)', cursor: 'pointer' }}>
            {!!commentCount && (
              <Typography
                color="text.secondary"
                onClick={handleCommentBtnClick}
                marginRight={shareCount ? 1.5 : 0}
                sx={{ '&:hover': { textDecoration: 'underline' } }}
              >
                {t('comments.labels.xComments', { count: commentCount })}
              </Typography>
            )}

            {!!shareCount && (
              <Typography
                color="text.secondary"
                sx={{ '&:hover': { textDecoration: 'underline' } }}
                onClick={handleViewSharesBtnClick}
              >
                {t('posts.labels.xShares', { count: shareCount })}
              </Typography>
            )}
          </Flex>
        )}
      </Flex>

      <Divider sx={{ margin: inModal ? 0 : '0 16px' }} />

      <CardActions sx={{ justifyContent: 'space-around' }}>
        <VoteButton
          isClosed={isClosed}
          isRatified={isRatified}
          menuAnchorEl={menuAnchorEl}
          myVoteId={myVote?.id}
          myVoteType={myVote?.voteType}
          onClick={handleVoteBtnClick}
          proposalId={proposal.id}
          setMenuAnchorEl={setMenuAnchorEl}
          decisionMakingModel={settings.decisionMakingModel}
        />

        <CardFooterButton onClick={handleCommentBtnClick}>
          <Comment sx={ROTATED_ICON_STYLES} />
          {t('actions.comment')}
        </CardFooterButton>

        <CardFooterButton onClick={handleShareBtnClick}>
          <Reply sx={ROTATED_ICON_STYLES} />
          {t('actions.share')}
        </CardFooterButton>
      </CardActions>

      {showComments && (
        <Box paddingX={inModal ? 0 : '16px'}>
          <Divider sx={{ marginBottom: 2 }} />
          <CommentsList
            canManageComments={canManageComments}
            comments={comments || []}
            currentUserId={me?.id}
            marginBottom={inModal && !isVerified ? 2.5 : undefined}
            proposalId={proposal.id}
          />
          {!inModal && (!group || group.isJoinedByMe) && (
            <CommentForm proposalId={proposal.id} enableAutoFocus />
          )}
          {group && !group.isJoinedByMe && !comments?.length && isVerified && (
            <Typography
              color="text.secondary"
              align="center"
              marginBottom={1.75}
            >
              {t('comments.prompts.joinToComment')}
            </Typography>
          )}
          {!isVerified && !comments?.length && (
            <Typography
              color="text.secondary"
              align="center"
              marginBottom={1.75}
            >
              {t('proposals.prompts.verifyToComment')}
            </Typography>
          )}
        </Box>
      )}

      <ProposalModal
        proposal={proposal}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {!!currentUserId && (
        <SharePostModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          sharedFromUserId={proposal.user.id}
          sharedProposalId={proposal.id}
          currentUserId={currentUserId}
        />
      )}

      <ProposalSharesModal
        proposalId={proposal.id}
        isOpen={isProposalSharesModalOpen}
        onClose={() => setIsProposalSharesModalOpen(false)}
        isVerified={isVerified}
      />
    </Box>
  );
};

export default ProposalCardFooter;
