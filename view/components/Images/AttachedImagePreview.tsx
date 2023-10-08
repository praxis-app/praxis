import { RemoveCircle } from '@mui/icons-material';
import { Box, IconButton, SxProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AttachedImageFragment } from '../../apollo/images/generated/AttachedImage.fragment';
import { getImagePath } from '../../utils/image.utils';

const REMOVE_BUTTON: SxProps = {
  position: 'absolute',
  right: -21,
  top: -21,
};

const RemoveButton = ({ onClick }: { onClick(): void }) => {
  const { t } = useTranslation();
  return (
    <IconButton
      aria-label={t('images.labels.removeImage')}
      onClick={onClick}
      sx={REMOVE_BUTTON}
    >
      <RemoveCircle />
    </IconButton>
  );
};

interface Props {
  handleDelete?: (id: number) => void;
  handleRemove?: (imageName: string) => void;
  imageContainerStyles?: SxProps;
  savedImages?: AttachedImageFragment[];
  selectedImages: File[];
  sx?: SxProps;
}

const AttachedImagePreview = ({
  handleDelete,
  handleRemove,
  imageContainerStyles,
  savedImages,
  selectedImages,
  sx,
}: Props) => {
  const { t } = useTranslation();

  const containerStyles: SxProps = {
    marginBottom: 2.5,
    marginRight: 3.5,
    position: 'relative',
    width: 170,
    ...imageContainerStyles,
  };

  return (
    <Box
      aria-label={t('images.labels.attachedImagePreview')}
      role="img"
      sx={{
        marginTop: 2,
        display: 'flex',
        flexWrap: 'wrap',
        ...sx,
      }}
    >
      {savedImages &&
        savedImages.map(({ id, filename }) => (
          <Box sx={containerStyles} key={id}>
            <img alt={filename} src={getImagePath(id)} width="100%" />
            {handleDelete && <RemoveButton onClick={() => handleDelete(id)} />}
          </Box>
        ))}

      {selectedImages.map((image) => (
        <Box sx={containerStyles} key={image.name}>
          <img alt={image.name} src={URL.createObjectURL(image)} width="100%" />
          {handleRemove && (
            <RemoveButton onClick={() => handleRemove(image.name)} />
          )}
        </Box>
      ))}
    </Box>
  );
};

export default AttachedImagePreview;
