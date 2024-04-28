import { Box, BoxProps } from '@mui/material';
import { AttachedImageFragment } from '../../graphql/images/fragments/gen/AttachedImage.gen';
import AttachedImage from './AttachedImage';

interface Props extends Omit<BoxProps, 'children'> {
  images: AttachedImageFragment[];
  attachedImageSx?: BoxProps['sx'];
}

const AttachedImageList = ({
  images,
  sx,
  attachedImageSx,
  ...boxProps
}: Props) => (
  <Box sx={{ marginX: -2, ...sx }} {...boxProps}>
    {images.map((image, index) => (
      <AttachedImage
        key={image.id}
        image={image}
        sx={{
          marginBottom: index + 1 === images.length ? undefined : 2,
          ...attachedImageSx,
        }}
      />
    ))}
  </Box>
);

export default AttachedImageList;
