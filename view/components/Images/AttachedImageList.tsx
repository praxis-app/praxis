import { Box, BoxProps, SxProps } from '@mui/material';
import { AttachedImageFragment } from '../../graphql/images/fragments/gen/AttachedImage.gen';
import AttachedImage from './AttachedImage';

interface Props extends Omit<BoxProps, 'children'> {
  images: AttachedImageFragment[];
  imageSx?: SxProps;
  onImageLoad?(): void;
  topRounded?: boolean;
  fillCard?: boolean;
}

const AttachedImageList = ({
  images,
  imageSx,
  onImageLoad,
  topRounded,
  fillCard,
  sx,
  ...boxProps
}: Props) => {
  const boxStyles: SxProps = {
    marginX: fillCard ? -2 : 0,
    ...sx,
  };

  return (
    <Box sx={boxStyles} {...boxProps}>
      {images.map((image, index) => {
        const imageStyles: SxProps = {
          marginBottom: index + 1 === images.length ? undefined : 2,
          borderTopRightRadius: topRounded && index === 0 ? '7px' : undefined,
          borderTopLeftRadius: topRounded && index === 0 ? '7px' : undefined,
          ...imageSx,
        };

        return (
          <AttachedImage
            key={image.id}
            image={image}
            onImageLoad={onImageLoad}
            sx={imageStyles}
          />
        );
      })}
    </Box>
  );
};

export default AttachedImageList;
