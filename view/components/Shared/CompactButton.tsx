import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const CompactButton = styled(Button)(({ theme }) => ({
  borderRadius: 4,
  minWidth: 'initial',
  padding: 0,
  '&:hover': {
    backgroundColor: theme.palette.background.paper,
  },
}));

export default CompactButton;
