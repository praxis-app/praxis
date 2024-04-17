import { Button, ButtonProps, SxProps, useTheme } from '@mui/material';
import { Blurple, DarkMode } from '../../styles/theme';
import Spinner from './Spinner';

interface Props extends ButtonProps {
  isLoading?: boolean;
}

const PrimaryActionButton = ({ isLoading, children, sx, ...props }: Props) => {
  const theme = useTheme();

  const buttonStyles: SxProps = {
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
    color: theme.palette.common.white,
    fontFamily: 'Inter Bold',
    letterSpacing: '0.2px',
    textTransform: 'none',
    borderRadius: 9999,
    padding: '0 15px',
    minWidth: 85,
    height: 38,
    ...sx,
  };

  return (
    <Button sx={buttonStyles} {...props}>
      {isLoading && (
        <Spinner size={10} color="inherit" sx={{ marginRight: 0.75 }} />
      )}
      {children}
    </Button>
  );
};

export default PrimaryActionButton;
