// TODO: Add remaining layout and functionality. Below is a WIP

import { useReactiveVar } from '@apollo/client';
import { Comment } from '@mui/icons-material';
import { Box, CardActions, Divider, SxProps, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isLoggedInVar } from '../../graphql/cache';
import { AnsweredQuestionCardFragment } from '../../graphql/questions/fragments/gen/AnsweredQuestionCard.gen';
import { useQuestionCommentsLazyQuery } from '../../graphql/questions/queries/gen/QuestionComments.gen';
import CommentForm from '../Comments/CommentForm';
import CommentsList from '../Comments/CommentList';
import LikeBadge from '../Likes/LikeBadge';
import LikesModal from '../Likes/LikesModal';
import CardFooterButton from '../Shared/CardFooterButton';
import Flex from '../Shared/Flex';
import AnsweredQuestionModal from './AnsweredQuestionModal';
import QuestionLikeButton from './QuestionLikeButton';

const ROTATED_ICON_STYLES: SxProps = {
  marginRight: '0.4ch',
  transform: 'rotateY(180deg)',
};

interface Props {
  question: AnsweredQuestionCardFragment;
  inModal?: boolean;
}

const AnsweredQuestionCardFooter = ({ question, inModal }: Props) => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showComments, setShowComments] = useState(inModal);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const [
    getQuestionComments,
    { data: questionCommentsData, called: questionCommentsCalled },
  ] = useQuestionCommentsLazyQuery();

  const { t } = useTranslation();

  useEffect(() => {
    if (!inModal || questionCommentsCalled) {
      return;
    }
    getQuestionComments({
      variables: { id: question.id, isLoggedIn },
    });
  }, [
    inModal,
    isLoggedIn,
    questionCommentsCalled,
    getQuestionComments,
    question.id,
  ]);

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

  const handleCommentButtonClick = async () => {
    if (inModal) {
      return;
    }
    const { data } = await getQuestionComments({
      variables: { id: question.id, isLoggedIn },
    });
    const comments = data?.question.comments;
    if (comments && comments.length > 1) {
      setIsModalOpen(true);
    } else {
      setShowComments(true);
    }
  };

  const handlePopoverOpen = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
  ) => setAnchorEl(event.currentTarget);

  const handlePopoverClose = () => setAnchorEl(null);

  const renderCommentForm = () => {
    if (!isLoggedIn || inModal) {
      return null;
    }
    return <CommentForm questionId={question.id} enableAutoFocus />;
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
                {/* TODO: Add answerId prop to LikeBadge */}
                <LikeBadge
                  postId={question.id}
                  anchorEl={anchorEl}
                  handlePopoverClose={handlePopoverClose}
                  marginRight="11px"
                />

                <Typography sx={{ userSelect: 'none' }}>{likeCount}</Typography>
              </Flex>

              {/* TODO: Add answerId prop to LikesModal */}
              <LikesModal
                open={showLikesModal}
                onClose={() => setShowLikesModal(false)}
                postId={question.id}
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
            marginBottom={inModal && !isLoggedIn ? 2.5 : undefined}
            questionId={question?.id}
          />
          {renderCommentForm()}
        </Box>
      )}

      <AnsweredQuestionModal
        question={question}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default AnsweredQuestionCardFooter;
