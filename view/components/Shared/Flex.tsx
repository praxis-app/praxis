import { Box, BoxProps, SxProps } from '@mui/material';
import { ReactNode } from 'react';

export interface FlexProps extends BoxProps {
  children: string | number | ReactNode;
  flexEnd?: boolean;
}

const Flex = ({ children, flexEnd, sx, ...rest }: FlexProps) => {
  const styles: SxProps = flexEnd ? { justifyContent: 'flex-end' } : {};

  return (
    <Box sx={{ display: 'flex', ...styles, ...sx }} {...rest}>
      {children}
    </Box>
  );
};

export default Flex;
