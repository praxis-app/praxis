import { Box, BoxProps, SxProps } from '@mui/material';
import { SyntheticEvent, useRef, useState } from 'react';
import { useImageSrc } from '../../hooks/image.hooks';

interface Props extends BoxProps {
  alt: string;
  imageId?: number;
  src?: string;
}

const LazyLoadImage = ({
  alt,
  imageId,
  onLoad,
  src,
  borderRadius,
  ...boxProps
}: Props) => {
  const [loaded, setLoaded] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const srcFromImageId = useImageSrc(imageId, ref);

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
    <Box ref={ref} {...boxProps}>
      <Box
        alt={alt}
        borderRadius={borderRadius}
        component="img"
        loading={src ? 'lazy' : 'eager'}
        onLoad={handleLoad}
        src={src || srcFromImageId}
        sx={imageStyles}
        width="100%"
        height="100%"
      />
    </Box>
  );
};

export default LazyLoadImage;
