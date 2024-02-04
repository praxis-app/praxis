import { useReactiveVar } from '@apollo/client';
import { Comment, HowToVote } from '@mui/icons-material';
import { Box, CardActions, Divider, SxProps, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isLoggedInVar } from '../../graphql/cache';
import { QuestionnaireTicketCardFragment } from '../../graphql/questions/fragments/gen/QuestionnaireTicketCard.gen';
import { useQuestionnaireTicketCommentsLazyQuery } from '../../graphql/questions/queries/gen/QuestionnaireTicketComments.gen';
import { Blurple } from '../../styles/theme';
import CommentForm from '../Comments/CommentForm';
import CommentsList from '../Comments/CommentList';
import CardFooterButton from '../Shared/CardFooterButton';
import Flex from '../Shared/Flex';
import VoteBadges from '../Votes/VoteBadges';
import VoteMenu from '../Votes/VoteMenu';
import QuestionnaireTicketModal from './QuestionnaireTicketModal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [showComments, setShowComments] = useState(inModal);

  const [getQuestionnaireTicketComments, { data: commentsData }] =
    useQuestionnaireTicketCommentsLazyQuery();

  const { t } = useTranslation();

  useEffect(() => {
    if (inModal) {
      getQuestionnaireTicketComments({
        variables: {
          id: questionnaireTicket.id,
          isLoggedIn,
        },
      });
    }
  }, [
    getQuestionnaireTicketComments,
    inModal,
    isLoggedIn,
    questionnaireTicket,
  ]);

  const me = commentsData?.me;
  const comments = commentsData?.questionnaireTicket?.comments;
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
    const { data } = await getQuestionnaireTicketComments({
      variables: { id, isLoggedIn },
    });
    const comments = data?.questionnaireTicket.comments;
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
            questionnaireTicketId={id}
          />
          {!inModal && (
            <CommentForm questionnaireTicketId={id} enableAutoFocus />
          )}
        </Box>
      )}

      <QuestionnaireTicketModal
        questionnaireTicket={questionnaireTicket}
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
      />

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
