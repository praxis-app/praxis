import { useReactiveVar } from '@apollo/client';
import { BoxProps } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { imagesVar } from '../../graphql/cache';
import { AttachedImageFragment } from '../../graphql/images/fragments/gen/AttachedImage.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import LazyLoadImage from './LazyLoadImage';

interface Props extends BoxProps {
  image: AttachedImageFragment;
  marginBottom?: string | number;
  width?: string | number;
  onImageLoad?(): void;
}

const AttachedImage = ({
  image,
  marginBottom,
  width = '100%',
  onImageLoad,
  ...boxProps
}: Props) => {
  const images = useReactiveVar(imagesVar);
  const alreadyLoadedSrc = !!(image.id && images[image.id]);
  const [isLoaded, setIsLoaded] = useState(alreadyLoadedSrc);

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const loadingHeight = isDesktop ? '400px' : '200px';
  const height = isLoaded ? 'auto' : loadingHeight;

  const handleLoad = () => {
    onImageLoad?.();
    setIsLoaded(true);
  };

  return (
    <LazyLoadImage
      imageId={image.id}
      alt={t('images.labels.attachedImage')}
      width={width}
      height={height}
      onLoad={handleLoad}
      marginBottom={marginBottom}
      {...boxProps}
    />
  );
};

export default AttachedImage;
