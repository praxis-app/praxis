import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AttachedImageFragment } from '../../graphql/images/fragments/gen/AttachedImage.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import LazyLoadImage from './LazyLoadImage';

interface Props {
  image: AttachedImageFragment;
  marginBottom?: string | number;
  width?: string | number;
}

const AttachedImage = ({ image, marginBottom, width = '100%' }: Props) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const { t } = useTranslation();

  const isDesktop = useIsDesktop();
  const loadingHeight = isDesktop ? '400px' : '200px';

  return (
    <LazyLoadImage
      imageId={image.id}
      alt={t('images.labels.attachedImage')}
      width={width}
      height={isLoaded ? 'auto' : loadingHeight}
      onLoad={() => setIsLoaded(true)}
      marginBottom={marginBottom}
    />
  );
};

export default AttachedImage;
