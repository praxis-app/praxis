import { api } from '@/client/api-client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { handleError } from '@/lib/error.utils';
import {
  type UserConfigReq,
  type UserConfigRes,
} from '@/types/user-config.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface Props {
  userConfig: UserConfigRes;
}

type ToggleName = keyof UserConfigReq;

const TOGGLES: ToggleName[] = [
  'messageNotificationsEnabled',
  'replyNotificationsEnabled',
  'proposalNotificationsEnabled',
  'roleNotificationsEnabled',
];

export const NotificationSettingsForm = ({ userConfig }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<Required<UserConfigReq>>({
    defaultValues: {
      messageNotificationsEnabled: userConfig.messageNotificationsEnabled,
      replyNotificationsEnabled: userConfig.replyNotificationsEnabled,
      proposalNotificationsEnabled: userConfig.proposalNotificationsEnabled,
      roleNotificationsEnabled: userConfig.roleNotificationsEnabled,
    },
  });

  const { mutate: updateUserConfig, isPending } = useMutation({
    mutationFn: async (values: Required<UserConfigReq>) => {
      const changed = TOGGLES.filter(
        (name) => form.formState.dirtyFields[name],
      );
      const payload: UserConfigReq = {};
      for (const name of changed) {
        payload[name] = values[name];
      }
      const { userConfig: updated } = await api.updateUserConfig(payload);
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['users', 'me', 'configs'], {
        userConfig: updated,
      });
      form.reset({
        messageNotificationsEnabled: updated.messageNotificationsEnabled,
        replyNotificationsEnabled: updated.replyNotificationsEnabled,
        proposalNotificationsEnabled: updated.proposalNotificationsEnabled,
        roleNotificationsEnabled: updated.roleNotificationsEnabled,
      });
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => updateUserConfig(values))}
        className="flex flex-col"
      >
        {TOGGLES.map((name) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between border-b py-6 first:pt-1">
                <div className="space-y-0.5 pr-4">
                  <FormLabel>{t(`settings.names.${name}`)}</FormLabel>
                  <FormDescription>
                    {t(`settings.descriptions.${name}`)}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                    aria-label={t(`settings.names.${name}`)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ))}

        <div className="flex justify-end pt-6">
          <Button
            type="submit"
            disabled={isPending || !form.formState.isDirty}
            className="w-20"
          >
            {t('actions.save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
