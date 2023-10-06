import { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { AttachedImageFragment } from '../../apollo/images/generated/AttachedImage.fragment';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { getImagePath } from '../../utils/image.utils';

interface Props {
  image: AttachedImageFragment;
  marginBottom?: string | number;
  width?: string | number;
}

const AttachedImage = ({ image, marginBottom, width = '100%' }: Props) => {
  const [isLoading, setIsLoaded] = useState(true);
  const isDesktop = useIsDesktop();

  const loadingHeight = isDesktop ? '500px' : '200px';

  return (
    <LazyLoadImage
      alt={image.filename}
      effect="blur"
      width={width}
      height={isLoading ? loadingHeight : 'auto'}
      onLoad={() => setIsLoaded(false)}
      src={getImagePath(image.id)}
      style={{ display: 'block', marginBottom }}
    />
  );
};

export default AttachedImage;
