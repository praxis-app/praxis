import { ThumbUp } from '@mui/icons-material';
import { Box, BoxProps } from '@mui/material';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { Blurple } from '../../styles/theme';
import LikesPopover from './LikesPopover';

interface Props extends BoxProps {
  postId?: number;
  commentId?: number;
  handlePopoverClose(): void;
  anchorEl: HTMLElement | null;
}

const LikeBadge = ({
  postId,
  commentId,
  handlePopoverClose,
  anchorEl,
  ...boxProps
}: Props) => {
  const isDesktop = useIsDesktop();

  return (
    <Box
      bgcolor={Blurple.Marina}
      borderRadius="50%"
      display="inline-flex"
      justifyContent="center"
      sx={{ cursor: 'pointer' }}
      width="22px"
      height="22px"
      {...boxProps}
    >
      <ThumbUp
        sx={{
          fontSize: 13,
          marginTop: 0.55,
          marginLeft: '1px',
          color: 'text.primary',
        }}
      />

      {isDesktop && (
        <LikesPopover
          anchorEl={anchorEl}
          postId={postId}
          commentId={commentId}
          handlePopoverClose={handlePopoverClose}
        />
      )}
    </Box>
  );
};

export default LikeBadge;
