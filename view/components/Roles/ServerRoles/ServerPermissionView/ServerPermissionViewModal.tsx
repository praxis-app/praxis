import { Box, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useServerPermissionViewModalLazyQuery } from '../../../../graphql/roles/queries/gen/ServerPermissionViewModal.gen';
import Modal from '../../../Shared/Modal';
import ProgressBar from '../../../Shared/ProgressBar';
import ServerRoleMembersView from '../ServerRoleMembersView';

interface Props {
  displayName: string;
  description: string;
  permissionName: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ServerPermissionViewModal = ({
  permissionName,
  displayName,
  description,
  isOpen,
  setIsOpen,
}: Props) => {
  const [getData, { data, loading, error, called }] =
    useServerPermissionViewModalLazyQuery();

  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen && !called) {
      getData({
        variables: { permissionName },
      });
    }
  }, [isOpen, getData, called, permissionName]);

  return (
    <Modal
      title={t('permissions.headers.permission')}
      onClose={() => setIsOpen(false)}
      open={isOpen}
      centeredTitle
    >
      {data && (
        <Typography marginBottom={2}>
          <Box component="span" fontFamily="Inter Bold">
            {displayName}
          </Box>{' '}
          - {description}
        </Typography>
      )}

      {error && <Typography>{t('errors.somethingWentWrong')}</Typography>}
      {loading && <ProgressBar />}

      {data && (
        <ServerRoleMembersView
          members={data.membersWithPermission}
          header={t('permissions.headers.membersWithPermission')}
        />
      )}
    </Modal>
  );
};

export default ServerPermissionViewModal;
