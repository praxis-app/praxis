import { Link as MuiLink, SxProps } from '@mui/material';
import { ReactNode } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';

interface Props {
  children: ReactNode;
  disabled?: boolean;
  href: string;
  leftSpace?: boolean;
  onClick?: () => void;
  sx?: SxProps;
}

const Link = ({ children, disabled, href, leftSpace, onClick, sx }: Props) => (
  <MuiLink
    component={ReactRouterLink}
    onClick={onClick}
    to={href}
    sx={{
      color: 'text.primary',
      pointerEvents: disabled ? 'none' : undefined,
      textDecoration: 'none',
      ...sx,
    }}
  >
    {leftSpace ? ' ' : ''}
    {children}
  </MuiLink>
);

export default Link;
