import { useEffect, useState } from 'react';
import { API_ROOT } from '../constants/shared.constants';
import { getAuthHeader } from '../graphql/client';

// TODO: Extract getImageSrc as a utility function
export const useImageSrc = (imageId: number | undefined, skip = false) => {
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    if (!imageId || skip) {
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
  }, [imageId, skip]);

  return src;
};
