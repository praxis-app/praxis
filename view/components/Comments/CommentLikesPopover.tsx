import { PaperProps, Popover, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface Props {
  anchorEl: null | HTMLElement;
  handlePopoverClose(): void;
}

const CommentLikesPopover = ({ anchorEl, handlePopoverClose }: Props) => {
  const { t } = useTranslation();

  const paperProps: PaperProps = {
    sx: {
      paddingX: 1.75,
      paddingY: 1.25,
    },
  };

  return (
    <Popover
      anchorEl={anchorEl}
      onClose={handlePopoverClose}
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
      <Typography color="primary" gutterBottom>
        {t('labels.likes')}
      </Typography>

      {/* TODO: Add likes here */}
    </Popover>
  );
};

export default CommentLikesPopover;
