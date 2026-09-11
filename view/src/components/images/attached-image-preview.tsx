import { useImageSrc } from '@/hooks/use-image-src';
import { cn } from '@/lib/shared.utils';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MdRemoveCircle } from 'react-icons/md';
import { type ImageRes } from '../../types/image.types';
import { Button } from '../ui/button';
import { ImageUploadOverlay } from './image-upload-overlay';

const RemoveButton = ({
  onClick,
  disabled,
}: {
  onClick(): void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <Button
      aria-label={t('images.labels.removeImage')}
      onClick={onClick}
      variant="ghost"
      size="icon"
      className="absolute -top-4.5 -right-4.5 rounded-full"
      disabled={disabled}
    >
      <MdRemoveCircle className="size-6" />
    </Button>
  );
};

const SavedImagePreview = ({
  savedImage,
  channelId,
  messageId,
  pollId,
  handleDelete,
  className,
  imageClassName,
  disabled,
}: {
  savedImage: ImageRes;
  channelId?: string;
  messageId?: string;
  pollId?: string;
  className?: string;
  imageClassName?: string;
  handleDelete?(id: string): void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation();

  const ref = useRef<HTMLDivElement>(null);
  const src = useImageSrc({
    imageId: savedImage.id,
    ref,
    channelId,
    messageId,
    pollId,
  });

  return (
    <div ref={ref} className={cn(className, disabled && 'opacity-50')}>
      <img
        alt={t('images.labels.attachedImage')}
        src={src}
        width="100%"
        className={imageClassName}
      />
      {handleDelete && (
        <RemoveButton
          onClick={() => handleDelete(savedImage.id)}
          disabled={disabled}
        />
      )}
    </div>
  );
};

interface Props {
  handleDelete?: (id: string) => void;
  handleRemove?: (imageName: string) => void;
  imageContainerClassName?: string;
  imageClassName?: string;
  savedImages?: ImageRes[];
  selectedImages: File[];
  className?: string;
  isUploading?: boolean;
  uploadProgress?: number;
  channelId?: string;
  messageId?: string;
  pollId?: string;
  disabled?: boolean;
}

export const AttachedImagePreview = ({
  handleDelete,
  handleRemove,
  imageContainerClassName,
  imageClassName,
  savedImages,
  selectedImages,
  className,
  channelId,
  messageId,
  pollId,
  disabled,
  isUploading,
  uploadProgress,
}: Props) => {
  const { t } = useTranslation();

  const containerClassName = cn(
    'mb-2 mr-3.5 relative w-42.5',
    imageContainerClassName,
  );

  return (
    <div
      data-testid="attached-image-preview"
      aria-label={t('images.labels.attachedImagePreview')}
      role="img"
      className={cn('mt-2 flex flex-wrap', className)}
    >
      {savedImages &&
        savedImages.map((savedImage) => (
          <SavedImagePreview
            key={savedImage.id}
            disabled={disabled}
            className={containerClassName}
            imageClassName={imageClassName}
            handleDelete={handleDelete}
            savedImage={savedImage}
            channelId={channelId}
            messageId={messageId}
            pollId={pollId}
          />
        ))}

      {selectedImages.map((image) => (
        <div
          className={cn(
            containerClassName,
            disabled && !isUploading && 'opacity-50',
          )}
          key={image.name}
        >
          <img
            alt={image.name}
            src={URL.createObjectURL(image)}
            width="100%"
            className={imageClassName}
          />
          {isUploading && <ImageUploadOverlay progress={uploadProgress} />}
          {handleRemove && !isUploading && (
            <RemoveButton
              onClick={() => handleRemove(image.name)}
              disabled={disabled}
            />
          )}
        </div>
      ))}
    </div>
  );
};
