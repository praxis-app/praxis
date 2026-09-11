import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/shared.utils';
import {
  useLocalParticipant,
  useMediaDeviceSelect,
} from '@livekit/components-react';
import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LuMessageSquare,
  LuMic,
  LuMicOff,
  LuVote,
  LuVideo,
  LuVideoOff,
} from 'react-icons/lu';
import { MdOutlineCallEnd } from 'react-icons/md';
import { toast } from 'sonner';

interface Props {
  onLeave: () => void;
  onOpenChat?: () => void;
  onOpenDecisions?: () => void;
}

interface CallControlTooltipProps {
  children: ReactNode;
  label: string;
}

interface DeviceSelectControlProps {
  activeDeviceId: string;
  className?: string;
  devices: MediaDeviceInfo[];
  label: string;
  onDeviceChange: (deviceId: string) => void;
}

const controlButtonClassName =
  'size-11 rounded-full bg-secondary text-secondary-foreground/85 hover:bg-secondary/70';

const clearDocumentSelection = () => {
  window.getSelection()?.removeAllRanges();
};

const CallControlTooltip = ({ children, label }: CallControlTooltipProps) => (
  <Tooltip>
    <TooltipTrigger asChild>{children}</TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);

const DeviceSelectControl = ({
  activeDeviceId,
  className,
  devices,
  label,
  onDeviceChange,
}: DeviceSelectControlProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectableDevices = devices.filter((device) => {
    return device.deviceId;
  });
  const selectedDeviceId = selectableDevices.some((device) => {
    return device.deviceId === activeDeviceId;
  })
    ? activeDeviceId
    : undefined;

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    clearDocumentSelection();

    if (!open) {
      window.requestAnimationFrame(clearDocumentSelection);
      window.setTimeout(clearDocumentSelection, 0);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = 'none';
    clearDocumentSelection();

    return () => {
      document.body.style.userSelect = previousUserSelect;
      window.requestAnimationFrame(clearDocumentSelection);
    };
  }, [isOpen]);

  return (
    <Select
      disabled={selectableDevices.length === 0}
      open={isOpen}
      value={selectedDeviceId}
      onOpenChange={handleOpenChange}
      onValueChange={onDeviceChange}
    >
      <SelectTrigger
        aria-label={label}
        className={cn(
          'dark:hover:bg-secondary/70 text-secondary-foreground/85 hover:bg-secondary/70 data-placeholder:text-secondary-foreground/85 -mr-1.5 h-10 w-10 rounded-full border-0 bg-transparent px-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent [&>span]:sr-only',
          className,
        )}
      >
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent className="select-none" sideOffset={6}>
        {selectableDevices.map((device, index) => (
          <SelectItem
            className="select-none"
            key={device.deviceId}
            value={device.deviceId}
          >
            {device.label || `${label} ${index + 1}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export const CallControls = ({
  onLeave,
  onOpenChat,
  onOpenDecisions,
}: Props) => {
  const { t } = useTranslation();
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } =
    useLocalParticipant();
  const handleMicrophoneDeviceError = useCallback(() => {
    toast(t('calls.errors.microphoneUnavailable'));
  }, [t]);
  const handleCameraDeviceError = useCallback(() => {
    toast(t('calls.errors.cameraUnavailable'));
  }, [t]);
  const {
    activeDeviceId: activeMicrophoneId,
    devices: microphones,
    setActiveMediaDevice: setActiveMicrophone,
  } = useMediaDeviceSelect({
    kind: 'audioinput',
    onError: handleMicrophoneDeviceError,
    requestPermissions: isMicrophoneEnabled,
  });
  const {
    activeDeviceId: activeCameraId,
    devices: cameras,
    setActiveMediaDevice: setActiveCamera,
  } = useMediaDeviceSelect({
    kind: 'videoinput',
    onError: handleCameraDeviceError,
    requestPermissions: isCameraEnabled,
  });

  const microphoneLabel = isMicrophoneEnabled
    ? t('calls.labels.muteMicrophone')
    : t('calls.labels.useMicrophone');
  const microphoneSelectLabel = t('calls.labels.selectMicrophone');
  const cameraLabel = isCameraEnabled
    ? t('calls.labels.turnCameraOff')
    : t('calls.labels.useCamera');
  const cameraSelectLabel = t('calls.labels.selectCamera');

  const openChannelChatLabel = t('calls.labels.openChannelChat');
  const openDecisionsLabel = t('calls.labels.openDecisions');
  const leaveCallLabel = t('calls.labels.leaveCall');

  const toggleMicrophone = async () => {
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch {
      toast(t('calls.errors.microphoneUnavailable'));
    }
  };

  const toggleCamera = async () => {
    try {
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    } catch {
      toast(t('calls.errors.cameraUnavailable'));
    }
  };

  const changeMicrophone = async (deviceId: string) => {
    try {
      await setActiveMicrophone(deviceId, { exact: true });
    } catch {
      toast(t('calls.errors.microphoneUnavailable'));
    }
  };

  const changeCamera = async (deviceId: string) => {
    try {
      await setActiveCamera(deviceId, { exact: true });
    } catch {
      toast(t('calls.errors.cameraUnavailable'));
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center justify-center gap-2">
        <div className="bg-secondary flex h-11 items-center gap-0 rounded-full">
          <DeviceSelectControl
            activeDeviceId={activeMicrophoneId}
            devices={microphones}
            label={microphoneSelectLabel}
            onDeviceChange={(deviceId) => void changeMicrophone(deviceId)}
          />
          <CallControlTooltip label={microphoneLabel}>
            <Button
              aria-label={microphoneLabel}
              onClick={toggleMicrophone}
              variant="ghost"
              size="icon"
              className={cn(
                controlButtonClassName,
                isMicrophoneEnabled &&
                  'bg-primary! text-primary-foreground! hover:bg-primary/90! hover:text-primary-foreground!',
              )}
            >
              {isMicrophoneEnabled ? <LuMic /> : <LuMicOff />}
            </Button>
          </CallControlTooltip>
        </div>

        <div className="bg-secondary flex h-11 items-center gap-0 rounded-full">
          <DeviceSelectControl
            activeDeviceId={activeCameraId}
            devices={cameras}
            label={cameraSelectLabel}
            onDeviceChange={(deviceId) => void changeCamera(deviceId)}
          />
          <CallControlTooltip label={cameraLabel}>
            <Button
              aria-label={cameraLabel}
              onClick={toggleCamera}
              variant="ghost"
              size="icon"
              className={cn(
                controlButtonClassName,
                isCameraEnabled &&
                  'bg-primary! text-primary-foreground! hover:bg-primary/90! hover:text-primary-foreground!',
              )}
            >
              {isCameraEnabled ? <LuVideo /> : <LuVideoOff />}
            </Button>
          </CallControlTooltip>
        </div>

        <CallControlTooltip label={openChannelChatLabel}>
          <Button
            aria-label={openChannelChatLabel}
            onClick={onOpenChat}
            variant="ghost"
            size="icon"
            className={controlButtonClassName}
          >
            <LuMessageSquare />
          </Button>
        </CallControlTooltip>

        <CallControlTooltip label={openDecisionsLabel}>
          <Button
            aria-label={openDecisionsLabel}
            onClick={onOpenDecisions}
            variant="ghost"
            size="icon"
            className={controlButtonClassName}
          >
            <LuVote />
          </Button>
        </CallControlTooltip>

        <CallControlTooltip label={leaveCallLabel}>
          <Button
            aria-label={leaveCallLabel}
            onClick={onLeave}
            variant="ghost"
            size="icon"
            className="bg-destructive hover:bg-destructive/85 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:hover:bg-destructive/50 size-11 rounded-full text-white"
          >
            <MdOutlineCallEnd />
          </Button>
        </CallControlTooltip>
      </div>
    </TooltipProvider>
  );
};
