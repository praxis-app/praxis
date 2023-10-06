import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const CardFooterButton = styled(Button)(({ theme }) => ({
  fontFamily: 'Inter Bold',
  paddingLeft: 13,
  paddingRight: 13,
  textTransform: 'none',

  color: theme.palette.text.secondary,
}));

export default CardFooterButton;
