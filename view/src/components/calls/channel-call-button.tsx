import { CallPanel } from '@/components/calls/call-panel/call-panel';
import { PreJoinScreen } from '@/components/calls/pre-join-screen';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { type CallJoinPreferences, type JoinCallRes } from '@/types/call.types';
import { type ChannelRes } from '@/types/channel.types';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import {
  ConnectionError,
  type AudioCaptureOptions,
  type VideoCaptureOptions,
} from 'livekit-client';
import { useTranslation } from 'react-i18next';
import { TbVideo } from 'react-icons/tb';
import { toast } from 'sonner';

const DEFAULT_DEVICE_ID = 'default';

interface Props {
  callConfig: JoinCallRes | null;
  channel: ChannelRes;
  callPreferences: CallJoinPreferences | null;
  serverName?: string;
  isJoining: boolean;
  isPreJoinOpen: boolean;
  onCancelPreJoin: () => void;
  onConfirmJoin: (preferences: CallJoinPreferences) => void;
  onJoin: () => void;
  onLeave: () => void | Promise<void>;
}

const getAudioCaptureOptions = (
  preferences: CallJoinPreferences | null,
): AudioCaptureOptions | boolean => {
  if (!preferences?.audioEnabled) {
    return false;
  }

  if (
    !preferences.audioDeviceId ||
    preferences.audioDeviceId === DEFAULT_DEVICE_ID
  ) {
    return true;
  }

  return { deviceId: preferences.audioDeviceId };
};

const getVideoCaptureOptions = (
  preferences: CallJoinPreferences | null,
): VideoCaptureOptions | boolean => {
  if (!preferences?.videoEnabled) {
    return false;
  }

  if (
    !preferences.videoDeviceId ||
    preferences.videoDeviceId === DEFAULT_DEVICE_ID
  ) {
    return true;
  }

  return { deviceId: preferences.videoDeviceId };
};

export const ChannelCallButton = ({
  callConfig,
  callPreferences,
  channel,
  serverName,
  isJoining,
  isPreJoinOpen,
  onCancelPreJoin,
  onConfirmJoin,
  onJoin,
  onLeave,
}: Props) => {
  const { t } = useTranslation();

  const audio = getAudioCaptureOptions(callPreferences);
  const video = getVideoCaptureOptions(callPreferences);

  if (!callConfig) {
    return (
      <>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label={t('calls.actions.call')}
                onClick={() => onJoin()}
                disabled={isJoining}
                variant="ghost"
                size="icon"
              >
                <TbVideo className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('calls.actions.call')}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {isPreJoinOpen && (
          <PreJoinScreen
            channel={channel}
            isJoining={isJoining}
            onCancel={onCancelPreJoin}
            onJoin={onConfirmJoin}
            serverName={serverName}
          />
        )}
      </>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={callConfig.livekitUrl}
      token={callConfig.token}
      connect
      audio={audio}
      video={video}
      onError={(error) => {
        if (!(error instanceof ConnectionError)) {
          return;
        }

        toast(t('calls.errors.unavailable'), { id: 'calls-unavailable' });
        void onLeave();
      }}
      onMediaDeviceFailure={(_failure, kind) => {
        if (kind === 'audioinput') {
          toast(t('calls.errors.microphoneUnavailable'));
          return;
        }

        if (kind === 'videoinput') {
          toast(t('calls.errors.cameraUnavailable'));
          return;
        }

        toast(t('calls.errors.unavailable'), { id: 'calls-unavailable' });
      }}
      onDisconnected={onLeave}
    >
      <RoomAudioRenderer />
      <CallPanel
        channel={channel}
        callConfig={callConfig}
        serverName={serverName}
        onLeave={onLeave}
      />
    </LiveKitRoom>
  );
};
