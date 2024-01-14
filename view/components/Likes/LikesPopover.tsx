// TODO: Rename as LikesPopover - use for both comments and posts

import { PaperProps, Popover, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLikesPopoverLazyQuery } from '../../graphql/likes/queries/gen/LikesPopover.gen';

interface Props {
  anchorEl: null | HTMLElement;
  commentId?: number;
  postId?: number;
  handlePopoverClose(): void;
}

const LikesPopover = ({
  anchorEl,
  commentId,
  postId,
  handlePopoverClose,
}: Props) => {
  const [getLikes, { data, loading, called, error }] =
    useLikesPopoverLazyQuery();

  const { t } = useTranslation();

  useEffect(() => {
    const noId = !postId && !commentId;
    if (!anchorEl || noId || called) {
      return;
    }
    getLikes({
      variables: { postId, commentId },
    });
  }, [anchorEl, postId, commentId, getLikes, called]);

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
        {t('actions.like')}
      </Typography>

      {loading && <Typography>{t('states.loading')}</Typography>}
      {error && <Typography>{t('errors.somethingWentWrong')}</Typography>}

      {data?.likes.map(({ id, user }) => (
        <Typography key={id}>{user.name}</Typography>
      ))}
    </Popover>
  );
};

export default LikesPopover;
