import { Comment, HowToVote, QuestionAnswer } from '@mui/icons-material';
import { Box, CardActions, Divider, SxProps, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { NotificationType } from '../../constants/notifications.constants';
import { QuestionnaireTicketStatus } from '../../constants/question.constants';
import { NavigationPaths } from '../../constants/shared.constants';
import { toastVar } from '../../graphql/cache';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [showComments, setShowComments] = useState(inModal);

  const [
    getQuestionnaireTicketComments,
    { data: commentsData, called: getCommentsCalled },
  ] = useQuestionnaireTicketCommentsLazyQuery();

  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isQuestion = !!searchParams.get('questionId');
  const isCommentLike = !!searchParams.get(NotificationType.CommentLike);
  const isTicketComment = !!searchParams.get(
    NotificationType.QuestionnaireTicketComment,
  );

  const { id, myVote, voteCount, commentCount, settings, status } =
    questionnaireTicket;

  const comments = commentsData?.questionnaireTicket?.comments;
  const me = commentsData?.me;

  const commentCountStyles: SxProps = {
    '&:hover': { textDecoration: 'underline' },
    transform: 'translateY(3px)',
    cursor: 'pointer',
    height: '24px',
  };

  const handleCommentButtonClick = useCallback(async () => {
    if (inModal) {
      return;
    }
    const { data } = await getQuestionnaireTicketComments({
      variables: { id },
    });
    const comments = data?.questionnaireTicket.comments;
    if (comments && comments.length > 1) {
      setIsModalOpen(true);
    } else {
      setShowComments(true);
    }
  }, [getQuestionnaireTicketComments, inModal, id]);

  useEffect(() => {
    if (
      (isTicketComment || isCommentLike) &&
      !getCommentsCalled &&
      !isQuestion
    ) {
      handleCommentButtonClick();
    }
  }, [
    getCommentsCalled,
    handleCommentButtonClick,
    isCommentLike,
    isQuestion,
    isTicketComment,
  ]);

  useEffect(() => {
    if (inModal && !getCommentsCalled) {
      getQuestionnaireTicketComments({
        variables: {
          id: questionnaireTicket.id,
        },
      });
    }
  }, [
    getQuestionnaireTicketComments,
    inModal,
    questionnaireTicket,
    getCommentsCalled,
  ]);

  const handleVoteButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (status === QuestionnaireTicketStatus.InProgress) {
      toastVar({
        title: t('questions.errors.ticketNotSubmitted'),
        status: 'info',
      });
      return;
    }
    if (status !== QuestionnaireTicketStatus.Submitted) {
      toastVar({
        title: t('questions.errors.votingEnded'),
        status: 'info',
      });
      return;
    }
    setMenuAnchorEl(event.currentTarget);
  };

  const handleVoteMenuClose = () => setMenuAnchorEl(null);

  const handleModalClose = () => {
    setIsModalOpen(false);

    if (isCommentLike) {
      searchParams.delete(NotificationType.CommentLike);
      setSearchParams(searchParams);
    }
    if (isTicketComment) {
      searchParams.delete(NotificationType.QuestionnaireTicketComment);
      setSearchParams(searchParams);
    }
  };

  const handleAnswersButtonClick = () =>
    navigate(`${NavigationPaths.ServerQuestionnaires}/${id}`);

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
          {t('proposals.actions.vote')}
        </CardFooterButton>

        <CardFooterButton onClick={handleCommentButtonClick}>
          <Comment sx={ROTATED_ICON_STYLES} />
          {t('actions.comment')}
        </CardFooterButton>

        <CardFooterButton onClick={handleAnswersButtonClick}>
          <QuestionAnswer sx={ROTATED_ICON_STYLES} />
          {t('questions.labels.answers')}
        </CardFooterButton>
      </CardActions>

      {showComments && (
        <Box paddingX={inModal ? 0 : '16px'}>
          <Divider sx={{ marginBottom: 2 }} />
          <CommentsList
            comments={comments || []}
            currentUserId={me?.id}
            questionnaireTicketId={id}
          />
          {!inModal && (
            <CommentForm questionnaireTicketId={id} enableAutoFocus />
          )}
        </Box>
      )}

      <QuestionnaireTicketModal
        questionnaireTicket={questionnaireTicket}
        onClose={handleModalClose}
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
