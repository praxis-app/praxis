import { Link, LinkProps, SxProps } from '@mui/material';
import { ReactNode } from 'react';
import { isValidUrl } from '../../utils/shared.utils';

interface Props extends LinkProps {
  children: ReactNode;
  leftSpace?: boolean;
  newTab?: boolean;
}

const ExternalLink = ({
  children,
  href,
  leftSpace,
  newTab = true,
  sx,
  ...linkProps
}: Props) => {
  const isLinkText = typeof children === 'string' && isValidUrl(children);

  const sharedStyles: SxProps = {
    color: 'text.primary',
    textDecoration: 'none',
    textTransform: isLinkText ? 'lowercase' : 'none',
    ...sx,
  };

  if (!newTab) {
    return (
      <Link href={href} sx={sharedStyles} {...linkProps}>
        {leftSpace ? ' ' : ''}
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      rel="noopener noreferrer"
      sx={sharedStyles}
      target="_blank"
      {...linkProps}
    >
      {leftSpace ? ' ' : ''}
      {children}
    </Link>
  );
};

export default ExternalLink;
