import { Typography } from '@mui/material';
import { useState } from 'react';
import LikeBadge from '../Likes/LikeBadge';
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

  const getLikeCountText = () => {
    if (likeCount > 99) {
      return '99+';
    }
    return likeCount;
  };

  const getLikeCountRightPosition = () => {
    if (!rightLikeCount) {
      return '0px';
    }
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
      <LikeBadge
        commentId={commentId}
        anchorEl={anchorEl}
        handlePopoverClose={handlePopoverClose}
      />
      {likeCount > 1 && (
        <Typography
          fontSize="13px"
          paddingRight="5px"
          sx={{ userSelect: 'none' }}
        >
          {getLikeCountText()}
        </Typography>
      )}
    </Flex>
  );
};

export default CommentLikeCount;
