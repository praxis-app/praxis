import { Box, BoxProps } from '@mui/material';
import { AttachedImageFragment } from '../../apollo/images/generated/AttachedImage.fragment';
import AttachedImage from './AttachedImage';

interface Props extends Omit<BoxProps, 'children'> {
  images: AttachedImageFragment[];
}

const AttachedImageList = ({ images, sx, ...boxProps }: Props) => (
  <Box sx={{ marginX: -2, ...sx }} {...boxProps}>
    {images.map((image, index) => (
      <AttachedImage
        image={image}
        key={image.id}
        marginBottom={index + 1 === images.length ? undefined : 2}
      />
    ))}
  </Box>
);

export default AttachedImageList;
