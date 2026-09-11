import { t } from '@/lib/shared.utils';

const VALID_IMAGE_FORMAT = /(jpe?g|png|gif|webp)$/;
const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_IMAGE_COUNT = 4;

export const validateImageInput = (imageInput: File | File[]) => {
  const images = Array.isArray(imageInput) ? imageInput : [imageInput];

  if (images.length > MAX_IMAGE_COUNT) {
    throw new Error(t('images.errors.tooManyImages'));
  }

  for (const image of images) {
    const extension = image.type.split('/')[1];

    if (!extension.match(VALID_IMAGE_FORMAT)) {
      throw new Error(
        t('images.errors.unsupportedFormat', {
          format: extension.toUpperCase(),
        }),
      );
    }
    if (image.size > MAX_IMAGE_SIZE) {
      throw new Error(t('images.errors.imageTooLarge'));
    }
  }
};
