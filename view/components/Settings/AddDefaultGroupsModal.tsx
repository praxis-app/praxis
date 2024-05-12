import { useTranslation } from 'react-i18next';
import Modal from '../Shared/Modal';

interface Props {
  isOpen: boolean;
  onClose(): void;
}

const AddDefaultGroupsModal = ({ isOpen, onClose }: Props) => {
  const { t } = useTranslation();

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t('serverSettings.headers.addDefaultGroups')}
      centeredTitle
    >
      Test
    </Modal>
  );
};

export default AddDefaultGroupsModal;
