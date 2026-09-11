import {
  ACTION_TRANSLATION_KEYS,
  MODEL_TRANSLATION_KEYS,
} from '@/components/polls/proposals/inline-proposal/proposal-metadata.constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { type PollActionType } from '@/types/poll-action.types';
import { formatDeadline } from '@/lib/time.utils';
import { type PollConfigRes } from '@/types/poll.types';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useTranslation } from 'react-i18next';

interface Props {
  actionType?: PollActionType;
  config: PollConfigRes;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProposalSettingsDialog = ({
  actionType,
  config,
  open,
  onOpenChange,
}: Props) => {
  const { t } = useTranslation();

  const decisionMakingModel = config.decisionMakingModel ?? 'consensus';
  const isConsent = decisionMakingModel === 'consent';

  const showVoteLimits = decisionMakingModel !== 'majority-vote';
  const showAgreementThreshold = !isConsent;
  const showQuorum = !isConsent;

  const modelLabel = t(MODEL_TRANSLATION_KEYS[decisionMakingModel]);

  const settings = [
    {
      name: t('proposals.labels.actionType'),
      description: t('proposals.descriptions.actionType'),
      value: actionType ? t(ACTION_TRANSLATION_KEYS[actionType]) : '',
      visible: !!actionType,
    },
    {
      name: t('settings.names.decisionMakingModel'),
      description: isConsent
        ? t('proposals.descriptions.consentRules')
        : t('settings.explanations.decisionMakingModel'),
      value: modelLabel,
      visible: true,
    },
    {
      name: t('settings.names.disagreementsLimit'),
      description: t('settings.explanations.disagreementsLimit'),
      value: config.disagreementsLimit ?? 0,
      visible: showVoteLimits,
    },
    {
      name: t('settings.names.abstainsLimit'),
      description: t('settings.explanations.abstainsLimit'),
      value: config.abstainsLimit ?? 0,
      visible: showVoteLimits,
    },
    {
      name: t('proposals.labels.blocking'),
      description: t('settings.explanations.blocksOpenToAll'),
      value: t(
        config.blocksOpenToAll === false
          ? 'proposals.labels.blockingPermittedRoles'
          : 'proposals.labels.blockingOpenToAll',
      ),
      visible: showVoteLimits,
    },
    {
      name: t('settings.names.agreementThreshold'),
      description: t('settings.explanations.agreementThreshold'),
      value: `${config.agreementThreshold ?? 0}%`,
      visible: showAgreementThreshold,
    },
    {
      name: t('settings.names.quorumEnabled'),
      description: t('settings.explanations.quorumEnabled'),
      value: t(config.quorumEnabled ? 'actions.enabled' : 'actions.disabled'),
      visible: showQuorum,
    },
    {
      name: t('settings.names.quorumThreshold'),
      description: t('settings.explanations.quorumThreshold'),
      value: `${config.quorumThreshold ?? 0}%`,
      visible: showQuorum && config.quorumEnabled === true,
    },
    {
      name: t('proposals.labels.votingDeadline'),
      description: t('proposals.descriptions.votingDeadline'),
      value: config.closingAt
        ? formatDeadline(config.closingAt)
        : t('time.unlimited'),
      visible: true,
    },
  ].filter(({ visible }) => visible);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-h-[calc(100dvh-2rem)] md:max-w-2xl md:overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('proposals.headers.proposalSettings')}</DialogTitle>
          <VisuallyHidden>
            <DialogDescription>
              {t('proposals.descriptions.proposalSettings')}
            </DialogDescription>
          </VisuallyHidden>
        </DialogHeader>

        <dl>
          {settings.map(({ name, description, value }, index) => (
            <div key={name}>
              {index > 0 && <Separator />}
              <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
                <div className="space-y-1">
                  <dt className="font-medium">{name}</dt>
                  <dd className="text-muted-foreground text-sm">
                    {description}
                  </dd>
                </div>
                <dd className="bg-muted/40 text-foreground flex min-h-12 w-full max-w-full shrink-0 items-center justify-center self-start rounded-lg px-3.5 py-2.5 text-center text-base leading-snug sm:w-auto sm:min-w-36 sm:self-auto">
                  {value}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
};
