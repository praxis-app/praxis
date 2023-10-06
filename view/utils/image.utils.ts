import { API_ROOT } from '../constants/shared.constants';

export const getImagePath = (imageId: number) =>
  `${API_ROOT}/images/${imageId}/view`;
