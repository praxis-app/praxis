import { Box, BoxProps, SxProps } from '@mui/material';
import { ReactNode, forwardRef } from 'react';

export interface FlexProps extends BoxProps {
  children: string | number | ReactNode;
  flexEnd?: boolean;
}

const Flex = ({ children, flexEnd, sx, ...rest }: FlexProps, ref: any) => {
  const styles: SxProps = flexEnd ? { justifyContent: 'flex-end' } : {};

  return (
    <Box ref={ref} sx={{ display: 'flex', ...styles, ...sx }} {...rest}>
      {children}
    </Box>
  );
};

export default forwardRef(Flex);
