import { RefObject, useEffect, useState } from 'react';
import { API_ROOT } from '../constants/shared.constants';
import { getAuthHeader } from '../graphql/client';
import { useInView } from './shared.hooks';

export const useImageSrc = (
  imageId: number | undefined,
  ref: RefObject<HTMLElement>,
) => {
  const [src, setSrc] = useState<string>();
  const [, viewed] = useInView(ref);

  useEffect(() => {
    if (!imageId || !viewed) {
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
  }, [imageId, viewed]);

  return src;
};
