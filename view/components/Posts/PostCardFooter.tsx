// TODO: Add basic functionality for sharing. Below is a WIP

import { useReactiveVar } from '@apollo/client';
import { Comment, Reply } from '@mui/icons-material';
import { Box, CardActions, Divider, SxProps, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isLoggedInVar, isVerifiedVar } from '../../graphql/cache';
import { PostCardFragment } from '../../graphql/posts/fragments/gen/PostCard.gen';
import { usePostCommentsLazyQuery } from '../../graphql/posts/queries/gen/PostComments.gen';
import { inDevToast } from '../../utils/shared.utils';
import CommentForm from '../Comments/CommentForm';
import CommentsList from '../Comments/CommentList';
import LikeBadge from '../Likes/LikeBadge';
import LikesModal from '../Likes/LikesModal';
import CardFooterButton from '../Shared/CardFooterButton';
import Flex from '../Shared/Flex';
import PostLikeButton from './PostLikeButton';
import PostModal from './PostModal';

const ROTATED_ICON_STYLES: SxProps = {
  marginRight: '0.4ch',
  transform: 'rotateY(180deg)',
};

interface Props {
  post: PostCardFragment;
  inModal: boolean;
  isPostPage: boolean;
  groupId?: number;
  eventId?: number;
}

const PostCardFooter = ({
  post,
  inModal,
  isPostPage,
  groupId,
  eventId,
}: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showComments, setShowComments] = useState(inModal || isPostPage);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const isVerified = useReactiveVar(isVerifiedVar);

  const [getPostComments, { data: postCommentsData }] =
    usePostCommentsLazyQuery();

  const { t } = useTranslation();

  useEffect(() => {
    if (inModal || isPostPage) {
      getPostComments({
        variables: {
          id: post.id,
          withEvent: !!eventId,
          withGroup: !!groupId,
          eventId,
          groupId,
          isLoggedIn,
          isVerified,
        },
      });
    }
  }, [
    eventId,
    getPostComments,
    groupId,
    inModal,
    isLoggedIn,
    isVerified,
    isPostPage,
    post,
  ]);

  const { id, likeCount, commentCount, isLikedByMe } = post;
  const comments = postCommentsData?.post.comments;
  const group = postCommentsData?.group;
  const event = postCommentsData?.event;
  const me = postCommentsData?.me;

  const canManageComments = !!(
    event?.group?.myPermissions?.manageComments ||
    group?.myPermissions?.manageComments ||
    me?.serverPermissions.manageComments
  );

  const notInGroup = group && !group.isJoinedByMe;
  const notInEventGroup = event?.group && !event.group.isJoinedByMe;
  const showJoinToCommentPrompt =
    (notInGroup || notInEventGroup) && !comments?.length;

  const commentCountStyles: SxProps = {
    '&:hover': { textDecoration: 'underline' },
    transform: 'translateY(3px)',
    cursor: 'pointer',
  };

  const handleCommentButtonClick = async () => {
    if (inModal || isPostPage) {
      return;
    }
    const { data } = await getPostComments({
      variables: {
        id,
        eventId,
        groupId,
        isLoggedIn,
        isVerified,
        withEvent: !!eventId,
        withGroup: !!groupId,
      },
    });
    const comments = data?.post.comments;
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
    if (!isVerified || inModal) {
      return null;
    }
    if (group && !group.isJoinedByMe) {
      return null;
    }
    if (event && !event.group?.isJoinedByMe) {
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
        <PostLikeButton postId={id} isLikedByMe={!!isLikedByMe} />

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
            marginBottom={inModal && !isVerified ? 2.5 : undefined}
            postId={id}
          />
          {renderCommentForm()}

          {showJoinToCommentPrompt && isVerified && (
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
              {t('posts.prompts.verifyToComment')}
            </Typography>
          )}
        </Box>
      )}

      <PostModal
        post={post}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Box>
  );
};

export default PostCardFooter;
