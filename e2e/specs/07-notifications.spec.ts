import { expect, test } from '@playwright/test';
import {
  authorizationHeaders,
  createAuthenticatedUser,
  getOrCreateInstanceAdmin,
  signUpViaApi,
} from '../lib/auth';
import { createTestUser } from '../lib/data';
import {
  expectUnreadNotifications,
  notificationItem,
  openNotifications,
} from '../lib/notifications';
import { createPlanEventProposal } from '../lib/events';
import {
  createForumChannel,
  createForumPostWithProposal,
  moveProposalToForum,
} from '../lib/forums';
import {
  deleteVoteViaApi,
  expirePollDeadline,
  makeProposalsRatifyWithOneAgreeVote,
  updateVoteViaApi,
  voteViaApi,
} from '../lib/polls';
import { getDefaultServer, updateServerConfig } from '../lib/servers';

type PollResponse = { poll: { id: string } };

test.beforeAll(async ({ request }) => {
  await getOrCreateInstanceAdmin(request);
});

test('proposal vote and ratification notifications open the proposal', async ({
  context,
  page,
  request,
}) => {
  const proposer = await createAuthenticatedUser(
    request,
    context,
    createTestUser('proposal-recipient'),
  );
  const voter = await signUpViaApi(request, createTestUser('proposal-voter'));
  const server = await getDefaultServer(request, proposer);
  const instanceAdmin = await getOrCreateInstanceAdmin(request);
  await makeProposalsRatifyWithOneAgreeVote(request, instanceAdmin, server.id);

  const proposalBody = `Notification proposal ${proposer.user.suffix}`;
  const proposalResponse = await request.post(
    `/api/servers/${server.id}/channels/${server.generalChannelId}/polls`,
    {
      headers: authorizationHeaders(proposer),
      data: {
        body: proposalBody,
        pollType: 'proposal',
        action: { actionType: 'test' },
      },
    },
  );
  await expect(proposalResponse).toBeOK();
  const proposal = ((await proposalResponse.json()) as PollResponse).poll;

  await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);
  await voteViaApi(
    request,
    voter,
    server.id,
    server.generalChannelId,
    proposal.id,
    'agree',
  );
  await expectUnreadNotifications(page, 2);

  const inbox = await openNotifications(page);
  await expect(notificationItem(inbox, 'voted agree')).toBeVisible();
  const outcome = notificationItem(inbox, 'was ratified');
  await expect(outcome).toBeVisible();
  await outcome.getByRole('button').first().click();
  await expect(
    page.getByTestId('feed').locator(`[data-decision-id="${proposal.id}"]`),
  ).toContainText(proposalBody);
});

test('ratified role proposals notify the member they add', async ({
  context,
  page,
  request,
}) => {
  const recipient = await createAuthenticatedUser(
    request,
    context,
    createTestUser('role-proposal-recipient'),
  );
  const voter = await signUpViaApi(
    request,
    createTestUser('role-proposal-voter'),
  );
  const instanceAdmin = await getOrCreateInstanceAdmin(request);
  const server = await getDefaultServer(request, recipient);
  await makeProposalsRatifyWithOneAgreeVote(request, instanceAdmin, server.id);

  const roleName = `e2e-proposed-${recipient.user.suffix}`;
  const proposalResponse = await request.post(
    `/api/servers/${server.id}/channels/${server.generalChannelId}/polls`,
    {
      headers: authorizationHeaders(instanceAdmin),
      data: {
        body: `Create the ${roleName} role`,
        pollType: 'proposal',
        action: {
          actionType: 'create-role',
          serverRole: {
            name: roleName,
            color: '#2196f3',
            members: [{ userId: recipient.userId, changeType: 'add' }],
            permissions: [],
          },
        },
      },
    },
  );
  await expect(proposalResponse).toBeOK();
  const proposal = ((await proposalResponse.json()) as PollResponse).poll;

  await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);
  await expect(page.getByTestId('notification-bell')).toBeVisible();
  await voteViaApi(
    request,
    voter,
    server.id,
    server.generalChannelId,
    proposal.id,
    'agree',
  );

  // The proposal itself notified them as a channel member, the grant second
  await expectUnreadNotifications(page, 2);
  const inbox = await openNotifications(page);
  await expect(
    notificationItem(inbox, 'created a new proposal in #general'),
  ).toBeVisible();
  await expect(
    notificationItem(inbox, `You were granted the ${roleName} role`),
  ).toBeVisible();
});

