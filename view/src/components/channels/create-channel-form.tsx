import { api } from '@/client/api-client';
import { useServerData } from '@/hooks/use-server-data';
import { cn } from '@/lib/shared.utils';
import { type ChannelRes, type CreateChannelReq } from '@/types/channel.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MdForum, MdTag } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import * as zod from 'zod';
import { handleError } from '../../lib/error.utils';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

interface CreateChannelFormSubmitButtonProps {
  isSubmitting: boolean;
}

interface CreateChannelFormProps {
  submitButton: (props: CreateChannelFormSubmitButtonProps) => ReactNode;
  onSubmit?(): void;
  className?: string;
}

const createChannelFormSchema = zod.object({
  name: zod.string(),
  description: zod.string(),
  channelType: zod.enum(['text', 'forum']),
});

export const CreateChannelFormSubmitButton = ({
  isSubmitting,
}: CreateChannelFormSubmitButtonProps) => {
  const { t } = useTranslation();
  return (
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting
        ? t('channels.prompts.creatingChannel')
        : t('channels.actions.create')}
    </Button>
  );
};

export const CreateChannelForm = ({
  submitButton,
  onSubmit,
  className,
}: CreateChannelFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { serverId, serverPath } = useServerData();

  const form = useForm<zod.infer<typeof createChannelFormSchema>>({
    resolver: zodResolver(createChannelFormSchema),
    defaultValues: {
      name: '',
      description: '',
      channelType: 'text',
    },
  });

  const { mutate: createChannel, isPending } = useMutation({
    mutationFn: async (values: CreateChannelReq) => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      const { channel } = await api.createChannel(serverId, values);

      queryClient.setQueryData<{ channels: ChannelRes[] }>(
        ['servers', serverId, 'channels', 'joined'],
        (oldData) => {
          if (!oldData) {
            return { channels: [] };
          }
          return { channels: [...oldData.channels, channel] };
        },
      );

      onSubmit?.();

      navigate(`${serverPath}/c/${channel.id}`);
    },
    onError(error: Error) {
      handleError(error);
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((fv) => createChannel(fv))}
        className={cn('space-y-4 pb-4', className)}
      >
        <FormField
          control={form.control}
          name="channelType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('channels.form.type')}</FormLabel>
              <FormControl>
                <div className="space-y-1" role="radiogroup">
                  <label className="hover:bg-accent flex cursor-pointer items-start gap-3 rounded-md px-2 py-2.5">
                    <input
                      type="radio"
                      name={field.name}
                      value="text"
                      checked={field.value === 'text'}
                      onChange={() => field.onChange('text')}
                      className="border-muted-foreground checked:border-primary focus-visible:ring-ring mt-1 size-5 shrink-0 appearance-none rounded-full border-2 checked:border-[6px] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    />
                    <MdTag className="mt-0.5 size-6 shrink-0" />
                    <span className="min-w-0">
                      <span className="block font-medium">
                        {t('channels.labels.textChannel')}
                      </span>
                      <span className="text-muted-foreground block text-sm font-normal">
                        {t('channels.descriptions.textChannel')}
                      </span>
                    </span>
                  </label>

                  <label className="hover:bg-accent flex cursor-pointer items-start gap-3 rounded-md px-2 py-2.5">
                    <input
                      type="radio"
                      name={field.name}
                      value="forum"
                      checked={field.value === 'forum'}
                      onChange={() => field.onChange('forum')}
                      className="border-muted-foreground checked:border-primary focus-visible:ring-ring mt-1 size-5 shrink-0 appearance-none rounded-full border-2 checked:border-[6px] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    />
                    <MdForum className="mt-0.5 size-6 shrink-0" />
                    <span className="min-w-0">
                      <span className="block font-medium">
                        {t('channels.labels.forumChannel')}
                      </span>
                      <span className="text-muted-foreground block text-sm font-normal">
                        {t('channels.descriptions.forumChannel')}
                      </span>
                    </span>
                  </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('channels.form.name')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoComplete="off"
                  onChange={(e) => {
                    e.target.value = e.target.value
                      .replace(/\s/g, '-')
                      .toLocaleLowerCase();
                    field.onChange(e);
                  }}
                />
              </FormControl>
              <FormMessage />
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
                {/* TODO: Ensure description text doesn't affect form width */}
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {submitButton({ isSubmitting: isPending })}
      </form>
    </Form>
  );
};
