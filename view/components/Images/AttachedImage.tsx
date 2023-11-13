import { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { AttachedImageFragment } from '../../graphql/images/fragments/gen/AttachedImage.gen';
import { useImageSrc } from '../../hooks/image.hooks';
import { useIsDesktop } from '../../hooks/shared.hooks';

interface Props {
  image: AttachedImageFragment;
  marginBottom?: string | number;
  width?: string | number;
}

const AttachedImage = ({ image, marginBottom, width = '100%' }: Props) => {
  const [isLoading, setIsLoaded] = useState(true);
  const isDesktop = useIsDesktop();
  const src = useImageSrc(image.id);

  const loadingHeight = isDesktop ? '500px' : '200px';

  return (
    <LazyLoadImage
      src={src}
      effect="blur"
      width={width}
      height={isLoading ? loadingHeight : 'auto'}
      style={{ display: 'block', marginBottom }}
      onLoad={() => setIsLoaded(false)}
      alt={image.filename}
    />
  );
};

export default AttachedImage;
