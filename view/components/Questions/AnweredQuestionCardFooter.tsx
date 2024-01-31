// TODO: Add remaining layout and functionality. Below is a WIP

import { useReactiveVar } from '@apollo/client';
import { Comment } from '@mui/icons-material';
import { Box, CardActions, Divider, SxProps, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isLoggedInVar } from '../../graphql/cache';
import { AnsweredQuestionCardFragment } from '../../graphql/questions/fragments/gen/AnsweredQuestionCard.gen';
import { MyAnsweredQuestionCardFragment } from '../../graphql/questions/fragments/gen/MyAnsweredQuestionCard.gen';
import { useAnswerCommentsLazyQuery } from '../../graphql/questions/queries/gen/AnswerComments.gen';
import CommentForm from '../Comments/CommentForm';
import CommentsList from '../Comments/CommentList';
import LikeBadge from '../Likes/LikeBadge';
import LikesModal from '../Likes/LikesModal';
import CardFooterButton from '../Shared/CardFooterButton';
import Flex from '../Shared/Flex';
import AnsweredLikeButton from './AnswerLikeButton';
import AnsweredQuestionModal from './AnsweredQuestionModal';

const ROTATED_ICON_STYLES: SxProps = {
  marginRight: '0.4ch',
  transform: 'rotateY(180deg)',
};

interface Props {
  question: AnsweredQuestionCardFragment | MyAnsweredQuestionCardFragment;
  inModal?: boolean;
}

const AnsweredQuestionCardFooter = ({ question, inModal }: Props) => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showComments, setShowComments] = useState(inModal);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const [
    getAnswerComments,
    { data: answerCommentsData, called: answerCommentsCalled },
  ] = useAnswerCommentsLazyQuery();

  const { t } = useTranslation();

  const answer =
    'myAnswer' in question
      ? question.myAnswer
      : 'answer' in question
      ? question.answer
      : undefined;

  useEffect(() => {
    if (!inModal || !answer || answerCommentsCalled) {
      return;
    }
    getAnswerComments({
      variables: { id: answer.id, isLoggedIn },
    });
  }, [getAnswerComments, inModal, isLoggedIn, answer, answerCommentsCalled]);

  const likeCount = answer?.likeCount;
  const commentCount = answer?.commentCount;
  const comments = answerCommentsData?.answer.comments;
  const me = answerCommentsData?.me;
  const isLikedByMe = answer?.isLikedByMe;

  const commentCountStyles: SxProps = {
    '&:hover': { textDecoration: 'underline' },
    transform: 'translateY(3px)',
    cursor: 'pointer',
  };

  const handleCommentButtonClick = async () => {
    if (inModal || !answer) {
      return;
    }
    const { data } = await getAnswerComments({
      variables: { id: answer.id, isLoggedIn },
    });
    const comments = data?.answer.comments;
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
    if (!isLoggedIn || inModal || !answer) {
      return null;
    }
    return <CommentForm answerId={answer.id} enableAutoFocus />;
  };

  if (!answer) {
    return null;
  }

  return (
    <Box marginTop={likeCount ? 1.25 : 2}>
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
        <AnsweredLikeButton answerId={answer.id} isLikedByMe={!!isLikedByMe} />

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
            answerId={answer.id}
          />
          {renderCommentForm()}
        </Box>
      )}

      <AnsweredQuestionModal
        question={question}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Box>
  );
};

export default AnsweredQuestionCardFooter;
