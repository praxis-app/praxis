import { api } from '@/client/api-client';
import { useServerData } from '@/hooks/use-server-data';
import { type ChannelRes } from '@/types/channel.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MdTag } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import { handleError } from '../../lib/error.utils';
import { Button } from '../ui/button';

interface DeleteChannelFormSubmitButtonProps {
  isSubmitting: boolean;
}

interface DeleteChannelFormProps {
  channel: ChannelRes;
  submitButton: (props: DeleteChannelFormSubmitButtonProps) => ReactNode;
  onSubmit?(): void;
}

export const DeleteChannelFormSubmitButton = ({
  isSubmitting,
}: DeleteChannelFormSubmitButtonProps) => {
  const { t } = useTranslation();
  return (
    <Button type="submit" variant="destructive" disabled={isSubmitting}>
      {isSubmitting ? t('states.deleting') : t('actions.delete')}
    </Button>
  );
};

export const DeleteChannelForm = ({
  channel,
  submitButton,
  onSubmit,
}: DeleteChannelFormProps) => {
  const { channelId } = useParams();
  const { serverId, serverPath } = useServerData();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: deleteChannel, isPending } = useMutation({
    mutationFn: async () => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      await api.deleteChannel(serverId, channel.id);

      queryClient.setQueryData<{ channels: ChannelRes[] }>(
        ['servers', serverId, 'channels', 'joined'],
        (oldData) => {
          if (!oldData) {
            return { channels: [] };
          }
          return {
            channels: oldData.channels.filter((c) => c.id !== channel.id),
          };
        },
      );

      onSubmit?.();

      if (channelId === channel.id) {
        navigate(serverPath);
      }
    },
    onError(error: Error) {
      handleError(error);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        deleteChannel();
      }}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <MdTag className="text-muted-foreground size-5" />
          <div>{channel.name}</div>
        </div>
        <div className="flex justify-end">
          {submitButton({ isSubmitting: isPending })}
        </div>
      </div>
    </form>
  );
};
