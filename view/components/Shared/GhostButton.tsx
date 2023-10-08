/**
 * Ghost Button, from A comprehensive guide to designing UX buttons
 * https://www.invisionapp.com/inside-design/comprehensive-guide-designing-ux-buttons
 */

import { Button as MuiButton, ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const Button = styled(MuiButton)(() => ({
  borderRadius: 8,
  fontFamily: 'Inter Bold',
  letterSpacing: '0.3px',
  textTransform: 'none',
}));

const GhostButton = ({ children, ...buttonProps }: ButtonProps) => (
  <Button variant="outlined" {...buttonProps}>
    {children}
  </Button>
);

export default GhostButton;