test('proposals that close without passing notify their author', async ({
  context,
  page,
  request,
}) => {
  const proposer = await createAuthenticatedUser(
    request,
    context,
    createTestUser('closed-proposal'),
  );
  const server = await getDefaultServer(request, proposer);
  const instanceAdmin = await getOrCreateInstanceAdmin(request);
  await makeProposalsRatifyWithOneAgreeVote(request, instanceAdmin, server.id);

  const proposalBody = `Closing proposal ${proposer.user.suffix}`;
  const proposalResponse = await request.post(
    `/api/servers/${server.id}/channels/${server.generalChannelId}/polls`,
    {
      headers: authorizationHeaders(proposer),
      data: {
        body: proposalBody,
        pollType: 'proposal',
        action: { actionType: 'test' },
      },
    },
  );
  await expect(proposalResponse).toBeOK();
  const proposal = ((await proposalResponse.json()) as PollResponse).poll;

  await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);
  await expect(page.getByTestId('notification-bell')).toBeVisible();

  // Nobody voted, so the deadline closes the proposal instead of ratifying it
  expirePollDeadline(proposal.id);

  await expectUnreadNotifications(page, 1);
  const inbox = await openNotifications(page);
  const closure = notificationItem(inbox, 'Your proposal in #general closed');
  await expect(closure).toBeVisible();

  await closure.getByRole('button').first().click();
  await expect(
    page.getByTestId('feed').locator(`[data-decision-id="${proposal.id}"]`),
  ).toContainText(proposalBody);
});

test('event proposals that expire early notify their author', async ({
  context,
  page,
  request,
}) => {
  const proposer = await createAuthenticatedUser(
    request,
    context,
    createTestUser('stale-event-proposal'),
  );
  const host = await signUpViaApi(request, createTestUser('stale-event-host'));
  const server = await getDefaultServer(request, proposer);
  const instanceAdmin = await getOrCreateInstanceAdmin(request);
  await makeProposalsRatifyWithOneAgreeVote(request, instanceAdmin, server.id);

  const proposalBody = `Stale event proposal ${proposer.user.suffix}`;
  await createPlanEventProposal({
    request,
    page,
    proposer,
    serverId: server.id,
    channelId: server.generalChannelId,
    proposalBody,
    event: {
      name: `Stale event ${proposer.user.suffix}`,
      description: 'This event requires its proposed host to remain.',
      startsAt: new Date(Date.now() + 7 * 24 * 60 * 60_000),
      hostIds: [host.userId],
    },
  });

  // Losing its proposed host makes the proposal stale, so the synchronizer
  // closes it early
  const removeHostResponse = await request.delete(
    `/api/servers/${server.id}/members`,
    {
      headers: authorizationHeaders(instanceAdmin),
      data: { userIds: [host.userId] },
    },
  );
  await expect(removeHostResponse).toBeOK();

  await expectUnreadNotifications(page, 1);
  const inbox = await openNotifications(page);
  await expect(
    notificationItem(inbox, 'Your proposal in #general closed'),
  ).toBeVisible();
});

