import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ProposalRuleRow } from '@/components/polls/proposals/inline-proposal/proposal-rule-row';
import { useAbility } from '@/hooks/use-ability';
import { getProgressPercentage, getProposalRuleStatus } from '@/lib/poll.utils';
import { formatDeadline } from '@/lib/time.utils';
import {
  type PollClosedReason,
  type PollConfigRes,
  type PollStage,
} from '@/types/poll.types';
import { type VoteRes } from '@/types/vote.types';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useTranslation } from 'react-i18next';
import { LuClock3, LuTrendingUp } from 'react-icons/lu';
import { MdHowToVote } from 'react-icons/md';

interface Props {
  votes: VoteRes[];
  config: PollConfigRes;
  memberCount: number;
  stage?: PollStage;
  closedReason?: PollClosedReason;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VoteProgressDialog = ({
  votes,
  config,
  memberCount,
  stage,
  closedReason,
  isOpen,
  onOpenChange,
}: Props) => {
  const { t } = useTranslation();
  const { serverAbility } = useAbility();

  const status = getProposalRuleStatus(votes, config, memberCount);
  const showAgreement = status.agreementApplies;
  const showLimits = status.limitsApply;

  const quorumPercentage = getProgressPercentage(
    status.totalVotes,
    status.requiredQuorum,
  );

  const votingDeadline = config.closingAt
    ? formatDeadline(config.closingAt)
    : t('time.unlimited');

  // Limits can only be satisfied by votes, so they stay pending until one lands
  const limitsPending = status.totalVotes === 0;

  // Rules that do not apply to this model already report as met, so only the
  // conditions that actually failed are named here
  const failedRules =
    stage === 'closed' && !closedReason
      ? [
          status.agreementMet ? null : t('proposals.labels.approval'),
          status.quorumMet ? null : t('proposals.labels.quorum'),
          status.disagreementsMet ? null : t('proposals.labels.disagreements'),
          status.abstainsMet ? null : t('proposals.labels.abstentions'),
          status.blocksMet ? null : t('proposals.labels.blocks'),
          status.deadlineRequired && !config.closingAt
            ? t('proposals.labels.deadline')
            : null,
        ].filter((rule): rule is string => !!rule)
      : [];

  // Mirrors the vote buttons: the block option is hidden for this member, so
  // the rules have to explain why rather than leaving it looking broken
  const blockingRoleRestricted =
    config.decisionMakingModel !== 'majority-vote' &&
    !serverAbility.can('create', 'ProposalBlock') &&
    config.blocksOpenToAll === false;

  const showEligibleAtDeadline =
    status.passes && !!config.closingAt && !status.deadlineReached;

  const showEligibleNow =
    status.passes && !config.closingAt && !status.deadlineRequired;

  const showOutcome =
    showEligibleAtDeadline || showEligibleNow || failedRules.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button className="flex cursor-pointer items-center gap-1.5">
          <MdHowToVote className="text-muted-foreground" />
          <span>
            {t('proposals.labels.totalVotes', { count: status.totalVotes })}
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="md:w-lg">
        <DialogHeader>
          <DialogTitle className="mb-0">
            {t('proposals.headers.voteProgress')}
          </DialogTitle>
          <VisuallyHidden>
            <DialogDescription>
              {t('proposals.headers.voteProgress')}
            </DialogDescription>
          </VisuallyHidden>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {config.decisionMakingModel === 'consent' && (
            <p className="border-border bg-muted/50 text-muted-foreground rounded-md border px-3 py-2 text-sm">
              {t('proposals.descriptions.consentRules')}
            </p>
          )}

          {config.decisionMakingModel === 'consensus' && (
            <p className="border-border bg-muted/50 text-muted-foreground rounded-md border px-3 py-2 text-sm">
              {t('proposals.descriptions.consensusRules')}
            </p>
          )}

          {blockingRoleRestricted && (
            <p className="border-border bg-muted/50 text-muted-foreground rounded-md border px-3 py-2 text-sm">
              {t('proposals.descriptions.blocksRoleRestricted')}
            </p>
          )}

          {showEligibleAtDeadline && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
              <LuClock3 className="size-4 shrink-0" aria-hidden="true" />
              <p>{t('proposals.outcomes.eligibleAtDeadline')}</p>
            </div>
          )}

