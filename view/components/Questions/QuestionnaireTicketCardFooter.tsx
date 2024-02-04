import { useReactiveVar } from '@apollo/client';
import { Comment, HowToVote } from '@mui/icons-material';
import { Box, CardActions, Divider, SxProps, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isLoggedInVar } from '../../graphql/cache';
import { useProposalCommentsLazyQuery } from '../../graphql/proposals/queries/gen/ProposalComments.gen';
import { QuestionnaireTicketCardFragment } from '../../graphql/questions/fragments/gen/QuestionnaireTicketCard.gen';
import { Blurple } from '../../styles/theme';
import CommentForm from '../Comments/CommentForm';
import CommentsList from '../Comments/CommentList';
import CardFooterButton from '../Shared/CardFooterButton';
import Flex from '../Shared/Flex';
import VoteBadges from '../Votes/VoteBadges';
import VoteMenu from '../Votes/VoteMenu';

const ICON_STYLES: SxProps = {
  marginRight: '0.4ch',
};

const ROTATED_ICON_STYLES = {
  transform: 'rotateY(180deg)',
  ...ICON_STYLES,
};

interface Props {
  questionnaireTicket: QuestionnaireTicketCardFragment;
  inModal?: boolean;
}

const QuestionnaireTicketCardFooter = ({
  questionnaireTicket,
  inModal,
}: Props) => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [, setIsModalOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [showComments, setShowComments] = useState(inModal);

  const [getProposalComments, { data: proposalCommentsData }] =
    useProposalCommentsLazyQuery();

  const { t } = useTranslation();

  useEffect(() => {
    if (inModal) {
      getProposalComments({
        variables: {
          id: questionnaireTicket.id,
          isLoggedIn,
        },
      });
    }
  }, [getProposalComments, inModal, isLoggedIn, questionnaireTicket]);

  const me = proposalCommentsData?.me;
  const comments = proposalCommentsData?.proposal?.comments;
  const { id, myVote, voteCount, commentCount, settings } = questionnaireTicket;

  const commentCountStyles: SxProps = {
    '&:hover': { textDecoration: 'underline' },
    transform: 'translateY(3px)',
    cursor: 'pointer',
    height: '24px',
  };

  const getVoteButtonLabel = () => {
    return t('proposals.actions.vote');
  };

  const handleVoteButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleVoteMenuClose = () => setMenuAnchorEl(null);

  const handleCommentButtonClick = async () => {
    if (inModal) {
      return;
    }
    const { data } = await getProposalComments({
      variables: { id, isLoggedIn },
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
        {!!voteCount && (
          <VoteBadges questionnaireTicket={questionnaireTicket} />
        )}

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
          sx={myVote ? { color: Blurple.SavoryBlue } : {}}
        >
          <HowToVote sx={ICON_STYLES} />
          {getVoteButtonLabel()}
        </CardFooterButton>

        <CardFooterButton onClick={handleCommentButtonClick}>
          <Comment sx={ROTATED_ICON_STYLES} />
          {t('actions.comment')}
        </CardFooterButton>
      </CardActions>

      {showComments && (
        <Box paddingX={inModal ? 0 : '16px'}>
          <Divider sx={{ marginBottom: 2 }} />
          <CommentsList
            comments={comments || []}
            currentUserId={me?.id}
            marginBottom={inModal && !isLoggedIn ? 2.5 : undefined}
            // TODO: Ensure questionnaire ID is passed to CommentList
            proposalId={id}
          />
          {!inModal && (
            // TODO: Ensure questionnaire ID is passed to CommentForm
            <CommentForm proposalId={id} enableAutoFocus />
          )}
        </Box>
      )}

      {/* <ProposalModal
        proposal={proposal}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      /> */}

      <VoteMenu
        anchorEl={menuAnchorEl}
        onClose={handleVoteMenuClose}
        decisionMakingModel={settings.decisionMakingModel}
        myVoteId={myVote?.id}
        myVoteType={myVote?.voteType}
        questionnaireTicketId={questionnaireTicket.id}
      />
    </>
  );
};

export default QuestionnaireTicketCardFooter;
