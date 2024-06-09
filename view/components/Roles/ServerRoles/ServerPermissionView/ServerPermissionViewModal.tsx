import { Box, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useServerPermissionViewModalLazyQuery } from '../../../../graphql/roles/queries/gen/ServerPermissionViewModal.gen';
import { useIsDesktop } from '../../../../hooks/shared.hooks';
import Flex from '../../../Shared/Flex';
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
  const isDesktop = useIsDesktop();

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
      {error && <Typography>{t('errors.somethingWentWrong')}</Typography>}
      {loading && <ProgressBar />}

      {data && (
        <>
          <Typography marginBottom={2}>
            <Box component="span" fontFamily="Inter Bold">
              {displayName}
            </Box>{' '}
            - {description}
          </Typography>

          <Typography
            fontFamily="Inter Bold"
            marginBottom={0.75}
            textTransform="uppercase"
            fontSize={15}
          >
            {t('permissions.headers.rolesWithPermission')}
          </Typography>
          <Flex
            flexDirection={isDesktop ? 'row' : 'column'}
            flexWrap={isDesktop ? 'wrap' : 'nowrap'}
            gap={0.9}
            marginBottom={2.25}
            paddingLeft={0.4}
          >
            {data.serverRoles.map((role) => (
              <Flex
                key={role.id}
                width={isDesktop ? '240px' : '100%'}
                alignItems="center"
                gap={1.3}
              >
                <Box
                  bgcolor={role.color}
                  width="20px"
                  height="20px"
                  borderRadius={9999}
                />
                {role.name}
              </Flex>
            ))}
          </Flex>

          <ServerRoleMembersView
            members={data.membersWithPermission}
            header={t('permissions.headers.membersWithPermission')}
          />
        </>
      )}
    </Modal>
  );
};

export default ServerPermissionViewModal;
