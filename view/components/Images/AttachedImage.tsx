import { Box } from '@mui/material';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AttachedImageFragment } from '../../graphql/images/fragments/gen/AttachedImage.gen';
import { useImageSrc } from '../../hooks/image.hooks';
import { useIsDesktop } from '../../hooks/shared.hooks';
import LazyLoadImage from './LazyLoadImage';

interface Props {
  image: AttachedImageFragment;
  marginBottom?: string | number;
  width?: string | number;
}

const AttachedImage = ({ image, marginBottom, width = '100%' }: Props) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const src = useImageSrc(image.id, ref);
  const { t } = useTranslation();

  const isDesktop = useIsDesktop();
  const loadingHeight = isDesktop ? '400px' : '200px';

  return (
    <Box ref={ref}>
      <LazyLoadImage
        src={src}
        alt={t('images.labels.attachedImage')}
        width={width}
        height={isLoaded ? 'auto' : loadingHeight}
        onLoad={() => setIsLoaded(true)}
        marginBottom={marginBottom}
      />
    </Box>
  );
};

export default AttachedImage;
