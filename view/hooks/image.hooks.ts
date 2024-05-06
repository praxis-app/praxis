import { useReactiveVar } from '@apollo/client';
import { RefObject, useEffect, useState } from 'react';
import { API_ROOT } from '../constants/shared.constants';
import { imagesVar } from '../graphql/cache';
import { getAuthHeader } from '../graphql/client';
import { useInView } from './shared.hooks';

export const useImageSrc = (
  imageId: number | undefined,
  ref: RefObject<HTMLElement>,
) => {
  const images = useReactiveVar(imagesVar);
  const [src, setSrc] = useState<string>();
  const { viewed } = useInView(ref, '100px');

  useEffect(() => {
    if (!imageId || !viewed) {
      return;
    }
    if (images[imageId]) {
      setSrc(images[imageId]);
      return;
    }
    const getImageSrc = async () => {
      const imagePath = `${API_ROOT}/images/${imageId}/view`;
      const headers = { headers: { ...getAuthHeader() } };
      const result = await fetch(imagePath, headers);
      const blob = await result.blob();
      const url = URL.createObjectURL(blob);

      imagesVar({ ...imagesVar(), [imageId]: url });
      setSrc(url);
    };
    getImageSrc();
  }, [imageId, viewed, images]);

  return src;
};
