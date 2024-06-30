import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { usePostSharesModalQuery } from '../../graphql/posts/queries/gen/PostSharesModal.gen';
import Modal from '../Shared/Modal';
import ProgressBar from '../Shared/ProgressBar';
import PostShareCompact from './PostShareCompact';

interface Props {
  postId: number;
  isOpen: boolean;
  onClose(): void;
  isVerified: boolean;
}

const PostSharesModal = ({ postId, isOpen, onClose, isVerified }: Props) => {
  const { data, loading, error } = usePostSharesModalQuery({
    variables: { postId, isVerified },
    skip: !isOpen,
  });

  const { t } = useTranslation();

  const me = data?.me;
  const serverPermissions = me?.serverPermissions;
  const canManagePosts = serverPermissions?.managePosts;
  const shares = data?.post.shares;

  return (
    <Modal
      title={t('posts.headers.peopleWhoShared')}
      contentStyles={{ minHeight: 'fit-content' }}
      maxWidth="md"
      onClose={onClose}
      open={isOpen}
      centeredTitle
    >
      {error && <Typography>{t('errors.somethingWentWrong')}</Typography>}
      {loading && <ProgressBar />}

      {shares?.map((share, index) => (
        <PostShareCompact
          key={share.id}
          post={share}
          currentUserId={me?.id}
          canManagePosts={canManagePosts}
          isVerified={isVerified}
          isLast={index === shares.length - 1}
        />
      ))}
    </Modal>
  );
};

export default PostSharesModal;
