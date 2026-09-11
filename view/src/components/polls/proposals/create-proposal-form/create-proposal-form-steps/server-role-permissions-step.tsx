import { type WizardStepProps } from '@/components/shared/wizard/wizard.types';
import { SERVER_PERMISSION_KEYS } from '@/constants/role.constants';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useWizardContext } from '../../../../shared/wizard/wizard-hooks';
import { Button } from '../../../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../ui/card';
import { ProposePermissionToggle } from '../../proposal-actions/propose-permission-toggle';
import { type CreateProposalFormSchema } from '../create-proposal-form.types';

export const ServerRolePermissionsStep = ({ isLoading }: WizardStepProps) => {
  const form = useFormContext<CreateProposalFormSchema>();
  const formPermissions = form.watch('permissions')!;

  const { onNext, onPrevious } = useWizardContext();
  const { t } = useTranslation();

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
          {t('proposals.headers.rolesPermissions')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('proposals.descriptions.rolesPermissionsDescription')}
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t('proposals.headers.permissions')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {SERVER_PERMISSION_KEYS.map((permissionName) => (
              <ProposePermissionToggle
                key={permissionName}
                formPermissions={formPermissions}
                permissionName={permissionName}
                setValue={form.setValue}
              />
            ))}
          </CardContent>
        </Card>
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
