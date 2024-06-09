import { Check, Close } from '@mui/icons-material';
import { useIsDesktop } from '../../../hooks/shared.hooks';
import { PermissionName, getPermissionText } from '../../../utils/role.utils';
import Flex from '../../Shared/Flex';
import { Box, PaperProps, Popover, SxProps, Typography } from '@mui/material';
import { MouseEvent, useState } from 'react';

interface Props {
  permission: string;
  enabled: boolean;
}

const ServerPermissionView = ({ permission, enabled }: Props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isDesktop = useIsDesktop();

  const Icon = enabled ? Check : Close;
  const iconStyles: SxProps = { color: enabled ? '#50a561' : '#e04f4a' };

  const { displayName, description } = getPermissionText(
    permission as PermissionName,
  );

  const paperProps: PaperProps = {
    sx: {
      paddingX: 1.75,
      paddingY: 1.25,
      maxWidth: '400px',
    },
  };

  const handlePopoverOpen = (event: MouseEvent<HTMLDivElement>) => {
    if (!isDesktop) {
      return;
    }
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <Flex
        gap={1}
        width={isDesktop ? '240px' : '100%'}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={() => setAnchorEl(null)}
      >
        <Icon sx={iconStyles} /> {displayName}
      </Flex>

      <Popover
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        open={!!anchorEl}
        slotProps={{ paper: paperProps }}
        sx={{ pointerEvents: 'none' }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Typography>
          <Box component="span" fontFamily="Inter Bold">
            {displayName}
          </Box>{' '}
          - {description}
        </Typography>
      </Popover>
    </>
  );
};

export default ServerPermissionView;
