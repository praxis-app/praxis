import { ProposalMetadata } from '@/components/polls/proposals/inline-proposal/proposal-metadata';
import { ProposalSettingsDialog } from '@/components/polls/proposals/proposal-settings-dialog';
import { ProposalStatusBadge } from '@/components/polls/proposals/inline-proposal/proposal-status-badge';
import { VoteProgressDialog } from '@/components/polls/proposals/inline-proposal/vote-progress-dialog';
import { Button } from '@/components/ui/button';
import { useAuthData } from '@/hooks/use-auth-data';
import { cn } from '@/lib/shared.utils';
import { type PollConfigRes, type PollRes } from '@/types/poll.types';
import { type VoteRes, type VoteType } from '@/types/vote.types';
import { ChevronUp, Minus, MoreHorizontal, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const proposalConfig = {
  decisionMakingModel: 'consensus',
  agreementThreshold: 75,
  quorumEnabled: true,
  quorumThreshold: 50,
  disagreementsLimit: 1,
  abstainsLimit: 2,
} satisfies PollConfigRes;

const proposalVotes = [
  { id: 'landing-vote-1', voteType: 'agree' },
  { id: 'landing-vote-2', voteType: 'agree' },
  { id: 'landing-vote-3', voteType: 'agree' },
  { id: 'landing-vote-4', voteType: 'agree' },
  { id: 'landing-vote-5', voteType: 'agree' },
  { id: 'landing-vote-6', voteType: 'agree' },
  { id: 'landing-vote-7', voteType: 'abstain' },
] satisfies VoteRes[];

const voteTypes = [
  'agree',
  'disagree',
  'abstain',
  'block',
] satisfies VoteType[];

export const LandingProposalVisual = () => {
  const [isActionExpanded, setIsActionExpanded] = useState(true);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isVoteProgressDialogOpen, setIsVoteProgressDialogOpen] =
    useState(false);

  const { isRegistered } = useAuthData();
  const { t } = useTranslation();

  const proposal = {
    id: 'landing-proposal',
    body: t('landing.visuals.proposal.body'),
    pollType: 'proposal',
    stage: 'ratified',
    config: proposalConfig,
    user: {
      id: 'landing-user',
      name: 'Ari',
      profilePicture: null,
    },
    votes: proposalVotes,
    images: [],
    agreementVoteCount: 6,
    memberCount: 8,
    replyCount: 0,
    latestReplyAt: null,
    createdAt: new Date(0).toISOString(),
  } satisfies PollRes;

  const handleVoteAttempt = () => {
    toast(
      t(
        isRegistered
          ? 'landing.proposal.openAppToVote'
          : 'landing.proposal.signUpToVote',
      ),
      { id: 'landing-proposal-vote-prompt' },
    );
  };

  return (
    <>
      <div className="flex w-full max-w-full min-w-0 gap-4 pt-1">
        <div className="bg-praxis-coral-soft text-praxis-coral mt-0.5 hidden size-10 shrink-0 items-center justify-center rounded-full text-lg font-light sm:flex">
          AR
        </div>
        <div className="w-full max-w-full min-w-0 flex-1">
          <div className="hidden min-w-0 items-center gap-1.5 pb-1 sm:flex">
            <span className="font-medium">Ari</span>
            <span className="text-muted-foreground text-sm">
              {t('landing.visuals.proposal.timestamp')}
            </span>
          </div>

          <div className="border-border bg-card before:border-l-border relative w-full max-w-full min-w-0 rounded-md border px-3 py-3.5 shadow-xl shadow-black/5 before:absolute before:inset-y-0 before:left-0 before:w-3 before:rounded-l-md before:border-l-3">
            <button
              type="button"
              aria-label={t('proposals.actions.viewSettings')}
              className="text-muted-foreground focus-visible:ring-ring absolute top-3 right-3 cursor-pointer rounded-sm focus-visible:ring-2 focus-visible:outline-none"
              onClick={() => setIsSettingsDialogOpen(true)}
            >
              <MoreHorizontal className="size-5" />
            </button>

            <ProposalMetadata
              actionType="change-role"
              decisionMakingModel="consensus"
              variant="forum"
              onClick={() => setIsSettingsDialogOpen(true)}
            />

            <p className="pt-3 pb-3 text-sm wrap-break-word sm:text-base">
              {proposal.body}
            </p>

            <div className="mb-3 rounded-lg bg-black/2 px-3 dark:bg-black/10">
              <button
                type="button"
                aria-expanded={isActionExpanded}
                className="focus-visible:ring-ring flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-sm py-3 text-left text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none"
                onClick={() => setIsActionExpanded((isExpanded) => !isExpanded)}
              >
                <ChevronUp
                  className={cn(
                    'size-4 shrink-0 transition-transform',
                    !isActionExpanded && 'rotate-180',
                  )}
                />
                <span className="min-w-0 truncate">
                  {t('landing.visuals.proposal.actionTitle')}{' '}
                  <span
                    className="mr-1 inline-block size-3.5 rounded-full align-[-1px]"
                    style={{ backgroundColor: '#e91e63' }}
                  />
                  <span className="font-normal">
                    {t('landing.visuals.proposal.roleName')}
                  </span>
                </span>
              </button>

              {isActionExpanded && (
                <div className="grid gap-x-6 gap-y-4 px-1 pb-4 sm:grid-cols-2">
                  <div className="min-w-0 space-y-2">
                    <p className="text-xs font-medium sm:text-sm">
                      {t('landing.visuals.proposal.nameLabel')}
                    </p>
                    <div
                      className="flex min-w-0 items-center gap-2 border px-1.5 py-1.5 text-xs sm:text-sm"
                      style={{ borderRadius: 4 }}
                    >
                      <span
                        className="flex size-4.5 shrink-0 items-center justify-center bg-[#fee2e2] text-[#b91c1c] dark:bg-[#432d2b] dark:text-[#ff2727]"
                        style={{ borderRadius: 4 }}
                      >
                        <Minus className="size-3.5" />
                      </span>
                      <span className="min-w-0 truncate">
                        {t('landing.visuals.proposal.previousRoleName')}
                      </span>
                    </div>
                    <div
                      className="flex min-w-0 items-center gap-2 border px-1.5 py-1.5 text-xs sm:text-sm"
                      style={{ borderRadius: 4 }}
                    >
                      <span
                        className="flex size-4.5 shrink-0 items-center justify-center bg-[#dcfce7] text-[#15803d] dark:bg-[#2e4532] dark:text-[#0cff4f]"
                        style={{ borderRadius: 4 }}
                      >
                        <Plus className="size-3.5" />
                      </span>
                      <span className="min-w-0 truncate">
                        {t('landing.visuals.proposal.roleName')}
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 space-y-2">
                    <p className="text-xs font-medium sm:text-sm">
                      {t('landing.visuals.proposal.permissionsLabel')}
                    </p>
                    <div
                      className="flex min-w-0 items-center gap-2 border px-1.5 py-1.5 text-xs sm:text-sm"
                      style={{ borderRadius: 4 }}
                    >
                      <span
                        className="flex size-4.5 shrink-0 items-center justify-center bg-[#dcfce7] text-[#15803d] dark:bg-[#2e4532] dark:text-[#0cff4f]"
                        style={{ borderRadius: 4 }}
                      >
                        <Plus className="size-3.5" />
                      </span>
                      <span className="min-w-0 truncate">
                        {t('landing.visuals.proposal.manageChannels')}
                      </span>
                    </div>
                    <div
                      className="flex min-w-0 items-center gap-2 border px-1.5 py-1.5 text-xs sm:text-sm"
                      style={{ borderRadius: 4 }}
                    >
                      <span
                        className="flex size-4.5 shrink-0 items-center justify-center bg-[#dcfce7] text-[#15803d] dark:bg-[#2e4532] dark:text-[#0cff4f]"
                        style={{ borderRadius: 4 }}
                      >
                        <Plus className="size-3.5" />
                      </span>
                      <span className="min-w-0 truncate">
                        {t('landing.visuals.proposal.createInvites')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {voteTypes.map((voteType) => (
                <Button
                  key={voteType}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="col-span-1"
                  onClick={handleVoteAttempt}
                >
                  {t(`proposals.actions.${voteType}`)}
                </Button>
              ))}
            </div>

            <div className="border-border mt-5 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
              <div className="text-muted-foreground flex items-center text-xs sm:text-sm">
                <VoteProgressDialog
                  votes={proposalVotes}
                  config={proposalConfig}
                  memberCount={proposal.memberCount}
                  isOpen={isVoteProgressDialogOpen}
                  onOpenChange={setIsVoteProgressDialogOpen}
                />
                <span className="px-1.5" aria-hidden="true">
                  ·
                </span>
                <span>{t('landing.visuals.proposal.noDeadline')}</span>
              </div>
              <ProposalStatusBadge
                poll={proposal}
                onClick={() => setIsVoteProgressDialogOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>

      <ProposalSettingsDialog
        actionType="change-role"
        config={proposalConfig}
        open={isSettingsDialogOpen}
        onOpenChange={setIsSettingsDialogOpen}
      />
    </>
  );
};
