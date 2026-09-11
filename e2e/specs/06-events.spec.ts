import { expect, type Locator, type Page, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import {
  authorizationHeaders,
  createAuthenticatedUser,
  getOrCreateInstanceAdmin,
  signUpViaApi,
} from '../lib/auth';
import { createTestUser } from '../lib/data';
import { assertUuid, runDatabaseCommand } from '../lib/db';
import { createPlanEventProposal } from '../lib/events';
import { expectImageToLoad } from '../lib/images';
import { createInvite } from '../lib/invites';
import {
  confirmRatifyingVote,
  getPollVoteSummary,
  makeProposalsRatifyWithOneAgreeVote,
  openCreateProposalDialog,
  selectRadixOption,
} from '../lib/polls';
import {
  createServer,
  createServerAdmin,
  getDefaultServer,
} from '../lib/servers';
import { ChatPage } from '../pages/chat.page';

type UserSummary = {
  id: string;
  name: string;
  displayName?: string | null;
};

type ImageSummary = {
  id: string;
  createdAt: string;
};

type ProposedEvent = {
  name: string;
  description: string;
  startsAt: string;
  endsAt: string | null;
  online: boolean;
  location: string | null;
  externalLink: string | null;
  hosts: UserSummary[];
  coverPhoto: ImageSummary | null;
  createdEventId?: string | null;
};

type EventResponse = ProposedEvent & {
  id: string;
  sourcePollActionId: string | null;
  currentUserStatus: 'host' | 'interested' | 'going' | null;
  interestedCount: number;
  goingCount: number;
};

type EventDetailResponse = EventResponse & {
  interested: UserSummary[];
  going: UserSummary[];
};

type PollResponse = {
  poll: {
    id: string;
    images?: ImageSummary[];
    action?: {
      id: string;
      actionType: string;
      event?: ProposedEvent;
    };
  };
};

const selectEventDate = async (
  dialog: Locator,
  page: Page,
  label: string,
  date: Date,
) => {
  const trigger = dialog.getByRole('button', { name: label });
  const displayedDate = new Date((await trigger.textContent())?.trim() || '');
  const visibleDate = Number.isNaN(displayedDate.getTime())
    ? new Date()
    : displayedDate;
  await trigger.click();
  const monthOffset =
    (date.getFullYear() - visibleDate.getFullYear()) * 12 +
    date.getMonth() -
    visibleDate.getMonth();
  const monthButton = page.getByRole('button', {
    name: monthOffset < 0 ? 'Previous month' : 'Next month',
  });
  for (let offset = 0; offset < Math.abs(monthOffset); offset += 1) {
    await monthButton.press('Enter');
  }
  await page
    .getByRole('button', {
      name: new Intl.DateTimeFormat(undefined, {
        dateStyle: 'full',
      }).format(date),
      exact: true,
    })
    .press('Enter');
};

const selectEventTime = async (
  dialog: Locator,
  page: Page,
  label: string,
  date: Date,
) => {
  await dialog.getByRole('button', { name: label }).click();
  await page
    .getByRole('button', {
      name: new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      }).format(date),
      exact: true,
    })
    .click();
};

test.beforeAll(async ({ request }) => {
  await getOrCreateInstanceAdmin(request);
});

