import { useReactiveVar } from '@apollo/client';
import { Typography } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { isLoggedInVar } from '../../graphql/cache';
import { useLikesLazyQuery } from '../../graphql/likes/queries/gen/Likes.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import Modal from '../Shared/Modal';
import ProgressBar from '../Shared/ProgressBar';
import Like from './Like';

interface Props {
  postId?: number;
  commentId?: number;
  onClose(): void;
  open: boolean;
}

const LikesModal = ({ postId, commentId, open, onClose }: Props) => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [getLikes, { data, loading, error }] = useLikesLazyQuery();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const title = commentId
    ? t('comments.labels.likes')
    : t('posts.labels.likes');

  useEffect(() => {
    const noId = !postId && !commentId;
    if (!open || noId) {
      return;
    }
    getLikes({
      variables: { postId, commentId, isLoggedIn },
    });
  }, [open, postId, commentId, isLoggedIn, getLikes]);

  return (
    <Modal
      contentStyles={{ paddingTop: 5 }}
      onClose={onClose}
      open={open}
      title={title}
      topGap={isDesktop ? undefined : '18vh'}
      centeredTitle
    >
      {loading && <ProgressBar />}
      {error && <Typography>{t('errors.somethingWentWrong')}</Typography>}

      {data?.likes.map((like) => (
        <Like key={like.id} like={like} currentUserId={data.me?.id} />
      ))}
    </Modal>
  );
};

export default LikesModal;
