import { PollSettingsForm } from '@/components/settings/poll-settings-form';
import { type WizardStepProps } from '@/components/shared/wizard/wizard.types';
import { Button } from '@/components/ui/button';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useWizardContext } from '@/components/shared/wizard/wizard-hooks';
import { getServerConfigChanges } from '../../server-config-changes.utils';
import {
  type CreateProposalFormSchema,
  type CreateProposalWizardContext,
} from '../create-proposal-form.types';

export const ServerSettingsStep = ({ isLoading }: WizardStepProps) => {
  const proposalForm = useFormContext<CreateProposalFormSchema>();
  const {
    context: { serverConfig, proposedServerConfig },
    onNext,
    onPrevious,
  } = useWizardContext<CreateProposalWizardContext>();
  const { t } = useTranslation();

  if (isLoading || !serverConfig) {
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
          {t('proposals.actionTypes.changeSettings')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('proposals.descriptions.changeSettings')}
        </p>
      </div>

      <PollSettingsForm
        serverConfig={{
          ...serverConfig,
          ...proposedServerConfig,
        }}
        showAnonymousUsers
        renderFooter={(settingsForm) => (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                // Keep edits in progress so they survive a trip back
                proposalForm.setValue('serverConfig', settingsForm.getValues());
                onPrevious();
              }}
            >
              {t('actions.previous')}
            </Button>
            <Button
              onClick={async () => {
                const isValid = await settingsForm.trigger();
                if (!isValid) return;

                const values = settingsForm.getValues();
                const changes = getServerConfigChanges(serverConfig, values);
                if (!Object.keys(changes).length) {
                  settingsForm.setError('root', {
                    message: t(
                      'proposals.errors.changeSettingsRequiresChanges',
                    ),
                  });
                  return;
                }

                proposalForm.setValue('serverConfig', values);
                onNext();
              }}
            >
              {t('actions.next')}
            </Button>
          </div>
        )}
      />
    </div>
  );
};
