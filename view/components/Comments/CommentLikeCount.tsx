import { Typography } from '@mui/material';
import { useState } from 'react';
import { useIsDesktop } from '../../hooks/shared.hooks';
import LikeBadge from '../Likes/LikeBadge';
import LikesPopover from '../Likes/LikesPopover';
import Flex from '../Shared/Flex';

const BOX_SHADOW = `0px 0px 1px 1px rgba(0,0,0,0.05),
                    0px 0px 1px 1px rgba(0,0,0,0.05),
                    0px 0px 1px 0px rgba(0,0,0,0.05)`;

interface Props {
  likeCount: number;
  rightLikeCount: boolean;
  onClick(): void;
  commentId: number;
}

const CommentLikeCount = ({
  commentId,
  likeCount,
  rightLikeCount,
  onClick,
}: Props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isDesktop = useIsDesktop();

  const getLikeCountText = () => {
    if (likeCount > 99) {
      return '99+';
    }
    return likeCount;
  };

  const getLikeCountRightPosition = () => {
    if (rightLikeCount) {
      if (likeCount > 99) {
        return '-54px';
      }
      if (likeCount > 9) {
        return '-44px';
      }
      if (likeCount > 1) {
        return '-35px';
      }
      return '-17px';
    }
    return '0px';
  };

  const handlePopoverOpen = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
  ) => setAnchorEl(event.currentTarget);

  const handlePopoverClose = () => setAnchorEl(null);

  return (
    <Flex
      position="absolute"
      right={getLikeCountRightPosition()}
      bottom={rightLikeCount ? '5px' : '-15px'}
      boxShadow={BOX_SHADOW}
      bgcolor="background.secondary"
      sx={{ cursor: 'pointer' }}
      alignItems="center"
      borderRadius="50px"
      onMouseEnter={handlePopoverOpen}
      onMouseLeave={handlePopoverClose}
      onClick={onClick}
      padding="2px"
      gap="6px"
    >
      <LikeBadge />
      {likeCount > 1 && (
        <Typography
          fontSize="13px"
          paddingRight="5px"
          sx={{ userSelect: 'none' }}
        >
          {getLikeCountText()}
        </Typography>
      )}

      {isDesktop && (
        <LikesPopover
          anchorEl={anchorEl}
          commentId={commentId}
          handlePopoverClose={handlePopoverClose}
        />
      )}
    </Flex>
  );
};

export default CommentLikeCount;
