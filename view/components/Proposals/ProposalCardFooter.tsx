// TODO: Add basic functionality for sharing - below is a WIP

import { useReactiveVar } from '@apollo/client';
import { Comment, HowToVote, Reply } from '@mui/icons-material';
import { Box, CardActions, Divider, SxProps, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isLoggedInVar, toastVar } from '../../apollo/cache';
import { ProposalCardFragment } from '../../apollo/proposals/generated/ProposalCard.fragment';
import { useProposalCommentsLazyQuery } from '../../apollo/proposals/generated/ProposalComments.query';
import { ProposalStage } from '../../constants/proposal.constants';
import { Blurple } from '../../styles/theme';
import { inDevToast } from '../../utils/shared.utils';
import CommentForm from '../Comments/CommentForm';
import CommentsList from '../Comments/CommentList';
import CardFooterButton from '../Shared/CardFooterButton';
import Flex from '../Shared/Flex';
import VoteBadges from '../Votes/VoteBadges';
import VoteMenu from '../Votes/VoteMenu';
import ProposalModal from './ProposalModal';

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
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [showComments, setShowComments] = useState(inModal || isProposalPage);

  const [getProposalComments, { data }] = useProposalCommentsLazyQuery();

  const { t } = useTranslation();

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

  const me = data?.me;
  const comments = data?.proposal?.comments;
  const { stage, voteCount, votes, commentCount, group } = proposal;
  const isDisabled = !!group && !group.isJoinedByMe;
  const isRatified = stage === ProposalStage.Ratified;

  const canManageComments = !!(
    group?.myPermissions?.manageComments || me?.serverPermissions.manageComments
  );
  const voteByCurrentUser = votes.find(
    (vote) => vote.user.id === currentUserId,
  );

  const voteButtonLabel = isRatified
    ? t('proposals.labels.ratified')
    : t('proposals.actions.vote');

  const commentCountStyles: SxProps = {
    '&:hover': { textDecoration: 'underline' },
    transform: 'translateY(3px)',
    cursor: 'pointer',
    height: '24px',
  };

  const handleVoteButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (!isLoggedIn) {
      toastVar({
        status: 'info',
        title: t('proposals.prompts.loginToVote'),
      });
      return;
    }
    if (isDisabled) {
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
    setMenuAnchorEl(event.currentTarget);
  };

  const handleVoteMenuClose = () => setMenuAnchorEl(null);

  const handleCommentButtonClick = async () => {
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

  return (
    <>
      <Flex
        justifyContent={voteCount ? 'space-between' : 'end'}
        paddingBottom={voteCount || commentCount ? 0.8 : 0}
        paddingX={inModal ? 0 : '16px'}
      >
        {!!voteCount && <VoteBadges proposal={proposal} />}

        {!!commentCount && (
          <Typography
            color="text.secondary"
            onClick={handleCommentButtonClick}
            sx={commentCountStyles}
          >
            {t('comments.labels.xComments', { count: commentCount })}
          </Typography>
        )}
      </Flex>

      <Divider sx={{ margin: inModal ? 0 : '0 16px' }} />

      <CardActions sx={{ justifyContent: 'space-around' }}>
        <CardFooterButton
          onClick={handleVoteButtonClick}
          sx={voteByCurrentUser ? { color: Blurple.Marina } : {}}
        >
          <HowToVote sx={ICON_STYLES} />
          {voteButtonLabel}
        </CardFooterButton>

        <CardFooterButton onClick={handleCommentButtonClick}>
          <Comment sx={ROTATED_ICON_STYLES} />
          {t('actions.comment')}
        </CardFooterButton>

        <CardFooterButton onClick={inDevToast}>
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
            marginBottom={inModal && !isLoggedIn ? 2.5 : undefined}
            proposalId={proposal.id}
          />
          {!inModal && (!group || group.isJoinedByMe) && (
            <CommentForm proposalId={proposal.id} enableAutoFocus />
          )}
          {group && !group.isJoinedByMe && !comments?.length && (
            <Typography
              color="text.secondary"
              align="center"
              marginBottom={1.75}
            >
              {t('comments.prompts.joinToComment')}
            </Typography>
          )}
        </Box>
      )}

      <ProposalModal
        proposal={proposal}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {currentUserId && (
        <VoteMenu
          anchorEl={menuAnchorEl}
          currentUserId={currentUserId}
          onClose={handleVoteMenuClose}
          proposal={proposal}
        />
      )}
    </>
  );
};

export default ProposalCardFooter;
