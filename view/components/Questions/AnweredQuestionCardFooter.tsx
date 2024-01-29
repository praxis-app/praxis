// TODO: Add basic functionality for sharing. Below is a WIP

import { useReactiveVar } from '@apollo/client';
import { Comment } from '@mui/icons-material';
import { Box, CardActions, Divider, SxProps, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isLoggedInVar } from '../../graphql/cache';
import { AnsweredQuestionCardFooterFragment } from '../../graphql/questions/fragments/gen/AnsweredQuestionCardFooter.gen';
import { useAnswerCommentsLazyQuery } from '../../graphql/questions/queries/gen/AnswerComments.gen';
import CommentForm from '../Comments/CommentForm';
import CommentsList from '../Comments/CommentList';
import LikeBadge from '../Likes/LikeBadge';
import LikesModal from '../Likes/LikesModal';
import CardFooterButton from '../Shared/CardFooterButton';
import Flex from '../Shared/Flex';

const ROTATED_ICON_STYLES: SxProps = {
  marginRight: '0.4ch',
  transform: 'rotateY(180deg)',
};

interface Props {
  question: AnsweredQuestionCardFooterFragment;
  inModal?: boolean;
}

const AnsweredQuestionCardFooter = ({ question, inModal }: Props) => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [, setIsModalOpen] = useState(false);
  const [showComments, setShowComments] = useState(inModal);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const [getAnswerComments, { data: answerCommentsData }] =
    useAnswerCommentsLazyQuery();

  const { t } = useTranslation();

  useEffect(() => {
    if (inModal) {
      getAnswerComments({
        variables: {
          id: question.id,
          isLoggedIn,
        },
      });
    }
  }, [getAnswerComments, inModal, isLoggedIn, question]);

  const { id, answer } = question;
  const likeCount = answer?.likeCount;
  const commentCount = answer?.commentCount;
  const comments = answerCommentsData?.answer.comments;
  const me = answerCommentsData?.me;

  const commentCountStyles: SxProps = {
    '&:hover': { textDecoration: 'underline' },
    transform: 'translateY(3px)',
    cursor: 'pointer',
  };

  const handleCommentButtonClick = async () => {
    if (inModal) {
      return;
    }
    const { data } = await getAnswerComments({
      variables: { id, isLoggedIn },
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
    if (!isLoggedIn || inModal) {
      return null;
    }
    return <CommentForm postId={id} enableAutoFocus />;
  };

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
                <LikeBadge
                  postId={id}
                  anchorEl={anchorEl}
                  handlePopoverClose={handlePopoverClose}
                  marginRight="11px"
                />

                <Typography sx={{ userSelect: 'none' }}>{likeCount}</Typography>
              </Flex>

              <LikesModal
                open={showLikesModal}
                onClose={() => setShowLikesModal(false)}
                postId={id}
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
        {/* TODO: Add like button component */}
        {/* <PostLikeButton postId={id} isLikedByMe={!!isLikedByMe} /> */}

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
            postId={id}
          />
          {renderCommentForm()}
        </Box>
      )}

      {/*
      TODO: Add modal component 
      <PostModal
        post={post}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      /> */}
    </Box>
  );
};

export default AnsweredQuestionCardFooter;
