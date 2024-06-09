import { Box, Typography } from '@mui/material';
import { truncate } from 'lodash';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TruncationSizes } from '../../../../constants/shared.constants';
import { useServerPermissionViewModalLazyQuery } from '../../../../graphql/roles/queries/gen/ServerPermissionViewModal.gen';
import { useIsDesktop } from '../../../../hooks/shared.hooks';
import { getUserProfilePath } from '../../../../utils/user.utils';
import Flex from '../../../Shared/Flex';
import Link from '../../../Shared/Link';
import Modal from '../../../Shared/Modal';
import ProgressBar from '../../../Shared/ProgressBar';
import UserAvatar from '../../../Users/UserAvatar';

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

      {data && data?.membersWithPermission.length > 0 && (
        <>
          <Typography
            fontFamily="Inter Bold"
            marginBottom={1.2}
            textTransform="uppercase"
            fontSize={15}
          >
            {t('permissions.headers.membersWithPermission')}
          </Typography>

          <Flex
            flexDirection={isDesktop ? 'row' : 'column'}
            flexWrap={isDesktop ? 'wrap' : 'nowrap'}
            gap={isDesktop ? 1.6 : 1.4}
            marginBottom={1.25}
            paddingLeft={isDesktop ? 0.1 : 0.5}
          >
            {data.membersWithPermission.map((member) => {
              const username = member.displayName || member.name;
              const truncatedUsername = truncate(username, {
                length: isDesktop
                  ? TruncationSizes.Small
                  : TruncationSizes.Medium,
              });
              const userPath = getUserProfilePath(member.name);

              return (
                <Link
                  key={member.id}
                  href={userPath}
                  sx={{
                    width: isDesktop ? '235px' : '100%',
                    display: 'flex',
                    gap: 1.3,
                  }}
                >
                  <UserAvatar user={member} size={25} />
                  {truncatedUsername}
                </Link>
              );
            })}
          </Flex>
        </>
      )}
    </Modal>
  );
};

export default ServerPermissionViewModal;
