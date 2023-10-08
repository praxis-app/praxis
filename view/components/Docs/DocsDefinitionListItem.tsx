import { Box } from '@mui/material';
import { ReactNode } from 'react';

interface Props {
  name: string;
  children: ReactNode;
}

const DocsDefinitionListItem = ({ name, children }: Props) => (
  <Box component="li" marginBottom={1.5}>
    <Box component="span" sx={{ fontFamily: 'Inter Bold' }}>
      {name}
    </Box>{' '}
    - {children}
  </Box>
);

export default DocsDefinitionListItem;
