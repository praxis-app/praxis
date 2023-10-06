import { Box } from '@mui/material';
import ExternalLink from '../Shared/ExternalLink';
import Link from '../Shared/Link';

interface Props {
  external?: boolean;
  href: string;
  text: string;
}

const DocsLink = ({ href, text, external }: Props) => {
  if (external) {
    return (
      <ExternalLink href={href} leftSpace>
        <Box component="span" sx={{ fontFamily: 'Inter Bold' }}>
          {text}
        </Box>
      </ExternalLink>
    );
  }
  return (
    <Link href={href} leftSpace>
      <Box component="span" sx={{ fontFamily: 'Inter Bold' }}>
        {text}
      </Box>
    </Link>
  );
};

export default DocsLink;