test('changing a vote re-notifies the proposal author with the new vote', async ({
  context,
  page,
  request,
}) => {
  const author = await createAuthenticatedUser(
    request,
    context,
    createTestUser('vote-change-author'),
  );
  const voter = await signUpViaApi(
    request,
    createTestUser('vote-change-voter'),
  );
  const server = await getDefaultServer(request, author);
  const instanceAdmin = await getOrCreateInstanceAdmin(request);

  // A future deadline keeps the proposal in voting, so the vote can change
  await updateServerConfig(request, instanceAdmin, server.id, {
    decisionMakingModel: 'majority-vote',
    agreementThreshold: 51,
    quorumEnabled: false,
    votingTimeLimit: 60,
  });

  const proposalBody = `Vote change proposal ${author.user.suffix}`;
  const proposalResponse = await request.post(
    `/api/servers/${server.id}/channels/${server.generalChannelId}/polls`,
    {
      headers: authorizationHeaders(author),
      data: {
        body: proposalBody,
        pollType: 'proposal',
        action: { actionType: 'test' },
      },
    },
  );
  await expect(proposalResponse).toBeOK();
  const proposal = ((await proposalResponse.json()) as PollResponse).poll;

  await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);
  await expect(page.getByTestId('notification-bell')).toBeVisible();

  const voteId = await voteViaApi(
    request,
    voter,
    server.id,
    server.generalChannelId,
    proposal.id,
    'agree',
  );
  const inbox = await openNotifications(page);
  await expect(notificationItem(inbox, 'voted agree')).toBeVisible();

  // One voter keeps one inbox entry, refreshed to whatever they voted last
  await updateVoteViaApi(
    request,
    voter,
    server.id,
    server.generalChannelId,
    proposal.id,
    voteId,
    'disagree',
  );
  await expect(notificationItem(inbox, 'voted disagree')).toBeVisible();
  await expect(notificationItem(inbox, 'voted agree')).toHaveCount(0);

  // Withdrawing the vote retracts the entry from the open inbox
  await deleteVoteViaApi(
    request,
    voter,
    server.id,
    server.generalChannelId,
    proposal.id,
    voteId,
  );
  await expect(notificationItem(inbox, 'voted disagree')).toHaveCount(0);
  await expectUnreadNotifications(page, 0);

  // Re-casting after a removal is still a change the author should see
  await voteViaApi(
    request,
    voter,
    server.id,
    server.generalChannelId,
    proposal.id,
    'abstain',
  );
  await expect(notificationItem(inbox, 'voted abstain')).toBeVisible();
  await expect(notificationItem(inbox, 'voted disagree')).toHaveCount(0);
});

test('new proposals notify the other members of a text channel', async ({
  context,
  page,
  request,
}) => {
  const member = await createAuthenticatedUser(
    request,
    context,
    createTestUser('new-proposal-member'),
  );
  const proposer = await signUpViaApi(
    request,
    createTestUser('new-proposal-author'),
  );
  const server = await getDefaultServer(request, member);
  const instanceAdmin = await getOrCreateInstanceAdmin(request);
  await makeProposalsRatifyWithOneAgreeVote(request, instanceAdmin, server.id);

  await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);
  await expect(page.getByTestId('notification-bell')).toBeVisible();

  const proposalBody = `Channel proposal ${member.user.suffix}`;
  const proposalResponse = await request.post(
    `/api/servers/${server.id}/channels/${server.generalChannelId}/polls`,
    {
      headers: authorizationHeaders(proposer),
      data: {
        body: proposalBody,
        pollType: 'proposal',
        action: { actionType: 'test' },
      },
    },
  );
  await expect(proposalResponse).toBeOK();
  const proposal = ((await proposalResponse.json()) as PollResponse).poll;

  await expectUnreadNotifications(page, 1);
  const inbox = await openNotifications(page);
  const item = notificationItem(inbox, 'created a new proposal in #general');
  await expect(item).toBeVisible();

  await item.getByRole('button').first().click();
  await expect(
    page.getByTestId('feed').locator(`[data-decision-id="${proposal.id}"]`),
  ).toContainText(proposalBody);
});

test('forum proposals notify the other members of the forum channel', async ({
  context,
  page,
  request,
}) => {
  const member = await createAuthenticatedUser(
    request,
    context,
    createTestUser('forum-proposal-member'),
  );
  const proposer = await signUpViaApi(
    request,
    createTestUser('forum-proposal-author'),
  );
  const server = await getDefaultServer(request, member);
  const instanceAdmin = await getOrCreateInstanceAdmin(request);
  await makeProposalsRatifyWithOneAgreeVote(request, instanceAdmin, server.id);

  // Created last, so both members are enrolled in it
  const channelName = `decisions-${member.user.suffix}`;
  const forumChannel = await createForumChannel(
    request,
    instanceAdmin,
    server.id,
    channelName,
  );

  await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);
  await expect(page.getByTestId('notification-bell')).toBeVisible();

  const post = await createForumPostWithProposal(
    request,
    proposer,
    server.id,
    forumChannel.id,
    `Forum proposal post ${member.user.suffix}`,
    `Forum proposal ${member.user.suffix}`,
  );

  await expectUnreadNotifications(page, 1);
  const inbox = await openNotifications(page);
  const item = notificationItem(
    inbox,
    `created a new proposal in #${channelName}`,
  );
  await expect(item).toBeVisible();

  await item.getByRole('button').first().click();
  await expect(page).toHaveURL(new RegExp(`/posts/${post.id}$`));
});

