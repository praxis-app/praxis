import { LocalStorageKeys } from '@/constants/shared.constants';

export type ResizablePanelType =
  | 'activeDecisions'
  | 'callChat'
  | 'callDecisions'
  | 'channelsList'
  | 'search'
  | 'thread'
  | 'forumPost';

type PanelWidths = Partial<Record<ResizablePanelType, number>>;

const getStoredPanelWidths = (): PanelWidths => {
  try {
    const stored = JSON.parse(
      localStorage.getItem(LocalStorageKeys.PanelWidths) || '{}',
    ) as unknown;
    return stored && typeof stored === 'object' ? (stored as PanelWidths) : {};
  } catch {
    return {};
  }
};

export const getStoredPanelWidth = (panelType: ResizablePanelType) => {
  const width = getStoredPanelWidths()[panelType];
  return typeof width === 'number' && Number.isFinite(width) ? width : null;
};

export const savePanelWidth = (
  panelType: ResizablePanelType,
  width: number,
) => {
  localStorage.setItem(
    LocalStorageKeys.PanelWidths,
    JSON.stringify({
      ...getStoredPanelWidths(),
      [panelType]: Math.round(width),
    }),
  );
};
