import { Box, BoxProps } from '@mui/material';
import { AttachedImageFragment } from '../../graphql/images/fragments/gen/AttachedImage.gen';
import AttachedImage from './AttachedImage';

interface Props extends Omit<BoxProps, 'children'> {
  images: AttachedImageFragment[];
  imageSx?: BoxProps['sx'];
  onImageLoad?(): void;
}

const AttachedImageList = ({
  images,
  sx,
  imageSx,
  onImageLoad,
  ...boxProps
}: Props) => (
  <Box sx={{ marginX: -2, ...sx }} {...boxProps}>
    {images.map((image, index) => (
      <AttachedImage
        key={image.id}
        image={image}
        onImageLoad={onImageLoad}
        sx={{
          marginBottom: index + 1 === images.length ? undefined : 2,
          ...imageSx,
        }}
      />
    ))}
  </Box>
);

export default AttachedImageList;
