import { useTranslation } from 'react-i18next';
import Modal from '../Shared/Modal';
import PostForm from './PostForm';

interface Props {
  isOpen: boolean;
  onClose(): void;
  sharedFromUserId: number;
  sharedPostId?: number;
  sharedProposalId?: number;
}

const SharePostModal = ({
  isOpen,
  onClose,
  sharedFromUserId,
  sharedPostId,
  sharedProposalId,
}: Props) => {
  const { t } = useTranslation();

  return (
    <Modal
      contentStyles={{ paddingTop: 3, minHeight: 'fit-content' }}
      title={t('actions.share')}
      maxWidth="md"
      onClose={onClose}
      open={isOpen}
      centeredTitle
    >
      <PostForm
        onSubmit={onClose}
        sharedFromUserId={sharedFromUserId}
        sharedProposalId={sharedProposalId}
        sharedPostId={sharedPostId}
      />
    </Modal>
  );
};

export default SharePostModal;
