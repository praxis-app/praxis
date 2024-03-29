import { useReactiveVar } from '@apollo/client';
import { Typography } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { isLoggedInVar, isVerifiedVar } from '../../graphql/cache';
import { useLikesLazyQuery } from '../../graphql/likes/queries/gen/Likes.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import Modal from '../Shared/Modal';
import ProgressBar from '../Shared/ProgressBar';
import Like from './Like';

interface Props {
  postId?: number;
  commentId?: number;
  questionId?: number;
  onClose(): void;
  open: boolean;
}

const LikesModal = ({
  postId,
  commentId,
  questionId,
  open,
  onClose,
}: Props) => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const isVerified = useReactiveVar(isVerifiedVar);
  const [getLikes, { data, loading, error }] = useLikesLazyQuery();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    const noId = !postId && !commentId && !questionId;
    if (!open || noId) {
      return;
    }
    getLikes({
      variables: {
        likesData: { postId, commentId, questionId },
        isLoggedIn,
        isVerified,
      },
    });
  }, [open, postId, commentId, questionId, isLoggedIn, getLikes, isVerified]);

  const getTitle = () => {
    if (questionId) {
      return t('questions.labels.likes');
    }
    if (commentId) {
      return t('comments.labels.likes');
    }
    return t('posts.labels.likes');
  };

  return (
    <Modal
      contentStyles={{ paddingTop: 5 }}
      onClose={onClose}
      open={open}
      title={getTitle()}
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
