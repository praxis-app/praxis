import { type WizardStepProps } from '@/components/shared/wizard/wizard.types';
import { AttachedImagePreview } from '@/components/images/attached-image-preview';
import { ImageInput } from '@/components/images/image-input';
import { useAuthData } from '@/hooks/use-auth-data';
import { POLL_ACTION_TYPE } from '@/constants/poll-action.constants';
import { type PollActionType } from '@/types/poll-action.types';
import { type ControllerRenderProps, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MdImage } from 'react-icons/md';
import { validateImageInput } from '@/lib/image.utilts';
import { useWizardContext } from '../../../../shared/wizard/wizard-hooks';
import { Button } from '../../../../ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../ui/select';
import { Textarea } from '../../../../ui/textarea';
import { type CreateProposalFormSchema } from '../create-proposal-form.types';

export const ProposalDetailsStep = ({ isLoading }: WizardStepProps) => {
  const form = useFormContext<CreateProposalFormSchema>();
  const { onNext } = useWizardContext();
  const { isAnon } = useAuthData();
  const { t } = useTranslation();

  const handleProposalActionChange = (
    value: string,
    field: ControllerRenderProps<CreateProposalFormSchema>,
  ) => {
    field.onChange(value);
    if (isAnon && value !== 'test') {
      form.setError('action', {
        type: 'manual',
        message: t('proposals.errors.registerToCreateNonTestProposals'),
      });
    } else {
      form.clearErrors('action');
    }
  };

  const getProposalActionLabel = (action: PollActionType | '') => {
    if (action === 'general') {
      return t('proposals.actionTypes.general');
    }
    if (action === 'change-role') {
      return t('proposals.actionTypes.changeRole');
    }
    if (action === 'change-settings') {
      return t('proposals.actionTypes.changeSettings');
    }
    if (action === 'create-role') {
      return t('proposals.actionTypes.createRole');
    }
    if (action === 'plan-event') {
      return t('proposals.actionTypes.planEvent');
    }
    if (action === 'test') {
      return t('proposals.actionTypes.test');
    }
    return '';
  };

  if (isLoading) {
    return (
      <div className="text-muted-foreground text-sm">
        {t('actions.loading')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          {t('proposals.headers.basicInfo')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('proposals.descriptions.basicInfoDescription')}
        </p>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="action"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('proposals.labels.actionType')}</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value) =>
                    handleProposalActionChange(value, field)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t('proposals.placeholders.action')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {POLL_ACTION_TYPE.map((action) => (
                      <SelectItem key={action} value={action}>
                        {getProposalActionLabel(action)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-0.5">
          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('proposals.labels.body')}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={t('proposals.placeholders.body')}
                    className="w-full resize-none md:min-w-md"
                    autoComplete="off"
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                {field.value.length > 0 && (
                  <FormLabel className="mt-3.5">
                    {t('images.labels.attachedImages')}
                  </FormLabel>
                )}
                <AttachedImagePreview
                  selectedImages={field.value}
                  handleRemove={(name) =>
                    field.onChange(
                      field.value.filter((image) => image.name !== name),
                    )
                  }
                />
                <ImageInput
                  multiple
                  onChange={(images) => {
                    try {
                      validateImageInput(images);
                      field.onChange(images);
                      form.clearErrors('images');
                    } catch (error) {
                      form.setError('images', {
                        message:
                          error instanceof Error
                            ? error.message
                            : 'Invalid image.',
                      });
                    }
                  }}
                >
                  <Button type="button" variant="ghost" size="sm">
                    <MdImage className="size-5" />
                    {t('images.labels.attachImages')}
                  </Button>
                </ImageInput>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!form.formState.isValid && form.watch('action') === ''}
        >
          {t('actions.next')}
        </Button>
      </div>
    </div>
  );
};
