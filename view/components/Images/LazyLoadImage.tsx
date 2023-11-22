import { Box, BoxProps, SxProps } from '@mui/material';
import { SyntheticEvent, useState } from 'react';

interface Props extends BoxProps {
  src?: string;
  alt: string;
}

const LazyLoadImage = ({ src, alt, onLoad, ...boxProps }: Props) => {
  const [loaded, setLoaded] = useState(false);

  const imageStyles: SxProps = {
    objectFit: 'cover',
    transition: 'all 0.3s',
    filter: loaded ? 'blur(0)' : 'blur(15px)',
    opacity: loaded ? 1 : 0,
  };

  const handleLoad = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    onLoad && onLoad(event);
    setLoaded(true);
  };

  return (
    <Box {...boxProps}>
      <Box
        alt={alt}
        component="img"
        onLoad={handleLoad}
        src={src}
        sx={imageStyles}
        width="100%"
      />
    </Box>
  );
};

export default LazyLoadImage;
