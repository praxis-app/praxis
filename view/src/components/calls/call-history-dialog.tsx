import { CallChatPanel } from '@/components/calls/call-chat-panel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type ChannelRes } from '@/types/channel.types';
import { useTranslation } from 'react-i18next';

interface Props {
  serverId?: string;
  channel: ChannelRes;
  callId: string;
  focusedMessageId?: string;
  onClose: () => void;
}

export const CallHistoryDialog = ({
  serverId,
  channel,
  callId,
  focusedMessageId,
  onClose,
}: Props) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        data-testid="call-history-dialog"
        className="md:h-[80vh] md:max-h-[80vh] md:min-w-3xl md:grid-rows-[auto_minmax(0,1fr)]"
      >
        <DialogHeader>
          <DialogTitle>{t('calls.headers.callHistory')}</DialogTitle>
          <DialogDescription>
            {t('calls.descriptions.callHistory')}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1">
          <CallChatPanel
            serverId={serverId}
            channel={channel}
            callId={callId}
            focusedMessageId={focusedMessageId}
            readOnly
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