test('user can propose and ratify an online event with all details preserved', async ({
  context,
  page,
  request,
}) => {
  test.setTimeout(60_000);

  const proposer = await createAuthenticatedUser(
    request,
    context,
    createTestUser('event-proposer'),
  );
  const host = await signUpViaApi(request, createTestUser('event-host'));
  const server = await getDefaultServer(request, proposer);
  const instanceAdmin = await getOrCreateInstanceAdmin(request);
  await makeProposalsRatifyWithOneAgreeVote(request, instanceAdmin, server.id);

  const eventName = `Online planning session ${proposer.user.suffix}`;
  const eventDescription = `Plan the next campaign phase ${proposer.user.suffix}.`;
  const proposalBody = `Schedule ${eventName}`;
  const externalLink = `https://example.com/events/${proposer.user.suffix}`;
  const startsAt = new Date();
  startsAt.setDate(startsAt.getDate() + 7);
  startsAt.setHours(18, 0, 0, 0);
  const endsAt = new Date(startsAt.getTime() + 8 * 24 * 60 * 60_000);

  const chat = new ChatPage(page);
  await chat.goto();
  await chat.expectChannel('general');

  await openCreateProposalDialog(page);
  const dialog = page.getByRole('dialog', { name: 'Create a New Proposal' });
  await selectRadixOption(dialog, page, 'Select an action type', 'Plan event');
  await dialog
    .getByPlaceholder('Enter your proposal details...')
    .fill(proposalBody);
  await dialog.getByRole('button', { name: 'Next' }).click();

  await dialog.getByLabel('Event name').fill(eventName);
  await dialog.getByLabel('Description').fill(eventDescription);
  await dialog
    .getByTestId('image-input')
    .setInputFiles('e2e/fixtures/valid-image.png');
  await expect(
    dialog.getByRole('img', { name: 'valid-image.png' }),
  ).toBeVisible();
  await selectEventDate(dialog, page, 'Start Date', startsAt);
  await selectEventTime(dialog, page, 'Start Time', startsAt);
  await expect(
    dialog.getByRole('button', { name: 'End Date (optional)' }),
  ).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Add end date and time' }).click();
  await selectEventDate(dialog, page, 'End Date (optional)', endsAt);
  await selectEventTime(dialog, page, 'End Time', endsAt);
  await dialog.getByRole('switch', { name: 'Online' }).click();
  await dialog.getByLabel('Online event link (optional)').fill(externalLink);
  await dialog
    .getByPlaceholder("Type a member's name to add hosts...")
    .fill(host.user.name);
  await dialog.getByText(host.user.name, { exact: true }).click();
  await dialog.getByRole('button', { name: 'Next' }).click();

  await expect(
    dialog.getByRole('heading', { name: 'Plan Event', exact: true }),
  ).toHaveCount(0);
  await expect(dialog.getByText(eventName, { exact: true })).toBeVisible();
  await expect(dialog.getByRole('img', { name: 'Cover photo' })).toBeVisible();
  await expect(
    dialog.getByText(eventDescription, { exact: true }),
  ).toBeVisible();
  await expect(dialog.getByText('Online', { exact: true })).toBeVisible();
  await expect(dialog.getByRole('link', { name: externalLink })).toBeVisible();
  await expect(
    dialog.getByText(`Hosted by ${host.user.name}`, { exact: true }),
  ).toBeVisible();

  const createProposalResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/channels/${server.generalChannelId}/polls`) &&
      response.status() === 200,
  );
  await dialog.getByRole('button', { name: 'Create proposal' }).click();
  const createResponse = await createProposalResponse;
  const { poll } = (await createResponse.json()) as PollResponse;
  const action = poll.action;
  const proposedEvent = action?.event;

  expect(action?.actionType).toBe('plan-event');
  expect(proposedEvent).toBeDefined();
  if (!action || !proposedEvent) {
    throw new Error('Plan-event proposal response did not include its action.');
  }
  expect(proposedEvent).toMatchObject({
    name: eventName,
    description: eventDescription,
    online: true,
    location: null,
    externalLink,
  });
  expect(proposedEvent.hosts.map((user) => user.id)).toEqual([host.userId]);
  expect(proposedEvent.coverPhoto).toBeTruthy();

  await expect(dialog).toBeHidden();
  const proposal = page.getByRole('article', {
    name: `Majority Vote Proposal: ${proposalBody}`,
  });
  await expect(proposal).toBeVisible();
  const eventTrigger = proposal.getByRole('button', {
    name: `Planned event: ${eventName}`,
  });
  await expect(
    eventTrigger.getByRole('img', { name: 'Cover photo' }),
  ).toBeVisible();
  await eventTrigger.click();
  const eventRegion = proposal.getByRole('region', {
    name: `Planned event: ${eventName}`,
  });
  await expect(
    eventRegion.getByRole('heading', { name: eventName, exact: true }),
  ).toBeVisible();
  await expect(
    eventRegion.getByRole('img', { name: 'Cover photo' }),
  ).toBeVisible();

  const proposedCoverResponse = await request.get(
    `/api/servers/${server.id}/channels/${server.generalChannelId}/polls/${poll.id}/event-cover-photos/${proposedEvent.coverPhoto!.id}`,
    { headers: authorizationHeaders(proposer) },
  );
  await expect(proposedCoverResponse).toBeOK();
  expect(proposedCoverResponse.headers()['content-type']).toBe('image/png');
  expect((await proposedCoverResponse.body()).length).toBeGreaterThan(0);
  await expect(
    proposal.getByText(eventDescription, { exact: true }),
  ).toBeVisible();
  await expect(
    proposal.getByRole('link', { name: externalLink }),
  ).toBeVisible();
  await expect(
    proposal.getByText(`Hosted by ${host.user.name}`, { exact: true }),
  ).toBeVisible();
  await expect(proposal.getByRole('link', { name: 'View event' })).toHaveCount(
    0,
  );

  const voteResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/polls/${poll.id}/votes`) &&
      response.status() === 200,
  );
  await proposal.getByRole('button', { name: 'Agree', exact: true }).click();
  await confirmRatifyingVote(page);
  await voteResponse;
  await expect(proposal.getByText('Ratified', { exact: true })).toBeVisible();

  const eventsResponse = await request.get(`/api/servers/${server.id}/events`, {
    headers: authorizationHeaders(proposer),
    params: {
      from: new Date(startsAt.getTime() - 24 * 60 * 60_000).toISOString(),
      to: new Date(endsAt.getTime() + 24 * 60 * 60_000).toISOString(),
    },
  });
  await expect(eventsResponse).toBeOK();
  const events = ((await eventsResponse.json()) as { events: EventResponse[] })
    .events;
  const createdEvents = events.filter(
    (event) => event.sourcePollActionId === action.id,
  );
  expect(createdEvents).toHaveLength(1);
  const createdEvent = createdEvents[0];
  expect(createdEvent).toMatchObject({
    name: proposedEvent.name,
    description: proposedEvent.description,
    startsAt: proposedEvent.startsAt,
    endsAt: proposedEvent.endsAt,
    online: proposedEvent.online,
    location: proposedEvent.location,
    externalLink: proposedEvent.externalLink,
    currentUserStatus: null,
    interestedCount: 0,
    goingCount: 1,
  });
  expect(createdEvent.hosts.map((user) => user.id)).toEqual([host.userId]);
  expect(createdEvent.coverPhoto).toBeTruthy();
  expect(createdEvent.coverPhoto?.id).not.toBe(proposedEvent.coverPhoto?.id);

  const eventCoverResponse = await request.get(
    `/api/servers/${server.id}/events/${createdEvent.id}/cover-photos/${createdEvent.coverPhoto!.id}`,
    { headers: authorizationHeaders(proposer) },
  );
  await expect(eventCoverResponse).toBeOK();
  expect(eventCoverResponse.headers()['content-type']).toBe('image/png');
  expect((await eventCoverResponse.body()).length).toBeGreaterThan(0);

  const viewEventLink = proposal.getByRole('link', { name: 'View event' });
  await expect(viewEventLink).toHaveAttribute(
    'href',
    `/s/${server.slug}/events/${createdEvent.id}`,
  );
  const detailResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'GET' &&
      response.url().includes(`/events/${createdEvent.id}`) &&
      response.status() === 200,
  );
  await viewEventLink.click();
  const detailResponse = await detailResponsePromise;
  const initialDetail = (
    (await detailResponse.json()) as {
      event: EventDetailResponse;
    }
  ).event;
  expect(initialDetail).toMatchObject(createdEvent);
  expect(initialDetail.hosts.map((user) => user.id)).toEqual([host.userId]);
  expect(initialDetail.going.map((user) => user.id)).toEqual([host.userId]);

  await expect(
    page.getByText(eventName, { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByRole('img', { name: 'Cover photo' })).toBeVisible();
  await expect(page.getByText(eventDescription, { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: externalLink })).toBeVisible();
  await expect(
    page.getByText(`Hosted by ${host.user.name}`, { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Toggle active decisions' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
  await expect(page.getByText('No one yet.', { exact: true })).toHaveCount(0);
  await expect(
    page.getByText('Hosts are automatically attending this event.', {
      exact: true,
    }),
  ).toHaveCount(0);

  const interestedResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'PUT' &&
      response.url().includes(`/events/${createdEvent.id}/rsvp`) &&
      response.status() === 200,
  );
  await page.getByRole('button', { name: 'Interested', exact: true }).click();
  const interestedResponse = await interestedResponsePromise;
  const interestedEvent = (
    (await interestedResponse.json()) as {
      event: EventDetailResponse;
    }
  ).event;
  expect(interestedEvent.currentUserStatus).toBe('interested');
  expect(interestedEvent.interested.map((user) => user.id)).toContain(
    proposer.userId,
  );
  await expect(
    page.getByRole('button', { name: 'Interested', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByText('1 Interested · 1 Going', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Your RSVP could not be updated.', { exact: true }),
  ).toHaveCount(0);

  const goingResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'PUT' &&
      response.url().includes(`/events/${createdEvent.id}/rsvp`) &&
      response.status() === 200,
  );
  await page.getByRole('button', { name: 'Going', exact: true }).click();
  const goingResponse = await goingResponsePromise;
  const goingEvent = (
    (await goingResponse.json()) as {
      event: EventDetailResponse;
    }
  ).event;
  expect(goingEvent.currentUserStatus).toBe('going');
  expect(goingEvent.interested.map((user) => user.id)).not.toContain(
    proposer.userId,
  );
  expect(goingEvent.going.map((user) => user.id)).toContain(proposer.userId);
  await expect(
    page.getByRole('button', { name: 'Interested', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false');
  await expect(
    page.getByRole('button', { name: 'Going', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('2 Going', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Your RSVP could not be updated.', { exact: true }),
  ).toHaveCount(0);
});

test('event proposal accepts four attachments plus a cover photo', async ({
  context,
  page,
  request,
}) => {
  const proposer = await createAuthenticatedUser(
    request,
    context,
    createTestUser('event-image-limit'),
  );
  const server = await getDefaultServer(request, proposer);
  const proposalBody = `Event image limit ${proposer.user.suffix}`;
  const eventName = `Five image event ${proposer.user.suffix}`;
  const imageBuffer = await readFile('e2e/fixtures/valid-image.png');
  const attachments = Array.from({ length: 4 }, (_, index) => ({
    name: `attachment-${index + 1}.png`,
    mimeType: 'image/png',
    buffer: imageBuffer,
  }));

  const chat = new ChatPage(page);
  await chat.goto();
  await chat.expectChannel('general');
  await openCreateProposalDialog(page);

  const dialog = page.getByRole('dialog', { name: 'Create a New Proposal' });
  await selectRadixOption(dialog, page, 'Select an action type', 'Plan event');
  await dialog
    .getByPlaceholder('Enter your proposal details...')
    .fill(proposalBody);
  await dialog.getByTestId('image-input').setInputFiles(attachments);
  await dialog.getByRole('button', { name: 'Next' }).click();

  await dialog.getByLabel('Event name').fill(eventName);
  await dialog.getByLabel('Description').fill('Five image boundary coverage.');
  await dialog.getByTestId('image-input').setInputFiles({
    name: 'cover.png',
    mimeType: 'image/png',
    buffer: imageBuffer,
  });
  await dialog.getByRole('switch', { name: 'Online' }).click();
  await dialog
    .getByPlaceholder("Type a member's name to add hosts...")
    .fill(proposer.user.name);
  await dialog.getByText(proposer.user.name, { exact: true }).click();
  await dialog.getByRole('button', { name: 'Next' }).click();

  const createProposalResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/channels/${server.generalChannelId}/polls`) &&
      response.status() === 200,
  );
  await dialog.getByRole('button', { name: 'Create proposal' }).click();
  const response = await createProposalResponse;
  const { poll } = (await response.json()) as PollResponse;

  expect(poll.images).toHaveLength(4);
  expect(poll.action?.event?.coverPhoto).toBeTruthy();
  await expect(dialog).toBeHidden();

  // Located by id rather than accessible name: the decision model is shared
  // server state, so the name depends on what earlier tests left configured
  const proposal = page.locator(`[data-decision-id="${poll.id}"]`);
  await expect(
    proposal.getByRole('img', { name: 'Attached image' }),
  ).toHaveCount(4);
  await expect(
    proposal.getByRole('img', { name: 'Cover photo' }),
  ).toBeVisible();
});

test('invite holder can view events and event details in a non-default server', async ({
  context,
  page,
  request,
}) => {
  const admin = await createServerAdmin(request, 'invite-events-admin');
  const serverSlug = `invite-events-${admin.user.suffix}`;
  await createServer(request, admin, {
    name: `Invite events ${admin.user.suffix}`,
    slug: serverSlug,
    description: 'Non-default server for invited event access.',
  });

  const getServerResponse = await request.get(
    `/api/servers/slug/${serverSlug}`,
    { headers: authorizationHeaders(admin) },
  );
  await expect(getServerResponse).toBeOK();
  const { server } = (await getServerResponse.json()) as {
    server: {
      id: string;
      slug: string;
      generalChannelId: string;
    };
  };

  await makeProposalsRatifyWithOneAgreeVote(request, admin, server.id);
  const eventName = `Invited event ${admin.user.suffix}`;
  const eventDescription = 'Event visible to a logged-out invite holder.';
  const startsAt = new Date(Date.now() + 7 * 24 * 60 * 60_000);
  startsAt.setHours(12, 0, 0, 0);
  const createProposalResponse = await request.post(
    `/api/servers/${server.id}/channels/${server.generalChannelId}/polls`,
    {
      headers: authorizationHeaders(admin),
      multipart: {
        payload: JSON.stringify({
          body: `Plan ${eventName}`,
          pollType: 'proposal',
          action: {
            actionType: 'plan-event',
            event: {
              name: eventName,
              description: eventDescription,
              startsAt: startsAt.toISOString(),
              online: true,
              hostIds: [admin.userId],
            },
          },
        }),
        file: {
          name: 'valid-image.png',
          mimeType: 'image/png',
          buffer: await readFile('e2e/fixtures/valid-image.png'),
        },
      },
    },
  );
  await expect(createProposalResponse).toBeOK();
  const { poll } = (await createProposalResponse.json()) as PollResponse;
  expect(poll.action?.actionType).toBe('plan-event');
  if (!poll.action) {
    throw new Error('Plan-event proposal response did not include its action.');
  }

  const createVoteResponse = await request.post(
    `/api/servers/${server.id}/channels/${server.generalChannelId}/polls/${poll.id}/votes`,
    {
      headers: authorizationHeaders(admin),
      data: { voteType: 'agree' },
    },
  );
  await expect(createVoteResponse).toBeOK();

  const authenticatedEventsResponse = await request.get(
    `/api/servers/${server.id}/events`,
    {
      headers: authorizationHeaders(admin),
      params: {
        from: new Date(startsAt.getTime() - 24 * 60 * 60_000).toISOString(),
        to: new Date(startsAt.getTime() + 24 * 60 * 60_000).toISOString(),
      },
    },
  );
  await expect(authenticatedEventsResponse).toBeOK();
  const createdEvent = (
    (await authenticatedEventsResponse.json()) as {
      events: EventResponse[];
    }
  ).events.find((event) => event.sourcePollActionId === poll.action?.id);
  expect(createdEvent).toBeTruthy();
  if (!createdEvent) {
    throw new Error('Ratified proposal did not create an event.');
  }
  expect(createdEvent.coverPhoto).toBeTruthy();
  if (!createdEvent.coverPhoto) {
    throw new Error('Ratified event did not preserve its cover photo.');
  }

  const inviteToken = await createInvite(request, admin, server.id);
  await context.addInitScript((token) => {
    window.localStorage.removeItem('access_token');
    window.localStorage.setItem('invite-token', token);
  }, inviteToken);

  const eventsPath = `/api/servers/${server.id}/events`;
  const listResponsePromise = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return response.request().method() === 'GET' && url.pathname === eventsPath;
  });
  const coverPath = `${eventsPath}/${createdEvent.id}/cover-photos/${createdEvent.coverPhoto.id}`;
  const coverResponsePromise = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return response.request().method() === 'GET' && url.pathname === coverPath;
  });
  await page.goto(
    `/s/${server.slug}/events?view=list&date=${startsAt.toISOString().slice(0, 10)}`,
  );
  const listResponse = await listResponsePromise;
  const coverResponse = await coverResponsePromise;

  const detailPath = `${eventsPath}/${createdEvent.id}`;
  const detailResponsePromise = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return response.request().method() === 'GET' && url.pathname === detailPath;
  });
  await page.goto(`/s/${server.slug}/events/${createdEvent.id}`);
  const detailResponse = await detailResponsePromise;

  expect(listResponse.status()).toBe(200);
  expect(detailResponse.status()).toBe(200);
  expect(coverResponse.status()).toBe(200);

  await page.goto(
    `/s/${server.slug}/events?view=list&date=${startsAt.toISOString().slice(0, 10)}`,
  );
  const eventLink = page.getByRole('link', { name: new RegExp(eventName) });
  await expect(eventLink).toBeVisible();
  await expectImageToLoad(eventLink.getByRole('img', { name: 'Cover photo' }));
  await eventLink.click();
  await expect(page).toHaveURL(`/s/${server.slug}/events/${createdEvent.id}`);
  await expect(
    page.getByText(eventName, { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByText(eventDescription, { exact: true })).toBeVisible();

  let rsvpRequestCount = 0;
  page.on('request', (pageRequest) => {
    const url = new URL(pageRequest.url());
    if (
      ['PUT', 'DELETE'].includes(pageRequest.method()) &&
      url.pathname === `${detailPath}/rsvp`
    ) {
      rsvpRequestCount += 1;
    }
  });

  const signInPrompt = page.getByText(
    'You need to sign in or sign up to attend events.',
    { exact: true },
  );
  await page.getByRole('button', { name: 'Interested', exact: true }).click();
  await expect(signInPrompt).toBeVisible();
  await page.getByRole('button', { name: 'Going', exact: true }).click();
  expect(rsvpRequestCount).toBe(0);
});

test('past event proposals are rejected and stale proposals expire automatically', async ({
  context,
  page,
  request,
}) => {
  const proposer = await createAuthenticatedUser(
    request,
    context,
    createTestUser('stale-event-proposer'),
  );
  const server = await getDefaultServer(request, proposer);
  const instanceAdmin = await getOrCreateInstanceAdmin(request);
  await makeProposalsRatifyWithOneAgreeVote(request, instanceAdmin, server.id);

  const proposalPath = `/api/servers/${server.id}/channels/${server.generalChannelId}/polls`;
  const planEventAction = (startsAt: Date) => ({
    actionType: 'plan-event',
    event: {
      name: `Time-sensitive event ${proposer.user.suffix}`,
      description: 'This event must still be upcoming when ratified.',
      startsAt: startsAt.toISOString(),
      online: true,
      hostIds: [proposer.userId],
    },
  });

  const pastProposalResponse = await request.post(proposalPath, {
    headers: authorizationHeaders(proposer),
    data: {
      body: `Past event ${proposer.user.suffix}`,
      pollType: 'proposal',
      action: planEventAction(new Date(Date.now() - 60_000)),
    },
  });
  expect(pastProposalResponse.status()).toBe(422);
  await expect(pastProposalResponse.json()).resolves.toEqual({
    error: 'Event start time must be in the future.',
  });

  const proposalBody = `Stale event ${proposer.user.suffix}`;
  const { pollId, actionId, proposal } = await createPlanEventProposal({
    request,
    page,
    proposer,
    serverId: server.id,
    channelId: server.generalChannelId,
    proposalBody,
    event: {
      name: `Time-sensitive event ${proposer.user.suffix}`,
      description: 'This event must still be upcoming when ratified.',
      startsAt: new Date(Date.now() + 60 * 60_000),
      hostIds: [proposer.userId],
    },
  });
  expect(getPollVoteSummary(pollId)).toBe('0:none');

  assertUuid(actionId, 'Poll action ID');
  const updateOutput = runDatabaseCommand(
    `UPDATE poll_action_events SET starts_at = now() - interval '1 minute' WHERE poll_action_id = '${actionId}';`,
  );
  expect(updateOutput).toContain('UPDATE 1');

  await expect(proposal.getByText('Closed', { exact: true })).toBeVisible();
  await expect(
    proposal.getByText(
      'This proposal expired because the event start time passed.',
      { exact: true },
    ),
  ).toHaveCount(0);
  await proposal.getByRole('button', { name: 'Closed', exact: true }).click();
  const voteProgressDialog = page.getByRole('dialog', {
    name: 'Vote Progress',
  });
  await expect(
    voteProgressDialog.getByText(
      'This proposal expired because the event start time passed.',
      { exact: true },
    ),
  ).toBeVisible();
  await expect(proposal.getByRole('link', { name: 'View event' })).toHaveCount(
    0,
  );
  expect(getPollVoteSummary(pollId)).toBe('0:none');

  const eventsResponse = await request.get(`/api/servers/${server.id}/events`, {
    headers: authorizationHeaders(proposer),
    params: {
      from: new Date(Date.now() - 24 * 60 * 60_000).toISOString(),
      to: new Date(Date.now() + 24 * 60 * 60_000).toISOString(),
    },
  });
  await expect(eventsResponse).toBeOK();
  const { events } = (await eventsResponse.json()) as {
    events: EventResponse[];
  };
  expect(
    events.filter((event) => event.sourcePollActionId === actionId),
  ).toHaveLength(0);
});

test('event proposal expires when a proposed host leaves the server', async ({
  context,
  page,
  request,
}) => {
  const proposer = await createAuthenticatedUser(
    request,
    context,
    createTestUser('departed-host-proposer'),
  );
  const host = await signUpViaApi(
    request,
    createTestUser('departed-event-host'),
  );
  const server = await getDefaultServer(request, proposer);
  const instanceAdmin = await getOrCreateInstanceAdmin(request);
  await makeProposalsRatifyWithOneAgreeVote(request, instanceAdmin, server.id);
  const proposalBody = `Event with departing host ${proposer.user.suffix}`;
  const startsAt = new Date(Date.now() + 7 * 24 * 60 * 60_000);
  const { pollId, actionId, proposal } = await createPlanEventProposal({
    request,
    page,
    proposer,
    serverId: server.id,
    channelId: server.generalChannelId,
    proposalBody,
    event: {
      name: `Hosted event ${proposer.user.suffix}`,
      description: 'This event requires its proposed host to remain.',
      startsAt,
      hostIds: [host.userId],
    },
  });

  const removeHostResponse = await request.delete(
    `/api/servers/${server.id}/members`,
    {
      headers: authorizationHeaders(instanceAdmin),
      data: { userIds: [host.userId] },
    },
  );
  await expect(removeHostResponse).toBeOK();

  await expect(proposal.getByText('Closed', { exact: true })).toBeVisible();
  const closedReason =
    'This proposal expired because a proposed event host is no longer a server member.';
  await expect(proposal.getByText(closedReason, { exact: true })).toHaveCount(
    0,
  );
  await proposal.getByRole('button', { name: 'Closed', exact: true }).click();
  const voteProgressDialog = page.getByRole('dialog', {
    name: 'Vote Progress',
  });
  await expect(
    voteProgressDialog.getByText(closedReason, { exact: true }),
  ).toBeVisible();
  await expect(proposal.getByRole('button', { name: 'Agree' })).toHaveCount(0);
  expect(getPollVoteSummary(pollId)).toBe('0:none');

  const eventsResponse = await request.get(`/api/servers/${server.id}/events`, {
    headers: authorizationHeaders(proposer),
    params: {
      from: new Date(startsAt.getTime() - 24 * 60 * 60_000).toISOString(),
      to: new Date(startsAt.getTime() + 24 * 60 * 60_000).toISOString(),
    },
  });
  await expect(eventsResponse).toBeOK();
  const { events } = (await eventsResponse.json()) as {
    events: EventResponse[];
  };
  expect(
    events.filter((event) => event.sourcePollActionId === actionId),
  ).toHaveLength(0);
});
