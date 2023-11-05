import { Box, BoxProps } from '@mui/material';
import sanitizeHtml from 'sanitize-html';

const SANITIZE_OPTIONS = {
  allowedTags: ['a'],
  allowedAttributes: { a: ['href', 'rel', 'target', 'style'] },
};

const sanitize = (dirty: string) => ({
  __html: sanitizeHtml(dirty, SANITIZE_OPTIONS),
});

interface Props extends BoxProps {
  html: string;
}

const SanitizedHtml = ({ html, ...boxProps }: Props) => {
  return (
    <Box
      component="span"
      dangerouslySetInnerHTML={sanitize(html)}
      {...boxProps}
    />
  );
};

export default SanitizedHtml;
