import { Check, Close } from '@mui/icons-material';
import { Button, SxProps } from '@mui/material';
import { useState } from 'react';
import { useIsDesktop } from '../../../../hooks/shared.hooks';
import {
  PermissionName,
  getPermissionText,
} from '../../../../utils/role.utils';
import ServerPermissionViewModal from './ServerPermissionViewModal';

interface Props {
  permission: string;
  enabled: boolean;
}

const ServerPermissionView = ({ permission, enabled }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isDesktop = useIsDesktop();

  const Icon = enabled ? Check : Close;
  const { displayName, description } = getPermissionText(
    permission as PermissionName,
  );

  const iconStyles: SxProps = {
    color: enabled ? '#50a561' : '#e04f4a',
    width: '25px',
    height: '25px',
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        startIcon={<Icon sx={iconStyles} />}
        sx={{
          width: isDesktop ? '225px' : '100%',
          textTransform: 'none',
          justifyContent: 'start',
          paddingY: '1px',
          fontSize: '16px',
        }}
      >
        {displayName}
      </Button>

      <ServerPermissionViewModal
        permissionName={permission}
        displayName={displayName}
        description={description}
        setIsOpen={setIsModalOpen}
        isOpen={isModalOpen}
      />
    </>
  );
};

export default ServerPermissionView;
