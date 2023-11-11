import { API_ROOT } from '../constants/shared.constants';

const VALID_IMAGE_FORMAT = /(jpe?g|png|gif|webp)$/;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_COUNT = 5;

export const validateImageInput = (imageInput: File | File[]) => {
  const images = Array.isArray(imageInput) ? imageInput : [imageInput];

  if (images.length > MAX_IMAGE_COUNT) {
    throw new Error(`You can upload a maximum of ${MAX_IMAGE_COUNT} images`);
  }

  for (const image of images) {
    const extension = image.type.split('/')[1];

    if (!extension.match(VALID_IMAGE_FORMAT)) {
      throw new Error(`${extension.toUpperCase()} images are not supported`);
    }
    if (image.size > MAX_IMAGE_SIZE) {
      throw new Error('Image is too large. Maximum file size is 10MB.');
    }
  }
};

export const getImagePath = (imageId: number) =>
  `${API_ROOT}/images/${imageId}/view`;
