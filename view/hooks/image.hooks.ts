import { useReactiveVar } from '@apollo/client';
import { RefObject, useEffect } from 'react';
import { API_ROOT } from '../constants/shared.constants';
import { imagesVar } from '../graphql/cache';
import { getAuthHeader } from '../graphql/client';
import { useInView } from './shared.hooks';

export const useImageSrc = (
  imageId: number | undefined,
  ref: RefObject<HTMLElement>,
) => {
  const images = useReactiveVar(imagesVar);
  const src = imageId ? images[imageId] : undefined;
  const [, viewed] = useInView(ref);

  useEffect(() => {
    if (!imageId || !viewed || src) {
      return;
    }
    const getImageSrc = async () => {
      const imagePath = `${API_ROOT}/images/${imageId}/view`;
      const headers = { headers: { ...getAuthHeader() } };
      const result = await fetch(imagePath, headers);
      const blob = await result.blob();
      const url = URL.createObjectURL(blob);

      imagesVar({ ...imagesVar(), [imageId]: url });
    };
    getImageSrc();
  }, [imageId, viewed, src]);

  return src;
};
