import { type WizardStepProps } from '@/components/shared/wizard/wizard.types';
import {
  ProposalActionChange,
  ProposalActionChangeValue,
  ProposalActionColorValue,
  ProposalActionMemberValue,
} from '@/components/polls/proposals/proposal-actions/proposal-action-change';
import { getServerPermissionValuesMap } from '@/lib/role.utils';
import { type ServerPermissionKeys } from '@/types/role.types';
import { type UserRes } from '@/types/user.types';
import {
  type PollActionType,
  type RoleAttributeChangeType,
} from '@/types/poll-action.types';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useWizardContext } from '../../../../shared/wizard/wizard-hooks';
import { Button } from '../../../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../ui/card';
import {
  type CreateProposalFormSchema,
  type CreateProposalWizardContext,
} from '../create-proposal-form.types';
import { ServerConfigChanges } from '../../server-config-changes';
import { getServerConfigChanges } from '../../server-config-changes.utils';
import { EventSummary } from '@/components/events/event-summary';
import { AttachedImagePreview } from '@/components/images/attached-image-preview';

export const ProposalReviewStep = ({ isLoading }: WizardStepProps) => {
  const {
    context: {
      selectedServerRole,
      usersEligibleForServerRole,
      serverConfig,
      serverMembers,
    },
    onSubmit,
    onPrevious,
    isSubmitting,
  } = useWizardContext<CreateProposalWizardContext>();

  const form = useFormContext<CreateProposalFormSchema>();

  const formValues = form.getValues();
  const {
    action,
    body,
    permissions,
    serverRoleMembers,
    serverRoleName,
    serverRoleColor,
  } = formValues;

  const nameChanged = serverRoleName !== selectedServerRole?.name;
  const colorChanged = serverRoleColor !== selectedServerRole?.color;

  const shapedRolePermissions = getServerPermissionValuesMap(
    selectedServerRole?.permissions || [],
  );

  const permissionChanges = Object.entries(permissions || {}).reduce<
    Record<string, boolean>
  >((result, [permission, value]) => {
    if (value !== undefined && value !== shapedRolePermissions[permission]) {
      result[permission] = value;
    }
    return result;
  }, {});

  const memberChanges = (() => {
    const changes: { user: UserRes; changeType: RoleAttributeChangeType }[] =
      [];
    for (const user of selectedServerRole?.members || []) {
      if (!serverRoleMembers?.includes(user.id)) {
        changes.push({ user, changeType: 'remove' });
      }
    }
    for (const user of usersEligibleForServerRole || []) {
      if (serverRoleMembers?.includes(user.id)) {
        changes.push({ user, changeType: 'add' });
      }
    }
    return changes;
  })();
  const serverConfigChanges = serverConfig
    ? getServerConfigChanges(serverConfig, formValues.serverConfig || {})
    : {};

  const { t } = useTranslation();

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

  const getPermissionName = (name: ServerPermissionKeys | '') => {
    if (!name) {
      return '';
    }
    return t(`permissions.names.${name}`);
  };

  const handleSubmitBtnClick = () => {
    if (action === 'change-role') {
      if (
        !nameChanged &&
        !colorChanged &&
        !memberChanges.length &&
        !Object.keys(permissionChanges).length
      ) {
        form.setError('root', {
          message: t('proposals.errors.changeRoleRequiresChanges'),
        });
        return;
      }
    }
    if (
      action === 'change-settings' &&
      !Object.keys(serverConfigChanges).length
    ) {
      form.setError('root', {
        message: t('proposals.errors.changeSettingsRequiresChanges'),
      });
      return;
    }
    onSubmit();
  };

  if (isLoading) {
    return (
      <div className="text-muted-foreground text-sm">
        {t('actions.loading')}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <h2 className="text-xl leading-tight font-medium tracking-tight">
          {t('proposals.headers.review')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('proposals.descriptions.reviewDescription')}
        </p>
      </div>

      <div className="space-y-4">
        {body && (
          <Card className="gap-2 py-4">
            <CardHeader className="px-4 sm:px-5">
              <CardTitle className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {t('proposals.labels.body')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-5">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {body}
              </p>
            </CardContent>
          </Card>
        )}

        {formValues.images.length > 0 && (
          <Card className="gap-2 py-4">
            <CardHeader className="px-4 sm:px-5">
              <CardTitle className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {t('images.labels.attachedImages')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-5">
              <AttachedImagePreview
                selectedImages={formValues.images}
                imageClassName="rounded-lg"
              />
            </CardContent>
          </Card>
        )}

        <Card className="gap-2 py-4">
          <CardHeader className="px-4 sm:px-5">
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {t('proposals.labels.actionType')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-5">
            <p className="text-sm leading-relaxed">
              {getProposalActionLabel(action)}
            </p>
          </CardContent>
        </Card>

        {action === 'change-role' && selectedServerRole && (
          <Card className="gap-3 py-5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span
                  className="size-3.5 rounded-full"
                  style={{ backgroundColor: selectedServerRole.color }}
                />
                {t('proposals.labels.roleChangeProposal')}:{' '}
                {selectedServerRole.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                {nameChanged && (
                  <ProposalActionChange
                    label={t('proposals.labels.name')}
                    oldValue={selectedServerRole.name}
                    proposedValue={serverRoleName}
                  />
                )}
                {colorChanged && (
                  <ProposalActionChange
                    label={t('proposals.labels.color')}
                    oldValue={
                      <ProposalActionColorValue
                        color={selectedServerRole.color}
                      />
                    }
                    proposedValue={
                      <ProposalActionColorValue color={serverRoleColor} />
                    }
                  />
                )}
                {Object.keys(permissionChanges).length > 0 && (
                  <div className="min-w-0 space-y-2">
                    <div className="font-semibold">
                      {t('proposals.headers.permissions')}
                    </div>
                    {Object.entries(permissionChanges).map(
                      ([permissionName, permissionValue]) => (
                        <ProposalActionChangeValue
                          key={permissionName}
                          changeType={permissionValue ? 'add' : 'remove'}
                        >
                          {getPermissionName(
                            permissionName as ServerPermissionKeys,
                          )}
                        </ProposalActionChangeValue>
                      ),
                    )}
                  </div>
                )}
                {memberChanges.length > 0 && (
                  <div className="min-w-0 space-y-2">
                    <div className="font-semibold">
                      {t('proposals.headers.memberChanges')}
                    </div>
                    {memberChanges.map((member) => (
                      <ProposalActionChangeValue
                        key={member.user.id}
                        changeType={member.changeType}
                      >
                        <ProposalActionMemberValue user={member.user} />
                      </ProposalActionChangeValue>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        {action === 'change-settings' && serverConfig && (
          <Card className="gap-3 py-5">
            <CardHeader>
              <CardTitle className="text-base">
                {t('proposals.labels.settingsChangeProposal')}:{' '}
                <span className="font-normal">
                  {t('proposals.labels.settingChangesCount', {
                    count: Object.keys(serverConfigChanges).length,
                  })}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ServerConfigChanges
                changes={
                  Object.fromEntries(
                    Object.entries(serverConfigChanges)
                      .map(([key, value]) => [key, value])
                      .concat(
                        Object.keys(serverConfigChanges).map((key) => [
                          `prev${key[0].toUpperCase()}${key.slice(1)}`,
                          serverConfig[key as keyof typeof serverConfig],
                        ]),
                      ),
                  ) as never
                }
              />
            </CardContent>
          </Card>
        )}
        {action === 'plan-event' && formValues.eventStartsAt && (
          <div>
            <EventSummary
              name={formValues.eventName || ''}
              description={formValues.eventDescription || ''}
              startsAt={new Date(formValues.eventStartsAt).toISOString()}
              endsAt={
                formValues.eventEndsAt
                  ? new Date(formValues.eventEndsAt).toISOString()
                  : undefined
              }
              online={!!formValues.eventOnline}
              location={formValues.eventLocation}
              externalLink={formValues.eventExternalLink}
              hosts={(serverMembers || []).filter((user) =>
                formValues.eventHostIds?.includes(user.id),
              )}
              coverPhotoFile={formValues.eventCoverPhoto}
              layout="nested"
            />
          </div>
        )}
      </div>

      {form.formState.errors.root && (
        <p className="text-destructive text-sm">
          {form.formState.errors.root.message}
        </p>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          {t('actions.previous')}
        </Button>
        <Button onClick={handleSubmitBtnClick} disabled={isSubmitting}>
          {t('proposals.actions.create')}
        </Button>
      </div>
    </div>
  );
};