test('moving a proposal to a forum notifies the destination channel', async ({
  context,
  page,
  request,
}) => {
  const member = await createAuthenticatedUser(
    request,
    context,
    createTestUser('moved-proposal-member'),
  );
  const proposer = await signUpViaApi(
    request,
    createTestUser('moved-proposal-author'),
  );
  const server = await getDefaultServer(request, member);
  const instanceAdmin = await getOrCreateInstanceAdmin(request);
  await makeProposalsRatifyWithOneAgreeVote(request, instanceAdmin, server.id);

  const channelName = `moved-${member.user.suffix}`;
  const forumChannel = await createForumChannel(
    request,
    instanceAdmin,
    server.id,
    channelName,
  );

  await page.goto(`/s/${server.slug}/c/${server.generalChannelId}`);
  await expect(page.getByTestId('notification-bell')).toBeVisible();

  const proposalBody = `Movable proposal ${member.user.suffix}`;
  const proposalResponse = await request.post(
    `/api/servers/${server.id}/channels/${server.generalChannelId}/polls`,
    {
      headers: authorizationHeaders(proposer),
      data: {
        body: proposalBody,
        pollType: 'proposal',
        action: { actionType: 'test' },
      },
    },
  );
  await expect(proposalResponse).toBeOK();
  const proposal = ((await proposalResponse.json()) as PollResponse).poll;
  await expectUnreadNotifications(page, 1);

  const post = await moveProposalToForum(
    request,
    proposer,
    server.id,
    server.generalChannelId,
    proposal.id,
    forumChannel.id,
    `Moved proposal ${member.user.suffix}`,
  );

  // The move is announced in the destination, on top of the original channel
  await expectUnreadNotifications(page, 2);
  const inbox = await openNotifications(page);
  const item = notificationItem(
    inbox,
    `created a new proposal in #${channelName}`,
  );
  await expect(item).toBeVisible();

  await item.getByRole('button').first().click();
  await expect(page).toHaveURL(new RegExp(`/posts/${post.id}$`));
});

test('ratified event proposals notify the hosts they name', async ({
  context,
  page,
  request,
}) => {
  const host = await createAuthenticatedUser(
    request,
    context,
    createTestUser('event-notification-host'),
  );
  const proposer = await signUpViaApi(
    request,
    createTestUser('event-notification-author'),
  );
  const server = await getDefaultServer(request, host);
  const instanceAdmin = await getOrCreateInstanceAdmin(request);
  await makeProposalsRatifyWithOneAgreeVote(request, instanceAdmin, server.id);

  const eventName = `Planning meeting ${host.user.suffix}`;
  const proposalBody = `Event proposal ${host.user.suffix}`;
  const { pollId } = await createPlanEventProposal({
    request,
    page,
    proposer,
    serverId: server.id,
    channelId: server.generalChannelId,
    proposalBody,
    event: {
      name: eventName,
      description: 'A meeting to plan the next cycle.',
      startsAt: new Date(Date.now() + 7 * 24 * 60 * 60_000),
      hostIds: [host.userId],
    },
  });

  await voteViaApi(
    request,
    proposer,
    server.id,
    server.generalChannelId,
    pollId,
    'agree',
  );

  const inbox = await openNotifications(page);
  const item = notificationItem(inbox, `${eventName} was scheduled`);
  await expect(item).toBeVisible();

  await item.getByRole('button').first().click();
  await expect(page.getByRole('heading', { name: eventName })).toBeVisible();
});
