import { expect, type APIRequestContext, type Page } from '@playwright/test';
import { ChatPage } from '../pages/chat.page';
import { authorizationHeaders, type AuthenticatedUser } from './auth';

type CreatePlanEventProposalOptions = {
  request: APIRequestContext;
  page: Page;
  proposer: AuthenticatedUser;
  serverId: string;
  channelId: string;
  proposalBody: string;
  event: {
    name: string;
    description: string;
    startsAt: Date;
    hostIds: string[];
  };
};

type PlanEventProposalResponse = {
  poll: {
    id: string;
    action?: {
      id: string;
      actionType: string;
    };
  };
};

export async function createPlanEventProposal({
  request,
  page,
  proposer,
  serverId,
  channelId,
  proposalBody,
  event,
}: CreatePlanEventProposalOptions) {
  const response = await request.post(
    `/api/servers/${serverId}/channels/${channelId}/polls`,
    {
      headers: authorizationHeaders(proposer),
      data: {
        body: proposalBody,
        pollType: 'proposal',
        action: {
          actionType: 'plan-event',
          event: {
            ...event,
            startsAt: event.startsAt.toISOString(),
            online: true,
          },
        },
      },
    },
  );
  await expect(response).toBeOK();

  const { poll } = (await response.json()) as PlanEventProposalResponse;
  expect(poll.action?.actionType).toBe('plan-event');
  if (!poll.action) {
    throw new Error('Plan-event proposal response did not include its action.');
  }

  const chat = new ChatPage(page);
  await chat.goto();
  await chat.expectChannel('general');

  const proposal = page.getByRole('article', {
    name: `Majority Vote Proposal: ${proposalBody}`,
  });
  await expect(proposal).toBeVisible();
  await expect(proposal.getByText('Voting', { exact: true })).toBeVisible();

  return {
    pollId: poll.id,
    actionId: poll.action.id,
    proposal,
  };
}
