import { Comment } from '@mui/icons-material';
import { Box, CardActions, Divider, SxProps, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { NotificationType } from '../../constants/notifications.constants';
import { AnswerQuestionsFormFieldFragment } from '../../graphql/questions/fragments/gen/AnswerQuestionsFormField.gen';
import { AnsweredQuestionCardFragment } from '../../graphql/questions/fragments/gen/AnsweredQuestionCard.gen';
import { useQuestionCommentsLazyQuery } from '../../graphql/questions/queries/gen/QuestionComments.gen';
import CommentForm from '../Comments/CommentForm';
import CommentsList from '../Comments/CommentList';
import LikeBadge from '../Likes/LikeBadge';
import LikesModal from '../Likes/LikesModal';
import CardFooterButton from '../Shared/CardFooterButton';
import Flex from '../Shared/Flex';
import { AnswerQuestionsFormFieldProps } from './AnswerQuestionsFormField';
import AnsweredQuestionModal from './AnsweredQuestionModal';
import QuestionLikeButton from './QuestionLikeButton';
import QuestionModal from './QuestionModal';

const ROTATED_ICON_STYLES: SxProps = {
  marginRight: '0.4ch',
  transform: 'rotateY(180deg)',
};

interface Props {
  answerQuestionsFormFieldProps?: AnswerQuestionsFormFieldProps;
  question: AnsweredQuestionCardFragment | AnswerQuestionsFormFieldFragment;
  inModal?: boolean;
}

const QuestionCardFooter = ({
  answerQuestionsFormFieldProps,
  question,
  inModal,
}: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showComments, setShowComments] = useState(inModal);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const [
    getQuestionComments,
    { data: questionCommentsData, called: questionCommentsCalled },
  ] = useQuestionCommentsLazyQuery();

  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const isAnswerComment = !!searchParams.get(NotificationType.AnswerComment);
  const questionIdQueryParam = searchParams.get('questionId');

  const handleCommentButtonClick = useCallback(async () => {
    if (inModal) {
      return;
    }
    const { data } = await getQuestionComments({
      variables: { id: question.id },
    });
    const comments = data?.question.comments;
    if (comments && comments.length > 1) {
      setIsModalOpen(true);
    } else {
      setShowComments(true);
    }
  }, [getQuestionComments, inModal, question.id]);

  useEffect(() => {
    if (
      !questionCommentsCalled &&
      questionIdQueryParam === question.id.toString() &&
      isAnswerComment
    ) {
      handleCommentButtonClick();
    }
  }, [
    handleCommentButtonClick,
    isAnswerComment,
    questionCommentsCalled,
    questionIdQueryParam,
    question.id,
  ]);

  useEffect(() => {
    if (inModal && !questionCommentsCalled) {
      getQuestionComments({
        variables: { id: question.id },
      });
    }
  }, [inModal, questionCommentsCalled, getQuestionComments, question.id]);

  const likeCount = question?.likeCount;
  const isLikedByMe = question?.isLikedByMe;
  const commentCount = question?.commentCount;
  const comments = questionCommentsData?.question.comments;
  const me = questionCommentsData?.me;

  const commentCountStyles: SxProps = {
    '&:hover': { textDecoration: 'underline' },
    transform: 'translateY(3px)',
    cursor: 'pointer',
  };

  const handlePopoverOpen = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
  ) => setAnchorEl(event.currentTarget);

  const handlePopoverClose = () => setAnchorEl(null);

  const renderCommentForm = () => {
    if (inModal) {
      return null;
    }
    return <CommentForm questionId={question.id} enableAutoFocus />;
  };

  const renderModal = () => {
    if (answerQuestionsFormFieldProps) {
      return (
        <QuestionModal
          question={question}
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          formFieldProps={answerQuestionsFormFieldProps}
        />
      );
    }
    return (
      <AnsweredQuestionModal
        question={question as AnsweredQuestionCardFragment}
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
      />
    );
  };

  return (
    <>
      <Box paddingX={inModal ? 0 : '16px'}>
        <Flex
          justifyContent={likeCount ? 'space-between' : 'end'}
          marginBottom={likeCount || commentCount ? 0.8 : 0}
        >
          {!!likeCount && (
            <>
              <Flex
                onClick={() => setShowLikesModal(true)}
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
                sx={{ cursor: 'pointer' }}
              >
                <LikeBadge
                  questionId={question.id}
                  anchorEl={anchorEl}
                  handlePopoverClose={handlePopoverClose}
                  marginRight="11px"
                />

                <Typography sx={{ userSelect: 'none' }}>{likeCount}</Typography>
              </Flex>

              <LikesModal
                open={showLikesModal}
                onClose={() => setShowLikesModal(false)}
                questionId={question.id}
              />
            </>
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
        <Divider />
      </Box>

      <CardActions
        sx={{
          justifyContent: 'space-around',
          paddingX: inModal ? 0 : undefined,
        }}
      >
        <QuestionLikeButton
          questionId={question?.id}
          isLikedByMe={!!isLikedByMe}
        />

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
            questionId={question?.id}
          />
          {renderCommentForm()}
        </Box>
      )}

      {renderModal()}
    </>
  );
};

export default QuestionCardFooter;
