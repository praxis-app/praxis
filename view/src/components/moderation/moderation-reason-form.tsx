import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  MAX_MODERATION_REASON_LENGTH,
  MIN_MODERATION_REASON_LENGTH,
} from '@/constants/moderation.constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as zod from 'zod';

const getReasonSchema = (isReasonRequired: boolean) =>
  zod.object({
    reason: isReasonRequired
      ? zod
          .string()
          .trim()
          .min(MIN_MODERATION_REASON_LENGTH)
          .max(MAX_MODERATION_REASON_LENGTH)
      : zod.string().trim().max(MAX_MODERATION_REASON_LENGTH),
  });

type ReasonFormValues = zod.infer<ReturnType<typeof getReasonSchema>>;

interface Props {
  confirmLabel: string;
  isReasonRequired: boolean;
  isDestructive: boolean;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: (reason?: string) => void;
}

export const ModerationReasonForm = ({
  confirmLabel,
  isReasonRequired,
  isDestructive,
  isPending,
  onCancel,
  onConfirm,
}: Props) => {
  const { t } = useTranslation();

  const form = useForm<ReasonFormValues>({
    resolver: zodResolver(getReasonSchema(isReasonRequired)),
    defaultValues: { reason: '' },
    mode: 'onChange',
  });

  const handleSubmit = ({ reason }: ReasonFormValues) =>
    onConfirm(reason || undefined);

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {isReasonRequired
                  ? t('moderation.labels.reason')
                  : t('moderation.labels.reasonOptional')}
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  maxLength={MAX_MODERATION_REASON_LENGTH}
                  placeholder={t('moderation.placeholders.reason')}
                />
              </FormControl>
              {isReasonRequired && (
                <FormDescription className="text-xs">
                  {t('moderation.prompts.reasonRequired', {
                    count: MIN_MODERATION_REASON_LENGTH,
                  })}
                </FormDescription>
              )}
            </FormItem>
          )}
        />

        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('actions.cancel')}
          </Button>
          <Button
            type="submit"
            variant={isDestructive ? 'destructive' : 'default'}
            disabled={isPending || !form.formState.isValid}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
