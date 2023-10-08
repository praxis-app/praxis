import { Button as MuiButton, ButtonProps, styled } from '@mui/material';
import { Blurple, DarkMode } from '../../styles/theme';
import Spinner from './Spinner';

export const BLURPLE_BUTTON_COLORS = {
  backgroundColor: Blurple.Marina,
  '&:active': {
    backgroundColor: Blurple.Marina,
  },
  '&:hover': {
    backgroundColor: Blurple.SavoryBlue,
  },
  '&:disabled': {
    backgroundColor: DarkMode.Liver,
  },
};

const Button = styled(MuiButton)(({ theme }) => ({
  ...BLURPLE_BUTTON_COLORS,
  color: theme.palette.common.white,
  fontFamily: 'Inter Bold',
  letterSpacing: '0.2px',
  textTransform: 'none',
  borderRadius: 9999,
  padding: '0 15px',
  minWidth: 85,
  height: 38,
}));

interface Props extends ButtonProps {
  isLoading?: boolean;
}

const PrimaryActionButton = ({ isLoading, children, ...props }: Props) => (
  <Button {...props}>
    {isLoading && (
      <Spinner size={10} color="inherit" sx={{ marginRight: 0.75 }} />
    )}
    {children}
  </Button>
);

export default PrimaryActionButton;
