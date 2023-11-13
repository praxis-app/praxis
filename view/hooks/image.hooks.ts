import { useEffect, useState } from 'react';
import { getImagePath } from '../utils/image.utils';
import { getAuthHeader } from '../graphql/client';

export const useImageSrc = (imageId: number | undefined) => {
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    if (!imageId) {
      return;
    }
    const getImageSrc = async () => {
      const imagePath = getImagePath(imageId);
      const headers = { headers: { ...getAuthHeader() } };
      const result = await fetch(imagePath, headers);
      const blob = await result.blob();
      const url = URL.createObjectURL(blob);
      setSrc(url);
    };
    getImageSrc();
  }, [imageId]);

  return src;
};
