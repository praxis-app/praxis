import { SearchPanel } from '@/components/search/search-panel';
import { ResizablePanel } from '@/components/shared/resizable-panel/resizable-panel';
import { useAuthData } from '@/hooks/use-auth-data';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { SearchPanelContext } from '@/hooks/use-search-panel';
import {
  SEARCH_CHANNEL_PARAM,
  SEARCH_PANEL_PARAM,
  SEARCH_PANEL_RIGHT,
} from '@/constants/search.constants';
import { withoutSearchPanel } from '@/lib/search.utils';
import { type ComponentProps, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

type Props = Partial<Omit<ComponentProps<typeof ResizablePanel>, 'children'>> &
  Pick<ComponentProps<typeof ResizablePanel>, 'children'> & {
    pageLayout?: boolean;
  };

export const SearchPanelLayout = ({
  children,
  pageLayout = false,
  ...props
}: Props) => {
  const triggerRef = useRef<HTMLElement | null>(null);
  const isDesktop = useIsDesktop();
  const { isRegistered } = useAuthData();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  const layout = pageLayout ? 'page' : SEARCH_PANEL_RIGHT;
  const isOpen =
    isDesktop &&
    isRegistered &&
    searchParams.get(SEARCH_PANEL_PARAM) === layout;
  const close = () => {
    if (!isOpen) return;
    setSearchParams(withoutSearchPanel(searchParams), { replace: true });
    triggerRef.current?.focus();
  };

  return (
    <SearchPanelContext.Provider
      value={{
        isOpen,
        open: (channelId) => {
          triggerRef.current = document.activeElement as HTMLElement | null;
          const nextParams = withoutSearchPanel(searchParams);
          nextParams.set(SEARCH_PANEL_PARAM, layout);
          if (channelId) nextParams.set(SEARCH_CHANNEL_PARAM, channelId);
          setSearchParams(nextParams, { replace: true });
        },
        close,
      }}
    >
      <div
        className={
          pageLayout ? (isOpen ? 'fixed inset-0' : undefined) : 'contents'
        }
      >
        <ResizablePanel
          panelType="search"
          resizeHandleLabel={t('actions.resizeRightPanel')}
          defaultSize={480}
          minSize="18rem"
          maxSize="70%"
          position="right"
          {...props}
          {...(isOpen
            ? {
                panel: <SearchPanel onClose={close} />,
                panelType: 'search',
                defaultSize: 480,
              }
            : {})}
        >
          {pageLayout ? (
            <div className={isOpen ? 'h-full overflow-y-auto' : undefined}>
              {children}
            </div>
          ) : (
            children
          )}
        </ResizablePanel>
      </div>
    </SearchPanelContext.Provider>
  );
};
