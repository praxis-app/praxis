import { createContext, useContext } from 'react';

interface SearchPanelState {
  isOpen: boolean;
  open: (channelId?: string) => void;
  close: () => void;
}

export const SearchPanelContext = createContext<SearchPanelState>({
  isOpen: false,
  open: () => undefined,
  close: () => undefined,
});

export const useSearchPanel = () => useContext(SearchPanelContext);
