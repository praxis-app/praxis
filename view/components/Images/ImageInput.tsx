// TODO: Research alternatives or libraries for image inputs
// TODO: Remove unneeded refreshKey prop - use key prop instead

import { Image } from '@mui/icons-material';
import { Box, BoxProps, IconButton, SxProps } from '@mui/material';
import { ChangeEvent, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends Omit<BoxProps, 'onChange'> {
  multiple?: boolean;
  name?: string;
  onChange?: (images: File[]) => void;
  refreshKey?: string;
  setImage?: (image: File) => void;
  setImages?: (images: File[]) => void;
  iconStyles?: SxProps;
}

const ImageInput = ({
  children,
  multiple,
  name,
  onChange,
  refreshKey,
  setImage,
  setImages,
  iconStyles,
  ...boxProps
}: Props) => {
  const imageInput = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const setImageState = (files: File[]) => {
    if (multiple && setImages) {
      setImages(files);
    } else if (setImage) {
      setImage(files[0]);
    }
  };

  const handleChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(target.files || []);
    setImageState(files);

    if (onChange) {
      onChange(files);
    }
  };

  const renderContent = () => {
    if (children) {
      return children;
    }
    return (
      <IconButton
        aria-label={t('images.labels.attachImages')}
        disableRipple
        edge="start"
      >
        <Image sx={{ fontSize: 40, ...iconStyles }} />
      </IconButton>
    );
  };

  return (
    <Box marginTop={0.35} {...boxProps}>
      <input
        accept="image/*"
        key={refreshKey}
        multiple={multiple}
        name={name}
        onChange={handleChange}
        ref={imageInput}
        style={{ display: 'none' }}
        type="file"
      />
      <Box onClick={() => imageInput.current?.click()}>{renderContent()}</Box>
    </Box>
  );
};

export default ImageInput;
