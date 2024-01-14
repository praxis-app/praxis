import { ThumbUp } from '@mui/icons-material';
import { Box } from '@mui/material';
import { Blurple } from '../../styles/theme';

const LikeBadge = () => {
  return (
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
  );
};

export default LikeBadge;