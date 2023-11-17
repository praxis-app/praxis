import { Box, SxProps } from '@mui/material';
import { grey } from '@mui/material/colors';
import { SyntheticEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useImageSrc } from '../../hooks/image.hooks';
import { useIsDesktop } from '../../hooks/shared.hooks';

const CP_CONTAINER_HEIGHT = 130;
const CP_CONTAINER_HEIGHT_DESKTOP = 210;

interface Props {
  centerVertically?: boolean;
  imageFile?: File;
  imageId?: number;
  rounded?: boolean;
  topRounded?: boolean;
  sx?: SxProps;
}

const CoverPhoto = ({
  rounded = false,
  topRounded = false,
  centerVertically = true,
  imageFile,
  imageId,
  sx,
}: Props) => {
  const [imageTopMargin, setImageTopMargin] = useState<number>();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const src = useImageSrc(imageId);

  const getImageSrc = () => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }
    return src;
  };

  const getBorderRadius = () => {
    if (rounded) {
      return { borderRadius: '8px' };
    }
    if (topRounded) {
      return {
        borderTopRightRadius: '8px',
        borderTopLeftRadius: '8px',
      };
    }
  };

  const sharedBoxStyles = {
    height: isDesktop ? CP_CONTAINER_HEIGHT_DESKTOP : CP_CONTAINER_HEIGHT,
    ...getBorderRadius(),
    ...sx,
  };

  const handleLoad = ({ target }: SyntheticEvent<HTMLImageElement>) => {
    const { offsetHeight } = target as HTMLImageElement;
    const containerHeight = isDesktop
      ? CP_CONTAINER_HEIGHT_DESKTOP
      : CP_CONTAINER_HEIGHT;

    const difference = containerHeight - offsetHeight;
    setImageTopMargin(difference / 2);
  };

  if (!getImageSrc()) {
    return <Box bgcolor={grey[900]} sx={{ ...sharedBoxStyles }} />;
  }

  return (
    <Box sx={{ overflowY: 'hidden', ...sharedBoxStyles }}>
      <LazyLoadImage
        alt={t('images.labels.coverPhoto')}
        effect="blur"
        width="100%"
        height={centerVertically ? 'auto' : '100%'}
        style={centerVertically ? { marginTop: imageTopMargin } : undefined}
        src={getImageSrc()}
        onLoadCapture={handleLoad}
        visibleByDefault={!imageId}
      />
    </Box>
  );
};

export default CoverPhoto;
