import { useTranslation } from 'react-i18next';
import { PostSharesModalFragment } from '../../graphql/posts/fragments/gen/PostSharesModal.gen';
import Modal from '../Shared/Modal';

interface Props {
  post: PostSharesModalFragment;
  isOpen: boolean;
  onClose(): void;
}

const PostSharesModal = ({ isOpen, onClose }: Props) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t('posts.headers.peopleWhoShared')}
      maxWidth="md"
      onClose={onClose}
      open={isOpen}
      centeredTitle
    >
      Test
    </Modal>
  );
};

export default PostSharesModal;
