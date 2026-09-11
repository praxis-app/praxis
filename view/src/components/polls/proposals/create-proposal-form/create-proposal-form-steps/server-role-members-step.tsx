import { RoleMemberOption } from '@/components/roles/role-member-option';
import { type WizardStepProps } from '@/components/shared/wizard/wizard.types';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useWizardContext } from '../../../../shared/wizard/wizard-hooks';
import { Button } from '../../../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../ui/card';
import { Input } from '../../../../ui/input';
import {
  type CreateProposalFormSchema,
  type CreateProposalWizardContext,
} from '../create-proposal-form.types';

export const ServerRoleMembersStep = ({ isLoading }: WizardStepProps) => {
  const {
    context: { selectedServerRole, usersEligibleForServerRole },
    onNext,
    onPrevious,
  } = useWizardContext<CreateProposalWizardContext>();

  const [searchTerm, setSearchTerm] = useState('');

  const form = useFormContext<CreateProposalFormSchema>();
  const selectedMembers = form.watch('serverRoleMembers') || [];
  const selectedServerRoleId = form.watch('selectedServerRoleId');

  const { t } = useTranslation();

  const setFieldValue = (
    field: keyof CreateProposalFormSchema,
    value: CreateProposalFormSchema[keyof CreateProposalFormSchema],
  ) => {
    form.setValue(field, value, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleMemberChange = (memberChanges: string[]) => {
    setFieldValue('serverRoleMembers', memberChanges);
  };

  const filteredUsers =
    [
      ...(selectedServerRole?.members || []),
      ...(usersEligibleForServerRole || []),
    ].filter((user) =>
      (user.displayName || user.name)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    ) || [];

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
          {t('proposals.headers.roleMembers')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('proposals.descriptions.roleMembersDescription')}
        </p>
      </div>

      <div className="space-y-4">
        {selectedServerRoleId && (
          <>
            <Input
              placeholder={t('proposals.placeholders.searchMembersPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
              className="mb-5"
            />

            <Card className="gap-1.5">
              <CardHeader>
                <CardTitle className="text-base">
                  {t('proposals.headers.memberChanges')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="min-h-48 space-y-0.5">
                  {filteredUsers.map((user) => (
                    <RoleMemberOption
                      key={user.id}
                      user={user}
                      selectedUserIds={selectedMembers}
                      setSelectedUserIds={handleMemberChange}
                    />
                  ))}
                  {filteredUsers.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      {t('proposals.prompts.noUsersFound')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
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
