import { Box, SxProps } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PostCardFragment } from '../../apollo/posts/generated/PostCard.fragment';
import { useIsDesktop } from '../../hooks/shared.hooks';
import CommentForm from '../Comments/CommentForm';
import Modal from '../Shared/Modal';
import PostCard from './PostCard';

interface Props {
  post: PostCardFragment;
  open: boolean;
  onClose(): void;
}

const PostModal = ({ post, open, onClose }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    ref.current?.scrollIntoView();
  }, [post.commentCount]);

  const title = t('posts.labels.usersPost', {
    name: post.user.name[0].toUpperCase() + post.user.name.slice(1),
  });

  const contentStyles: SxProps = {
    width: isDesktop ? '700px' : '100%',
    paddingBottom: 0,
    minHeight: '50vh',
  };

  const renderCommentForm = () => {
    if (post.group && !post.group.isJoinedByMe) {
      return null;
    }
    if (post.event && !post.event.group?.isJoinedByMe) {
      return null;
    }
    return (
      <Box
        bgcolor="background.paper"
        bottom={0}
        left={0}
        paddingTop="12px"
        paddingX="16px"
        width="100%"
      >
        <CommentForm postId={post.id} expanded />
      </Box>
    );
  };

  return (
    <Modal
      contentStyles={contentStyles}
      footerContent={renderCommentForm()}
      maxWidth="md"
      onClose={onClose}
      open={open}
      title={title}
      centeredTitle
    >
      <PostCard post={post} inModal />
      <Box ref={ref} />
    </Modal>
  );
};

export default PostModal;
