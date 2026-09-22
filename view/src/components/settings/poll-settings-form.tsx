import { api } from '@/client/api-client';
import { Button } from '@/components/ui/button';
import {
  type ServerConfigReq,
  type ServerConfigRes,
} from '@/types/server-config.types';
import { DECISION_MAKING_MODEL } from '@/constants/poll.constants';
import { ServerConfigErrorKeys } from '@/constants/server-config.constants';
import { serverConfigSchema } from '@/types/server-config.types';
import { VotingTimeLimit } from '@/constants/vote.constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as zod from 'zod';
import { handleError } from '../../lib/error.utils';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Separator } from '../ui/separator';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { useServerData } from '../../hooks/use-server-data';
import { AnonymousUsersEnabledField } from './anonymous-users-enabled-field';

interface Props {
  serverConfig: ServerConfigRes;
  showAnonymousUsers?: boolean;
  renderFooter?: (form: ReturnType<typeof useServerConfigForm>) => ReactNode;
}

const useServerConfigForm = (serverConfig: ServerConfigRes) =>
  useForm<zod.infer<typeof serverConfigSchema>>({
    resolver: zodResolver(serverConfigSchema),
    defaultValues: serverConfig,
    mode: 'onChange',
  });

export const PollSettingsForm = ({
  serverConfig,
  showAnonymousUsers = false,
  renderFooter,
}: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { serverId } = useServerData();

  const form = useServerConfigForm(serverConfig);

  const { mutate: updateServerConfig, isPending: isUpdatePending } =
    useMutation({
      mutationFn: async (data: ServerConfigReq) => {
        if (!serverId) {
          throw new Error('Server ID is required');
        }
        await api.updateServerConfig(serverId, data);
        return data;
      },
      onSuccess: (data) => {
        queryClient.setQueryData<{ serverConfig: ServerConfigRes }>(
          ['servers', serverId, 'configs'],
          (oldData) => {
            if (!oldData) {
              throw new Error('Server config not found');
            }
            return {
              serverConfig: {
                ...oldData.serverConfig,
                ...data,
                updatedAt: new Date(),
              },
            };
          },
        );
        form.reset(form.getValues());
      },
      onError: (error: Error) => {
        handleError(error);
      },
    });

  const handleSliderInputBlur = (
    fieldName: 'agreementThreshold' | 'quorumThreshold',
    value?: number | null,
    minValue = 0,
  ) => {
    if (value === undefined || value === null) {
      return;
    }
    if (value < minValue) {
      form.setValue(fieldName, minValue);
      return;
    }
    if (value > 100) {
      form.setValue(fieldName, 100);
      return;
    }
    if (!Number.isInteger(value)) {
      form.setValue(fieldName, Math.round(value));
    }
  };

  const decisionMakingModel = form.watch('decisionMakingModel');
  const majorityVoteSelected = decisionMakingModel === 'majority-vote';
  const consentSelected = decisionMakingModel === 'consent';
  const quorumEnabled = form.watch('quorumEnabled');
  const quorumDisabled = !quorumEnabled || consentSelected;
  const showMajorityVoteLimitsExplanation = () => {
    if (majorityVoteSelected) {
      toast.info(t('settings.descriptions.majorityVoteLimitsDisabled'), {
        id: 'majority-vote-limits-disabled',
      });
    }
  };
  const showConsentThresholdsExplanation = () => {
    if (consentSelected) {
      toast.info(t('settings.descriptions.consentThresholdsDisabled'), {
        id: 'consent-thresholds-disabled',
      });
    }
  };

  // Consent is only ever ratifiable at a finite deadline, so steer the form
  // off Unlimited instead of waiting for a submit-time error
  const handleDecisionMakingModelChange = (
    value: string,
    onChange: (value: string) => void,
  ) => {
    onChange(value);
    if (
      value === 'consent' &&
      form.getValues('votingTimeLimit') === VotingTimeLimit.Unlimited
    ) {
      form.setValue('votingTimeLimit', VotingTimeLimit.OneDay, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={
          renderFooter
            ? (event) => event.preventDefault()
            : form.handleSubmit((fv) => updateServerConfig(fv))
        }
        className="space-y-6"
      >
        {showAnonymousUsers && (
          <>
            <AnonymousUsersEnabledField
              control={form.control}
              name="anonymousUsersEnabled"
            />
            <Separator />
          </>
        )}
        <FormField
          control={form.control}
          name="decisionMakingModel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.names.decisionMakingModel')}</FormLabel>
              <FormDescription>
                {t('settings.descriptions.decisionMakingModel')}
              </FormDescription>
              <Select
                onValueChange={(value) =>
                  handleDecisionMakingModelChange(value, field.onChange)
                }
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t('settings.names.decisionMakingModel')}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DECISION_MAKING_MODEL.map((option) => (
                    <SelectItem value={option} key={option}>
                      {(() => {
                        if (option === 'consent') {
                          return t('proposals.labels.consent');
                        }
                        if (option === 'majority-vote') {
                          return t('proposals.labels.majority');
                        }
                        return t('proposals.labels.consensus');
                      })()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <FormField
          control={form.control}
          name="disagreementsLimit"
          render={({ field }) => (
            <FormItem onPointerDownCapture={showMajorityVoteLimitsExplanation}>
              <FormLabel
                className={majorityVoteSelected ? 'opacity-50' : undefined}
              >
                {t('settings.names.disagreementsLimit')}
              </FormLabel>
              <FormDescription
                className={majorityVoteSelected ? 'opacity-50' : undefined}
              >
                {t('settings.descriptions.disagreementsLimit')}
              </FormDescription>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString()}
                disabled={majorityVoteSelected}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t('settings.names.disagreementsLimit')}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Array(11)
                    .fill(0)
                    .map((_, value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {value.toString()}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <FormField
          control={form.control}
          name="abstainsLimit"
          render={({ field }) => (
            <FormItem onPointerDownCapture={showMajorityVoteLimitsExplanation}>
              <FormLabel
                className={majorityVoteSelected ? 'opacity-50' : undefined}
              >
                {t('settings.names.abstainsLimit')}
              </FormLabel>
              <FormDescription
                className={majorityVoteSelected ? 'opacity-50' : undefined}
              >
                {t('settings.descriptions.abstainsLimit')}
              </FormDescription>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString()}
                disabled={majorityVoteSelected}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t('settings.names.abstainsLimit')}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Array(11)
                    .fill(0)
                    .map((_, value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {value.toString()}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {!majorityVoteSelected && (
          <>
            <Separator />

            <FormField
              control={form.control}
              name="blocksOpenToAll"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4 md:gap-16">
                  <div className="space-y-1">
                    <FormLabel>{t('settings.names.blocksOpenToAll')}</FormLabel>
                    <FormDescription>
                      {t('settings.descriptions.blocksOpenToAll')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        )}

        <Separator />

        <FormField
          control={form.control}
          name="agreementThreshold"
          render={({ field }) => (
            <FormItem onPointerDownCapture={showConsentThresholdsExplanation}>
              <FormLabel className={consentSelected ? 'opacity-50' : undefined}>
                {t('settings.names.agreementThreshold')}
              </FormLabel>
              <FormDescription
                className={consentSelected ? 'opacity-50' : undefined}
              >
                {t('settings.descriptions.agreementThreshold')}
              </FormDescription>
              <div className="flex gap-3">
                <FormControl>
                  <Slider
                    value={[field.value ?? 0]}
                    onValueChange={(values) => field.onChange(values[0])}
                    min={1}
                    max={100}
                    step={1}
                    className="mb-0 w-full"
                    disabled={consentSelected}
                    aria-label={t('settings.names.agreementThreshold')}
                  />
                </FormControl>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      onBlur={() =>
                        handleSliderInputBlur(
                          'agreementThreshold',
                          field.value,
                          1,
                        )
                      }
                      className="w-20"
                      disabled={consentSelected}
                      aria-label={t('settings.names.agreementThreshold')}
                    />
                  </FormControl>
                  <span className="text-muted-foreground text-sm">%</span>
                </div>
              </div>
              <FormMessage
                errorOverrides={{
                  [ServerConfigErrorKeys.MajorityVoteAgreementThreshold]: t(
                    'settings.errors.majorityVoteAgreementThreshold',
                  ),
                }}
              />
            </FormItem>
          )}
        />

        <Separator />

        <FormField
          control={form.control}
          name="quorumEnabled"
          render={({ field }) => (
            <FormItem
              className="flex items-center justify-between gap-4 md:gap-16"
              onPointerDownCapture={showConsentThresholdsExplanation}
            >
              <div className="space-y-1">
                <FormLabel
                  className={consentSelected ? 'opacity-50' : undefined}
                >
                  {t('settings.names.quorumEnabled')}
                </FormLabel>
                <FormDescription
                  className={consentSelected ? 'opacity-50' : undefined}
                >
                  {t('settings.descriptions.quorumEnabled')}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={consentSelected}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Separator />

        <FormField
          control={form.control}
          name="quorumThreshold"
          render={({ field }) => (
            <FormItem
              className={quorumDisabled ? 'cursor-not-allowed opacity-50' : ''}
              onPointerDownCapture={showConsentThresholdsExplanation}
            >
              <FormLabel>{t('settings.names.quorumThreshold')}</FormLabel>
              <FormDescription>
                {t('settings.descriptions.quorumThreshold')}
              </FormDescription>
              <div className="flex gap-3">
                <FormControl>
                  <Slider
                    value={[field.value ?? 0]}
                    onValueChange={(values) => field.onChange(values[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="mb-0 w-full"
                    disabled={quorumDisabled}
                    aria-label={t('settings.names.quorumThreshold')}
                  />
                </FormControl>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      onBlur={() =>
                        handleSliderInputBlur('quorumThreshold', field.value)
                      }
                      className="w-20"
                      disabled={quorumDisabled}
                      aria-label={t('settings.names.quorumThreshold')}
                    />
                  </FormControl>
                  <span className="text-muted-foreground text-sm">%</span>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <FormField
          control={form.control}
          name="votingTimeLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.names.votingTimeLimit')}</FormLabel>
              <FormDescription>
                {t('settings.descriptions.votingTimeLimit')}
              </FormDescription>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t('settings.names.votingTimeLimit')}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={VotingTimeLimit.HalfHour.toString()}>
                    {t('time.minutesFull', { count: 30 })}
                  </SelectItem>
                  <SelectItem value={VotingTimeLimit.OneHour.toString()}>
                    {t('time.hoursFull', { count: 1 })}
                  </SelectItem>
                  <SelectItem value={VotingTimeLimit.HalfDay.toString()}>
                    {t('time.hoursFull', { count: 12 })}
                  </SelectItem>
                  <SelectItem value={VotingTimeLimit.OneDay.toString()}>
                    {t('time.daysFull', { count: 1 })}
                  </SelectItem>
                  <SelectItem value={VotingTimeLimit.ThreeDays.toString()}>
                    {t('time.daysFull', { count: 3 })}
                  </SelectItem>
                  <SelectItem value={VotingTimeLimit.OneWeek.toString()}>
                    {t('time.weeks', { count: 1 })}
                  </SelectItem>
                  <SelectItem value={VotingTimeLimit.TwoWeeks.toString()}>
                    {t('time.weeks', { count: 2 })}
                  </SelectItem>
                  {!consentSelected && (
                    <SelectItem value={VotingTimeLimit.Unlimited.toString()}>
                      {t('time.unlimited')}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage
                errorOverrides={{
                  [ServerConfigErrorKeys.ConsentVotingTimeLimitRequired]: t(
                    'settings.errors.consentVotingTimeLimitRequired',
                  ),
                }}
              />
            </FormItem>
          )}
        />

        {form.formState.errors.root?.message && (
          <p className="text-destructive text-sm">
            {form.formState.errors.root.message}
          </p>
        )}

        {renderFooter ? (
          renderFooter(form)
        ) : (
          <div className="flex justify-end">
            <Button
              disabled={isUpdatePending || !form.formState.isDirty}
              type="submit"
              className="w-20"
            >
              {t('actions.save')}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};
