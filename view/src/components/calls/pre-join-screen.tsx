import { TopNav } from '@/components/nav/top-nav';
import { PreJoinAudioMeter } from '@/components/calls/pre-join-audio-meter';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePreJoinMedia } from '@/hooks/use-pre-join-media';
import { cn } from '@/lib/shared.utils';
import { type CallJoinPreferences } from '@/types/call.types';
import { type ChannelRes } from '@/types/channel.types';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { LuMic, LuMicOff, LuVideo, LuVideoOff, LuX } from 'react-icons/lu';

interface Props {
  channel: ChannelRes;
  isJoining: boolean;
  serverName?: string;
  onCancel: () => void;
  onJoin: (preferences: CallJoinPreferences) => void;
}

const controlButtonClassName =
  'size-12 rounded-full bg-secondary text-secondary-foreground/85 hover:bg-secondary/70';

const activeControlButtonClassName =
  'bg-primary! text-primary-foreground! hover:bg-primary/90! hover:text-primary-foreground!';

export const PreJoinScreen = ({
  channel,
  isJoining,
  serverName,
  onCancel,
  onJoin,
}: Props) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { audio, hasMediaDevices, video } = usePreJoinMedia();

  const cancelPreJoin = useCallback(() => {
    if (!isJoining) {
      onCancel();
    }
  }, [isJoining, onCancel]);

  const attachPreviewStream = useCallback(
    (element: HTMLVideoElement | null) => {
      videoRef.current = element;

      if (!element) {
        return;
      }

      element.srcObject = video.stream;
      void element.play().catch(() => {});
    },
    [video.stream],
  );

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    videoRef.current.srcObject = video.stream;
    void videoRef.current.play().catch(() => {});
  }, [video.stream]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      cancelPreJoin();
    };

    window.addEventListener('keydown', closeOnEscape);

    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [cancelPreJoin]);

  const microphoneLabel = audio.enabled
    ? t('calls.labels.muteMicrophone')
    : t('calls.labels.useMicrophone');
  const cameraLabel = video.enabled
    ? t('calls.labels.turnCameraOff')
    : t('calls.labels.useCamera');

  const joinCall = () => {
    onJoin({
      audioDeviceId: audio.deviceId,
      audioEnabled: audio.enabled,
      videoDeviceId: video.deviceId,
      videoEnabled: video.enabled,
    });
  };

  const preJoinSubheader = serverName
    ? t('calls.preJoin.readyWithServer', { serverName })
    : t('calls.preJoin.ready');

  const audioDeviceValue = audio.devices.some(
    (device) => device.deviceId === audio.deviceId,
  )
    ? audio.deviceId
    : undefined;

  const videoDeviceValue = video.devices.some(
    (device) => device.deviceId === video.deviceId,
  )
    ? video.deviceId
    : undefined;

  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col">
      <TopNav
        header={t('calls.preJoin.title', { channelName: channel.name })}
        subheader={preJoinSubheader}
        onBackClick={cancelPreJoin}
        backBtnIcon={<LuX className="size-6" />}
        showSearch={false}
      />

      <main className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-3 py-4 md:px-6">
        <div className="grid w-full max-w-5xl gap-4 md:grid-cols-[minmax(0,1fr)_320px] md:items-center">
          <section className="min-w-0">
            <div className="bg-muted relative aspect-video max-h-[68vh] overflow-hidden rounded-md border border-[--color-border]">
              {video.enabled && video.stream ? (
                <video
                  ref={attachPreviewStream}
                  autoPlay
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                <div className="text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-3">
                  <LuVideoOff className="size-12" />
                  <p className="text-sm font-medium">
                    {video.error
                      ? t('calls.preJoin.cameraUnavailable')
                      : t('calls.preJoin.cameraOff')}
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="flex min-w-0 flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                {t('calls.preJoin.checkSetup')}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('calls.preJoin.description')}
              </p>
            </div>

            {!hasMediaDevices && (
              <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
                {t('calls.preJoin.mediaUnsupported')}
              </div>
            )}

            <TooltipProvider>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      aria-label={microphoneLabel}
                      className={cn(
                        controlButtonClassName,
                        audio.enabled && activeControlButtonClassName,
                      )}
                      onClick={() => audio.setEnabled(!audio.enabled)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      {audio.enabled ? <LuMic /> : <LuMicOff />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{microphoneLabel}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      aria-label={cameraLabel}
                      className={cn(
                        controlButtonClassName,
                        video.enabled && activeControlButtonClassName,
                      )}
                      onClick={() => video.setEnabled(!video.enabled)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      {video.enabled ? <LuVideo /> : <LuVideoOff />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{cameraLabel}</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <Label>{t('calls.preJoin.microphone')}</Label>
                <span className="text-muted-foreground text-xs">
                  {audio.error
                    ? t('calls.preJoin.unavailable')
                    : audio.enabled
                      ? t('calls.preJoin.on')
                      : t('calls.preJoin.off')}
                </span>
              </div>
              <PreJoinAudioMeter
                enabled={audio.enabled && !audio.error}
                label={t('calls.preJoin.microphoneLevel')}
                level={audio.level}
              />
              <Select
                disabled={audio.devices.length === 0}
                value={audioDeviceValue}
                onValueChange={audio.setDeviceId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t('calls.preJoin.selectingMicrophone')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {audio.devices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <Label>{t('calls.preJoin.camera')}</Label>
                <span className="text-muted-foreground text-xs">
                  {video.error
                    ? t('calls.preJoin.unavailable')
                    : video.enabled
                      ? t('calls.preJoin.on')
                      : t('calls.preJoin.off')}
                </span>
              </div>
              <Select
                disabled={video.devices.length === 0}
                value={videoDeviceValue}
                onValueChange={video.setDeviceId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t('calls.preJoin.selectingCamera')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {video.devices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
              <Button
                disabled={isJoining}
                onClick={cancelPreJoin}
                type="button"
                variant="outline"
              >
                {t('actions.cancel')}
              </Button>
              <Button disabled={isJoining} onClick={joinCall} type="button">
                {isJoining
                  ? t('calls.preJoin.joining')
                  : t('calls.preJoin.joinNow')}
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
