import { BoxProps } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AttachedImageFragment } from '../../graphql/images/fragments/gen/AttachedImage.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import LazyLoadImage from './LazyLoadImage';

interface Props extends BoxProps {
  image: AttachedImageFragment;
  marginBottom?: string | number;
  width?: string | number;
}

const AttachedImage = ({
  image,
  marginBottom,
  width = '100%',
  ...boxProps
}: Props) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const loadingHeight = isDesktop ? '400px' : '200px';
  const height = isLoaded ? 'auto' : loadingHeight;

  return (
    <LazyLoadImage
      imageId={image.id}
      alt={t('images.labels.attachedImage')}
      width={width}
      height={height}
      onLoad={() => setIsLoaded(true)}
      marginBottom={marginBottom}
      {...boxProps}
    />
  );
};

export default AttachedImage;
