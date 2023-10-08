// TODO: Move hex color values to theme

import { Button as MuiButton, ButtonProps, styled } from '@mui/material';

const Button = styled(MuiButton)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: 8,
  color: '#f44336',
}));

const DeleteButton = ({ children, ...buttonProps }: ButtonProps) => (
  <Button variant="text" fullWidth {...buttonProps}>
    {children}
  </Button>
);

export default DeleteButton;
