import { Box, SxProps } from '@mui/material';
import { SyntheticEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsDesktop } from '../../hooks/shared.hooks';
import LazyLoadImage from './LazyLoadImage';

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

  const getImageFileSrc = () => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }
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

  const containerStyles: SxProps = {
    height: isDesktop ? CP_CONTAINER_HEIGHT_DESKTOP : CP_CONTAINER_HEIGHT,
    bgcolor: 'grey.900',
    overflowY: 'hidden',
    ...getBorderRadius(),
    ...sx,
  };

  const imageStyles: SxProps = {
    transform: centerVertically ? `translateY(${imageTopMargin}px)` : undefined,
  };

  const handleLoad = ({ target }: SyntheticEvent<HTMLImageElement>) => {
    const { offsetHeight } = target as HTMLImageElement;
    const containerHeight = isDesktop
      ? CP_CONTAINER_HEIGHT_DESKTOP
      : CP_CONTAINER_HEIGHT;

    const difference = containerHeight - offsetHeight;
    setImageTopMargin(difference / 2);
  };

  return (
    <Box sx={containerStyles}>
      <LazyLoadImage
        alt={t('images.labels.coverPhoto')}
        height={centerVertically ? 'auto' : '100%'}
        imageId={imageId}
        onLoadCapture={handleLoad}
        src={getImageFileSrc()}
        sx={imageStyles}
        width="100%"
      />
    </Box>
  );
};

export default CoverPhoto;
