import { useSearchPanel } from '@/hooks/use-search-panel';
import { NavSheet } from '@/components/nav/nav-sheet';
import { SearchDialog } from '@/components/search/search-dialog';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BrowserEvents, KeyCodes } from '@/constants/shared.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { useServerData } from '@/hooks/use-server-data';
import { cn } from '@/lib/shared.utils';
import { useNavStore } from '@/store/nav.store';
import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuArrowLeft, LuListTodo } from 'react-icons/lu';
import { MdSearch } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

interface Props {
  header?: string;
  subheader?: ReactNode;
  subheaderAboveHeader?: boolean;
  onBackClick?: () => void;
  backBtnIcon?: ReactNode;
  goBackOnEscape?: boolean;
  showSearch?: boolean;
  hideBackButtonOnDesktop?: boolean;
  isDecisionsPanelOpen?: boolean;
  onToggleDecisionsPanel?: () => void;
}

export const TopNav = ({
  header,
  subheader,
  subheaderAboveHeader = false,
  onBackClick,
  backBtnIcon,
  goBackOnEscape = false,
  showSearch = true,
  hideBackButtonOnDesktop = false,
  isDecisionsPanelOpen = false,
  onToggleDecisionsPanel,
}: Props) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { isNavSheetOpen, setIsNavSheetOpen } = useNavStore();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const searchPanel = useSearchPanel();
  const navigate = useNavigate();

  const { isRegistered } = useAuthData();
  const { serverPath } = useServerData();
  const canSearch = showSearch && isRegistered;

  const handleBackClick = useCallback(
    (isEscapeKey = false) => {
      if (onBackClick) {
        onBackClick();
        return;
      }
      if (isDesktop) {
        navigate(serverPath);
        return;
      }
      if (isEscapeKey) {
        return;
      }
      setIsNavSheetOpen(true);
    },
    [isDesktop, navigate, onBackClick, serverPath, setIsNavSheetOpen],
  );

  // Handle escape key to go back or open nav sheet
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === KeyCodes.Escape && goBackOnEscape) {
        if (isNavSheetOpen) {
          setIsNavSheetOpen(false);
        } else {
          handleBackClick(true);
        }
      }
    };
    window.addEventListener(BrowserEvents.Keydown, handleKeyDown);
    return () => {
      window.removeEventListener(BrowserEvents.Keydown, handleKeyDown);
    };
  }, [handleBackClick, isNavSheetOpen, setIsNavSheetOpen, goBackOnEscape]);

  const renderBackBtn = () => {
    if (isDesktop && hideBackButtonOnDesktop) return null;

    const renderBtn = (label?: string) => (
      <Button
        variant="ghost"
        size="icon"
        aria-label={label}
        onClick={() => handleBackClick()}
      >
        {backBtnIcon || <LuArrowLeft className="size-6" />}
      </Button>
    );

    if (!isDesktop && !onBackClick) {
      return (
        <NavSheet trigger={renderBtn(t('navigation.actions.openNavSheet'))} />
      );
    }

    return renderBtn();
  };

  const renderSubheader = () =>
    subheader && (
      <div className="text-muted-foreground truncate text-xs">{subheader}</div>
    );

  return (
    <header
      className={cn(
        'flex h-13.75 items-center justify-between border-b border-[--color-border]',
        isDesktop && hideBackButtonOnDesktop ? 'px-6' : 'px-2',
      )}
    >
      <div className="mr-1 flex min-w-0 flex-1 items-center gap-2.5">
        {renderBackBtn()}

        <div className="min-w-0 flex-1 select-none">
          {subheaderAboveHeader && renderSubheader()}
          <div className="truncate text-[1.05rem] font-medium">{header}</div>
          {!subheaderAboveHeader && renderSubheader()}
        </div>
      </div>

      <TooltipProvider>
        <div className="flex items-center gap-1">
          {isDesktop && onToggleDecisionsPanel && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  aria-label={t('decisions.actions.togglePanel')}
                  aria-controls="active-decisions-panel"
                  aria-expanded={!searchPanel.isOpen && isDecisionsPanelOpen}
                  onClick={() => {
                    searchPanel.close();
                    if (!searchPanel.isOpen || !isDecisionsPanelOpen) {
                      onToggleDecisionsPanel?.();
                    }
                  }}
                  variant="ghost"
                  size="icon"
                >
                  <LuListTodo className="size-5.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('decisions.actions.panel')}</TooltipContent>
            </Tooltip>
          )}

          {canSearch && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label={t('actions.search')}
                  aria-controls={isDesktop ? 'search-panel' : undefined}
                  aria-expanded={isDesktop ? searchPanel.isOpen : isSearchOpen}
                  onClick={() => {
                    if (isDesktop) {
                      if (searchPanel.isOpen) searchPanel.close();
                      else searchPanel.open();
                    } else {
                      setIsSearchOpen(true);
                    }
                  }}
                  variant="ghost"
                  size="icon"
                >
                  <MdSearch className="size-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('actions.search')}</TooltipContent>
            </Tooltip>
          )}
          {canSearch && (
            <SearchDialog
              open={!isDesktop && isSearchOpen}
              onOpenChange={setIsSearchOpen}
            />
          )}
          <NotificationBell />
        </div>
      </TooltipProvider>
    </header>
  );
};
