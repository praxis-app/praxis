import { Grid, GridProps } from '@mui/material';
import { ReactNode } from 'react';

interface Props extends GridProps {
  children: ReactNode;
}

const Center = ({ children, ...gridProps }: Props) => (
  <Grid container justifyContent="center" {...gridProps}>
    {children}
  </Grid>
);

export default Center;
