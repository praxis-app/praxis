import { RoleMemberOption } from '@/components/roles/role-member-option';
import { AttachedImagePreview } from '@/components/images/attached-image-preview';
import { ImageInput } from '@/components/images/image-input';
import { type WizardStepProps } from '@/components/shared/wizard/wizard.types';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/users/user-avatar';
import { addHoursToDateTimeValue } from '@/lib/event.utils';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { LuPlus, LuSearch, LuX } from 'react-icons/lu';
import { useWizardContext } from '../../../../shared/wizard/wizard-hooks';
import {
  type CreateProposalFormSchema,
  type CreateProposalWizardContext,
} from '../create-proposal-form.types';
import { EventDateTimeField } from './event-date-time-field';

export const PlanEventStep = ({ isLoading }: WizardStepProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const form = useFormContext<CreateProposalFormSchema>();
  const [showEndsAt, setShowEndsAt] = useState(
    () => !!form.getValues('eventEndsAt'),
  );

  const { context, onNext, onPrevious } =
    useWizardContext<CreateProposalWizardContext>();

  const { t } = useTranslation();

  const online = form.watch('eventOnline');
  const hostIds = form.watch('eventHostIds') || [];
  const startsAt = form.watch('eventStartsAt') || '';
  const endsAt = form.watch('eventEndsAt') || '';
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const serverMembers = context.serverMembers || [];
  const selectedHosts = hostIds.flatMap((hostId) => {
    const host = serverMembers.find((user) => user.id === hostId);
    return host ? [host] : [];
  });

  const matchingMembers = normalizedSearchTerm
    ? serverMembers.filter((user) =>
        (user.displayName || user.name)
          .toLowerCase()
          .includes(normalizedSearchTerm),
      )
    : [];

  const setHostIds = (ids: string[]) => {
    form.setValue('eventHostIds', ids, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  if (isLoading) {
    return <p>{t('actions.loading')}</p>;
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          {t('proposals.headers.planEvent')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('proposals.descriptions.planEvent')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="eventName"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>{t('events.labels.name')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('events.placeholders.name')}
                  className="h-11"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="eventCoverPhoto"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>{t('events.labels.coverPhoto')}</FormLabel>
              {field.value ? (
                <AttachedImagePreview
                  selectedImages={[field.value]}
                  handleRemove={() => field.onChange(undefined)}
                  imageContainerClassName="w-full"
                />
              ) : (
                <ImageInput onChange={(files) => field.onChange(files[0])}>
                  <Button type="button" variant="outline">
                    {t('events.actions.uploadCoverPhoto')}
                  </Button>
                </ImageInput>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="eventDescription"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>{t('events.labels.description')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('events.placeholders.description')}
                  className="min-h-24 resize-y"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="eventStartsAt"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <EventDateTimeField
                dateLabel={t('events.labels.startDate')}
                datePlaceholder={t('events.placeholders.selectDate')}
                timeLabel={t('events.labels.startTime')}
                timePlaceholder={t('events.placeholders.selectTime')}
                minDate={new Date()}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  if (showEndsAt && endsAt) {
                    form.setValue(
                      'eventEndsAt',
                      addHoursToDateTimeValue(value, 1),
                      { shouldDirty: true, shouldValidate: true },
                    );
                  }
                }}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {showEndsAt && (
          <FormField
            control={form.control}
            name="eventEndsAt"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <EventDateTimeField
                  dateLabel={t('events.labels.endDate')}
                  datePlaceholder={t('events.placeholders.selectDate')}
                  timeLabel={t('events.labels.endTime')}
                  timePlaceholder={t('events.placeholders.selectTime')}
                  value={field.value}
                  onChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button
          type="button"
          variant="ghost"
          className="w-fit sm:col-span-2"
          onClick={() => {
            if (showEndsAt) {
              form.setValue('eventEndsAt', '', {
                shouldDirty: true,
                shouldValidate: true,
              });
            } else {
              form.setValue(
                'eventEndsAt',
                addHoursToDateTimeValue(startsAt, 1),
                { shouldDirty: true, shouldValidate: true },
              );
            }
            setShowEndsAt(!showEndsAt);
          }}
        >
          <LuPlus
            className={showEndsAt ? 'rotate-45 transition-transform' : ''}
          />
          {t(
            showEndsAt
              ? 'events.actions.removeEndDateTime'
              : 'events.actions.addEndDateTime',
          )}
        </Button>

        <FormField
          control={form.control}
          name="eventOnline"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
              <FormLabel>{t('events.labels.online')}</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {!online && (
          <FormField
            control={form.control}
            name="eventLocation"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>{t('events.labels.location')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('events.placeholders.location')}
                    className="h-11"
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {online && (
          <FormField
            control={form.control}
            name="eventExternalLink"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>{t('events.labels.externalLink')}</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder={t('events.placeholders.externalLink')}
                    className="h-11"
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      <div className="space-y-3">
        <FormLabel>{t('events.labels.hosts')}</FormLabel>
        {!!selectedHosts.length && (
          <div className="flex flex-wrap gap-2">
            {selectedHosts.map((host) => {
              const name = host.displayName || host.name;
              return (
                <div
                  key={host.id}
                  className="bg-muted/70 border-border/70 inline-flex max-w-full items-center gap-2 rounded-full border py-1 pr-1 pl-1.5 shadow-xs"
                >
                  <UserAvatar
                    userId={host.id}
                    name={name}
                    imageId={host.profilePicture?.id}
                    className="size-6"
                    fallbackClassName="text-xs"
                  />
                  <span className="max-w-40 truncate text-sm font-medium">
                    {name}
                  </span>
                  <button
                    type="button"
                    aria-label={`${t('actions.remove')} ${name}`}
                    onClick={() =>
                      setHostIds(hostIds.filter((id) => id !== host.id))
                    }
                    className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring flex size-6 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <LuX className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="relative">
          <LuSearch className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t('events.placeholders.hosts')}
            autoComplete="off"
            className="h-11 pl-9"
          />
        </div>

        {normalizedSearchTerm && (
          <div className="max-h-52 overflow-hidden overflow-y-auto rounded-lg border">
            {matchingMembers.length ? (
              matchingMembers.map((user) => (
                <RoleMemberOption
                  key={user.id}
                  user={user}
                  className="rounded-none px-3"
                  selectedUserIds={hostIds}
                  setSelectedUserIds={(ids) => {
                    setHostIds(ids);
                    if (ids.includes(user.id)) setSearchTerm('');
                  }}
                />
              ))
            ) : (
              <p className="text-muted-foreground py-4 text-center text-sm">
                {t('proposals.prompts.noUsersFound')}
              </p>
            )}
          </div>
        )}

        {form.formState.errors.eventHostIds && (
          <p className="text-destructive text-sm">
            {form.formState.errors.eventHostIds.message}
          </p>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          {t('actions.previous')}
        </Button>
        <Button onClick={onNext}>{t('actions.next')}</Button>
      </div>
    </div>
  );
};
