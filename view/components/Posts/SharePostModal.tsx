import { useTranslation } from 'react-i18next';
import Modal from '../Shared/Modal';
import PostForm from './PostForm';

interface Props {
  sharedPostId: number;
  isOpen: boolean;
  onClose(): void;
}

const SharePostModal = ({ sharedPostId, isOpen, onClose }: Props) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t('actions.share')}
      maxWidth="md"
      onClose={onClose}
      contentStyles={{ paddingTop: 3, minHeight: 'fit-content' }}
      open={isOpen}
      centeredTitle
    >
      <PostForm sharedPostId={sharedPostId} onSubmit={onClose} />
    </Modal>
  );
};

export default SharePostModal;
