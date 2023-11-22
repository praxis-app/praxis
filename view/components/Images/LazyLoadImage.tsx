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
  sx,
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
    ...sx,
  };

  const handleLoad = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    onLoad && onLoad(event);
    setLoaded(true);
  };

  return (
    <Box
      ref={ref}
      alt={alt}
      component="img"
      loading={src ? 'lazy' : 'eager'}
      onLoad={handleLoad}
      src={src || srcFromImageId}
      sx={imageStyles}
      {...boxProps}
    />
  );
};

export default LazyLoadImage;
