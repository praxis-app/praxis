import { useSearchPanel } from '@/hooks/use-search-panel';
import { ChannelCallButton } from '@/components/calls/channel-call-button';
import { ChannelDetailsDialogDesktop } from '@/components/channels/channel-details-dialog-desktop';
import { ChannelDetailsDrawer } from '@/components/channels/channel-details-drawer';
import { NavSheet } from '@/components/nav/nav-sheet';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { SearchDialog } from '@/components/search/search-dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MIDDOT_WITH_SPACES } from '@/constants/shared.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { truncate } from '@/lib/text.utils';
import { useAppStore } from '@/store/app.store';
import { type CallJoinPreferences, type JoinCallRes } from '@/types/call.types';
import { type ChannelRes } from '@/types/channel.types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuArrowLeft, LuListTodo } from 'react-icons/lu';
import { MdChevronRight, MdForum, MdSearch, MdTag } from 'react-icons/md';

interface Props {
  channel?: ChannelRes;
  callConfig: JoinCallRes | null;
  callPreferences: CallJoinPreferences | null;
  serverName?: string;
  isJoiningCall: boolean;
  isPreJoinOpen: boolean;
  videoCallsEnabled: boolean;
  onCancelPreJoin: () => void;
  onConfirmJoinCall: (preferences: CallJoinPreferences) => void;
  onJoinCall: () => void;
  onLeaveCall: () => void;
  isDecisionsPanelOpen: boolean;
  onToggleDecisionsPanel: () => void;
}

export const ChannelTopNav = ({
  channel,
  callConfig,
  callPreferences,
  serverName,
  isJoiningCall,
  isPreJoinOpen,
  videoCallsEnabled,
  onCancelPreJoin,
  onConfirmJoinCall,
  onJoinCall,
  onLeaveCall,
  isDecisionsPanelOpen,
  onToggleDecisionsPanel,
}: Props) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { isAppLoading } = useAppStore();
  const { isRegistered } = useAuthData();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const searchPanel = useSearchPanel();

  const description = channel?.description || '';
  const truncatedDescription = truncate(description, 50);

  const truncatedChannelName = truncate(
    channel?.name || '',
    isDesktop ? 23 : 25,
  );
  const searchLabel = t('actions.search');
  const ChannelIcon = channel?.channelType === 'forum' ? MdForum : MdTag;

  return (
    <header className="flex h-13.75 items-center justify-between border-b border-[--color-border] px-2 md:pl-6">
      <div className="mr-1 flex flex-1 items-center gap-2.5">
        {!isDesktop && !isAppLoading && (
          <NavSheet
            trigger={
              <Button
                aria-label={t('navigation.actions.openNavSheet')}
                variant="ghost"
                size="icon"
              >
                <LuArrowLeft className="size-6" />
              </Button>
            }
          />
        )}

        <div className="flex gap-2.5">
          {channel && (
            <ChannelDetailsDrawer
              channel={channel}
              trigger={
                <div className="flex flex-1 items-center text-[15px] font-medium select-none">
                  <ChannelIcon className="text-muted-foreground m-1 mr-[0.3rem] size-5" />
                  <div className="tracking-[0.015rem]">
                    {truncatedChannelName}
                  </div>
                  {!isDesktop && (
                    <MdChevronRight className="text-muted-foreground mt-[0.07rem] size-5" />
                  )}
                </div>
              }
            />
          )}

          {!!channel?.description && isDesktop && (
            <div className="text-muted-foreground/75 flex items-center gap-2.5 font-medium">
              <div className="text-muted-foreground/30 text-xl select-none">
                {MIDDOT_WITH_SPACES}
              </div>

              <ChannelDetailsDialogDesktop
                channel={channel}
                trigger={
                  <div className="cursor-pointer text-sm select-none">
                    {truncatedDescription}
                  </div>
                }
              />
            </div>
          )}
        </div>
      </div>

      <TooltipProvider>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-0.5 empty:hidden">
            {channel && videoCallsEnabled && (
              <ChannelCallButton
                callConfig={callConfig}
                callPreferences={callPreferences}
                channel={channel}
                serverName={serverName}
                isJoining={isJoiningCall}
                isPreJoinOpen={isPreJoinOpen}
                onCancelPreJoin={onCancelPreJoin}
                onConfirmJoin={onConfirmJoinCall}
                onJoin={onJoinCall}
                onLeave={onLeaveCall}
              />
            )}

            {isDesktop && (
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
                    <LuListTodo className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('decisions.actions.panel')}</TooltipContent>
              </Tooltip>
            )}
          </div>

          <Separator
            orientation="vertical"
            className="bg-muted-foreground/30 h-5"
          />

          <div className="flex items-center gap-0.5">
            <NotificationBell />
            {isRegistered && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      aria-label={searchLabel}
                      aria-controls={isDesktop ? 'search-panel' : undefined}
                      aria-expanded={
                        isDesktop ? searchPanel.isOpen : isSearchOpen
                      }
                      onClick={() => {
                        if (isDesktop) {
                          if (searchPanel.isOpen) searchPanel.close();
                          else searchPanel.open(channel?.id);
                        } else {
                          setIsSearchOpen(true);
                        }
                      }}
                      variant="ghost"
                      size="icon"
                    >
                      <MdSearch className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{searchLabel}</TooltipContent>
                </Tooltip>
                <SearchDialog
                  open={!isDesktop && isSearchOpen}
                  onOpenChange={setIsSearchOpen}
                  defaultChannelId={channel?.id}
                />
              </>
            )}
          </div>
        </div>
      </TooltipProvider>
    </header>
  );
};