          {showEligibleNow && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
              <LuTrendingUp className="size-4 shrink-0" aria-hidden="true" />
              <p>{t('proposals.outcomes.eligibleNow')}</p>
            </div>
          )}

          {failedRules.length > 0 && (
            <p className="text-destructive text-sm">
              {t('proposals.outcomes.failedRules', {
                rules: failedRules.join(', '),
              })}
            </p>
          )}

          {closedReason === 'event-start-elapsed' && (
            <p className="border-border bg-muted/50 text-muted-foreground rounded-md border px-3 py-2 text-sm">
              {t('proposals.outcomes.eventStartElapsed')}
            </p>
          )}

          {closedReason === 'event-host-ineligible' && (
            <p className="border-border bg-muted/50 text-muted-foreground rounded-md border px-3 py-2 text-sm">
              {t('proposals.outcomes.eventHostIneligible')}
            </p>
          )}

          {showOutcome && showAgreement && <Separator />}

          {showAgreement && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {t('proposals.labels.thresholdProgress')}
                </span>
                <span
                  className={
                    status.agreementMet
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-muted-foreground'
                  }
                >
                  {status.agreementMet
                    ? t('proposals.labels.thresholdMet')
                    : t('proposals.labels.thresholdNotMet')}
                </span>
              </div>
              <Progress value={status.approvalPercentage} />
              <div className="space-y-0.5 text-sm">
                <p className="text-muted-foreground">
                  {status.approvalVoteCount === 0
                    ? t('proposals.descriptions.approvalNoVotes', {
                        threshold: config.agreementThreshold,
                      })
                    : t('proposals.descriptions.approvalStatus', {
                        agreements: status.agreements,
                        count: status.approvalVoteCount,
                        threshold: config.agreementThreshold,
                      })}
                </p>
                <p className="text-muted-foreground">
                  {t('proposals.descriptions.approvalParticipantNote')}
                </p>
              </div>
            </div>
          )}

          {status.quorumApplies && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {t('proposals.labels.quorumProgress')}
                </span>
                <span
                  className={
                    status.quorumMet
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-muted-foreground'
                  }
                >
                  {status.quorumMet
                    ? t('proposals.labels.quorumMet')
                    : t('proposals.labels.quorumNotMet')}
                </span>
              </div>
              <Progress value={quorumPercentage} />
              <div className="space-y-0.5 text-sm">
                <p className="text-muted-foreground">
                  {t('proposals.descriptions.quorumStatus', {
                    current: status.totalVotes,
                    required: status.requiredQuorum,
                  })}
                </p>
                <p className="text-muted-foreground">
                  {t('proposals.descriptions.quorumRequirement', {
                    threshold: config.quorumThreshold,
                    memberCount,
                  })}
                </p>
              </div>
            </div>
          )}

          {showLimits && <Separator />}

          {showLimits && (
            <div className="grid gap-3 text-sm">
              <ProposalRuleRow
                label={t('proposals.labels.disagreementLimit')}
                value={t('proposals.descriptions.voteLimitStatus', {
                  current: status.disagreements,
                  limit: config.disagreementsLimit ?? 0,
                })}
                met={status.disagreementsMet}
                pending={limitsPending}
              />
              <ProposalRuleRow
                label={t('proposals.labels.abstentionLimit')}
                value={t('proposals.descriptions.voteLimitStatus', {
                  current: status.abstains,
                  limit: config.abstainsLimit ?? 0,
                })}
                met={status.abstainsMet}
                pending={limitsPending}
              />
              <ProposalRuleRow
                label={t('proposals.labels.blockStatus')}
                value={t('proposals.descriptions.blockStatus', {
                  count: status.blocks,
                })}
                met={status.blocksMet}
                pending={limitsPending}
              />
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="font-medium">
              {t('proposals.labels.votingDeadline')}
            </span>
            <span className="text-muted-foreground">{votingDeadline}</span>
          </div>

          {status.ignoredBlocks > 0 && (
            <p className="text-muted-foreground text-sm">
              {t('proposals.descriptions.ignoredBlocks', {
                count: status.ignoredBlocks,
              })}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
