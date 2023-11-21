import { RefObject, useEffect, useState } from 'react';
import { API_ROOT } from '../constants/shared.constants';
import { getAuthHeader } from '../graphql/client';
import { useInView } from './shared.hooks';

// TODO: Extract getImageSrc as a utility function
export const useImageSrc = (
  imageId: number | undefined,
  ref: RefObject<HTMLElement>,
) => {
  const [src, setSrc] = useState<string>();
  const isInView = useInView(ref);

  useEffect(() => {
    if (!imageId || !isInView) {
      return;
    }
    const getImageSrc = async () => {
      const imagePath = `${API_ROOT}/images/${imageId}/view`;
      const headers = { headers: { ...getAuthHeader() } };
      const result = await fetch(imagePath, headers);
      const blob = await result.blob();
      const url = URL.createObjectURL(blob);

      setSrc(url);
    };
    getImageSrc();
  }, [imageId, isInView]);

  return src;
};
