import { Box, SxProps } from '@mui/material';
import { grey } from '@mui/material/colors';
import { SyntheticEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { getImagePath } from '../../utils/image.utils';

const CP_CONTAINER_HEIGHT = 130;
const CP_CONTAINER_HEIGHT_DESKTOP = 210;

interface Props {
  imageFile?: File;
  imageId?: number;
  rounded?: boolean;
  sx?: SxProps;
  topRounded?: boolean;
}

const CoverPhoto = ({ imageFile, imageId, rounded, topRounded, sx }: Props) => {
  const [imageTopMargin, setImageTopMargin] = useState<number>();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const getImageSrc = () => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }
    if (imageId) {
      return getImagePath(imageId);
    }
    return '';
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
    return (
      <Box
        sx={{
          backgroundColor: grey[900],
          ...sharedBoxStyles,
        }}
      />
    );
  }

  return (
    <Box sx={{ overflowY: 'hidden', ...sharedBoxStyles }}>
      <LazyLoadImage
        alt={t('images.labels.coverPhoto')}
        effect="blur"
        height="auto"
        src={getImageSrc()}
        style={{ marginTop: imageTopMargin }}
        onLoadCapture={handleLoad}
        visibleByDefault={!imageId}
        width="100%"
      />
    </Box>
  );
};

export default CoverPhoto;
