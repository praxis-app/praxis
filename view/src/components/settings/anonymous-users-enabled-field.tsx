import { type Control, type FieldValues, type Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '../ui/form';
import { Switch } from '../ui/switch';

interface Props<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
}

export const AnonymousUsersEnabledField = <T extends FieldValues>({
  control,
  name,
}: Props<T>) => {
  const { t } = useTranslation();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <FormLabel>{t('settings.names.anonymousUsersEnabled')}</FormLabel>
            <FormDescription>
              {t('settings.descriptions.anonymousUsersEnabled')}
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={!!field.value}
              onCheckedChange={field.onChange}
              aria-label={t('settings.names.anonymousUsersEnabled')}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
