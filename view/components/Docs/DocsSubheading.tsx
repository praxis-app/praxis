import { Divider, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

const DocsSubheading = ({ children }: Props) => (
  <>
    <Typography variant="h5" marginBottom={1}>
      {children}
    </Typography>

    <Divider sx={{ marginBottom: 2.5 }} />
  </>
);

export default DocsSubheading;
