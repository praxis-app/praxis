import { useEffect, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { AttachedImageFragment } from '../../graphql/images/fragments/gen/AttachedImage.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { getImagePath } from '../../utils/image.utils';

interface Props {
  image: AttachedImageFragment;
  marginBottom?: string | number;
  width?: string | number;
}

const AttachedImage = ({ image, marginBottom, width = '100%' }: Props) => {
  const [isLoading, setIsLoaded] = useState(true);
  const [src, setSrc] = useState<string>();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    const getImageSrc = async () => {
      const imagePath = getImagePath(image.id);
      const response = await fetch(imagePath, { headers: {} });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setSrc(url);
    };
    getImageSrc();
  }, [image]);

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
