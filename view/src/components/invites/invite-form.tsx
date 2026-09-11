import { api } from '@/client/api-client';
import { Time } from '@/constants/shared.constants';
import { type InviteRes } from '@/types/invite.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as zod from 'zod';
import { useServerData } from '../../hooks/use-server-data';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const MAX_USES_OPTIONS = [1, 5, 10, 25, 50, 100];

const inviteFormSchema = zod.object({
  expiresAt: zod.string(),
  maxUses: zod.string(),
});

export const InviteForm = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { serverId } = useServerData();

  const form = useForm<zod.infer<typeof inviteFormSchema>>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: { expiresAt: '', maxUses: '' },
    mode: 'onChange',
  });

  const getFormattedExpiresAt = (expiresAt: string) => {
    if (expiresAt === '') {
      return;
    }
    return new Date(Date.now() + Number(expiresAt) * 1000);
  };

  const { mutate: createInvite } = useMutation({
    mutationFn: async (data: zod.infer<typeof inviteFormSchema>) => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      const { invite } = await api.createInvite(serverId, {
        expiresAt: getFormattedExpiresAt(data.expiresAt),
        maxUses: Number(data.maxUses) || undefined,
      });

      queryClient.setQueryData<{ invites: InviteRes[] }>(
        ['servers', serverId, 'invites'],
        (oldData) => {
          if (!oldData) {
            return { invites: [] };
          }
          return { invites: [invite, ...oldData.invites] };
        },
      );
    },
    onSuccess: () => form.reset(),
  });

  const expiresAtOptions = [
    {
      message: t('invites.form.expiresAtOptions.oneDay'),
      value: Time.Day,
    },
    {
      message: t('invites.form.expiresAtOptions.sevenDays'),
      value: Time.Week,
    },
    {
      message: t('invites.form.expiresAtOptions.oneMonth'),
      value: Time.Month,
    },
    {
      message: t('invites.form.expiresAtOptions.never'),
      value: 'never',
    },
  ];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => createInvite(data))}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="expiresAt"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t('invites.form.labels.expiresAt')}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {expiresAtOptions.map((option) => (
                    <SelectItem
                      value={option.value.toString()}
                      key={option.value.toString()}
                    >
                      {option.message}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxUses"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t('invites.form.labels.maxUses')}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MAX_USES_OPTIONS.map((option) => (
                    <SelectItem
                      value={option.toString()}
                      key={option.toString()}
                    >
                      {t('invites.form.maxUsesOptions.xUses', {
                        uses: option,
                      })}
                    </SelectItem>
                  ))}
                  <SelectItem value="no-limit">
                    {t('invites.form.maxUsesOptions.noLimit')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button disabled={form.formState.isSubmitting} type="submit">
            {t('invites.actions.generateLink')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
