import { ThumbUp } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { Blurple } from '../../styles/theme';
import Flex from '../Shared/Flex';

const BOX_SHADOW = `0px 0px 1px 1px rgba(0,0,0,0.05),
                    0px 0px 1px 1px rgba(0,0,0,0.05),
                    0px 0px 1px 0px rgba(0,0,0,0.05)`;

interface Props {
  likeCount: number;
  rightLikeCount: boolean;
  onClick(): void;
}

const CommentLikeCount = ({ likeCount, rightLikeCount, onClick }: Props) => {
  const getLikeCountText = () => {
    if (likeCount > 99) {
      return '99+';
    }
    return likeCount;
  };

  // TODO: Account for when there are more than 9 likes
  const getLikeCountRightPosition = () => {
    if (rightLikeCount) {
      if (likeCount > 1) {
        return '-35px';
      }
      return '-16px';
    }
    return '0px';
  };

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
      onClick={onClick}
      padding="2px"
      gap="6px"
    >
      <Box
        bgcolor={Blurple.Marina}
        borderRadius="50%"
        display="inline-flex"
        justifyContent="center"
        width="22px"
        height="22px"
      >
        <ThumbUp
          sx={{
            fontSize: 13,
            marginTop: 0.55,
            marginLeft: '1px',
            color: 'text.primary',
          }}
        />
      </Box>
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
