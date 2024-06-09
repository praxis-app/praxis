import { Box, Typography } from '@mui/material';
import Modal from '../../../Shared/Modal';
import { useTranslation } from 'react-i18next';

interface Props {
  displayName: string;
  description: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ServerPermissionViewModal = ({
  description,
  displayName,
  isOpen,
  setIsOpen,
}: Props) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t('permissions.headers.permission')}
      onClose={() => setIsOpen(false)}
      open={isOpen}
      centeredTitle
    >
      <Typography>
        <Box component="span" fontFamily="Inter Bold">
          {displayName}
        </Box>{' '}
        - {description}
      </Typography>
    </Modal>
  );
};

export default ServerPermissionViewModal;
