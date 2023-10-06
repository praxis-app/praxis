import { Box, SxProps } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useTranslation } from 'react-i18next';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { getImagePath } from '../../utils/image.utils';

interface Props {
  imageFile?: File;
  imageId?: number;
  rounded?: boolean;
  sx?: SxProps;
  topRounded?: boolean;
}

const CoverPhoto = ({ imageFile, imageId, rounded, topRounded, sx }: Props) => {
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
      return { borderTopLeftRadius: '8px', borderTopRightRadius: '8px' };
    }
  };

  const sharedBoxStyles = {
    height: isDesktop ? 210 : 130,
    ...getBorderRadius(),
    ...sx,
  };

  if (!getImageSrc()) {
    return (
      <Box
        sx={{
          backgroundColor: grey[900],
          ...sharedBoxStyles,
        }}
      ></Box>
    );
  }

  return (
    <Box
      sx={{
        overflowY: 'hidden',
        ...sharedBoxStyles,
      }}
    >
      <LazyLoadImage
        alt={t('images.labels.coverPhoto')}
        effect="blur"
        height="auto"
        src={getImageSrc()}
        style={{ marginTop: '-25%' }}
        visibleByDefault={!imageId}
        width="100%"
      />
    </Box>
  );
};

export default CoverPhoto;
