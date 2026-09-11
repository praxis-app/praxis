import { type ChangeEvent, type ReactNode, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { MdImage } from 'react-icons/md';
import { cn } from '@/lib/shared.utils';

interface Props {
  multiple?: boolean;
  name?: string;
  onChange?: (images: File[]) => void;
  setImage?: (image: File) => void;
  setImages?: (images: File[]) => void;
  iconClassName?: string;
  children?: ReactNode;
  disabled?: boolean;
}

export const ImageInput = ({
  children,
  multiple,
  name,
  onChange,
  setImage,
  setImages,
  iconClassName,
  disabled = false,
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

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (disabled || !imageInput.current) {
      return;
    }
    imageInput.current.click();
  };

  const renderContent = () => {
    if (children) {
      return children;
    }
    return (
      <Button
        aria-label={t('images.labels.attachImages')}
        disabled={disabled}
        variant="ghost"
        size="icon"
        className="rounded-full"
      >
        <MdImage
          className={cn('text-muted-foreground size-6', iconClassName)}
        />
      </Button>
    );
  };

  return (
    <>
      <input
        data-testid="image-input"
        accept="image/*"
        multiple={multiple}
        name={name}
        onChange={handleChange}
        disabled={disabled}
        ref={imageInput}
        style={{ display: 'none' }}
        type="file"
      />
      <div onClick={handleClick}>{renderContent()}</div>
    </>
  );
};
