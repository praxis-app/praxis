import { Link as MuiLink, SxProps } from '@mui/material';
import { ReactNode } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';

interface Props {
  children: ReactNode;
  disabled?: boolean;
  href: string;
  leftSpace?: boolean;
  sx?: SxProps;
}

const Link = ({ children, disabled, href, leftSpace, sx }: Props) => (
  <MuiLink
    component={ReactRouterLink}
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
