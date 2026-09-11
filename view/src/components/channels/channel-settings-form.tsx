import { api } from '@/client/api-client';
import { useServerData } from '@/hooks/use-server-data';
import { type ChannelRes } from '@/types/channel.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as zod from 'zod';
import { handleError } from '../../lib/error.utils';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

const channelSchema = zod.object({
  name: zod.string(),
  description: zod.string().optional(),
});

interface Props {
  editChannel: ChannelRes;
  onSuccess: () => void;
}

export const ChannelSettingsForm = ({ editChannel, onSuccess }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { serverId } = useServerData();

  const form = useForm<zod.infer<typeof channelSchema>>({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      name: editChannel.name,
      description: editChannel.description || '',
    },
  });

  const { mutate: updateChannel, isPending: isUpdateChannelPending } =
    useMutation({
      mutationFn: async (values: zod.infer<typeof channelSchema>) => {
        if (!serverId) {
          throw new Error('Server ID is required');
        }
        await api.updateChannel(serverId, editChannel.id, {
          name: values.name,
          description: values.description,
        });

        const channel = { ...editChannel, ...values };
        queryClient.setQueryData<{ channel: ChannelRes }>(
          ['servers', serverId, 'channels', editChannel.id],
          { channel },
        );
        queryClient.setQueryData<{ channels: ChannelRes[] }>(
          ['servers', serverId, 'channels', 'joined'],
          (oldData) => {
            if (!oldData) {
              return { channels: [] };
            }
            return {
              channels: oldData.channels.map((c) => {
                return c.id === channel.id ? channel : c;
              }),
            };
          },
        );
        onSuccess();
      },
      onError(error: Error) {
        handleError(error);
      },
    });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => updateChannel(v))}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('channels.form.name')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    e.target.value = e.target.value
                      .replace(/\s/g, '-')
                      .toLocaleLowerCase();
                    field.onChange(e);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('channels.form.description')}</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={
            isUpdateChannelPending ||
            form.formState.isSubmitting ||
            !form.formState.isValid
          }
        >
          {t('actions.save')}
        </Button>
      </form>
    </Form>
  );
};
