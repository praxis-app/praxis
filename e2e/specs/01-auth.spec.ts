import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createAuthenticatedUser,
  getOrCreateInstanceAdmin,
  isFirstUser,
  setupAnonymousSession,
  signUpViaApi,
} from '../lib/auth';
import { createTestUser, INSTANCE_ADMIN_USER } from '../lib/data';
import { createInvite } from '../lib/invites';
import {
  createServer,
  createServerAdmin,
  getDefaultServer,
  joinServer,
} from '../lib/servers';
import { AuthPage } from '../pages/auth.page';
import { ChatPage } from '../pages/chat.page';
import { NavigationPage } from '../pages/navigation.page';

const fixturePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../fixtures/valid-image.png',
);

test('user can sign up from the landing page', async ({ page, request }) => {
  // Only the very first user can sign up without an invite, so the same
  // landing page flow is reached through an invite once the instance has one
  const isFirstSignup = await isFirstUser(request);
  const user = isFirstSignup
    ? INSTANCE_ADMIN_USER
    : createTestUser('landing-signup');
  const auth = new AuthPage(page);
  const chat = new ChatPage(page);
  const navigation = new NavigationPage(page);

  if (isFirstSignup) {
    await auth.gotoLanding();
    await auth.followSignupLink();
  } else {
    const admin = await getOrCreateInstanceAdmin(request);
    const server = await getDefaultServer(request, admin);
    const inviteToken = await createInvite(request, admin, server.id);

    await page.goto(`/i/${inviteToken}`);
    await expect(page).toHaveURL('/about');
    await page
      .getByRole('link', { name: 'Accept invite', exact: true })
      .first()
      .click();
  }
  await auth.signUp(user);

  await auth.expectSignedUp();
  await chat.expectChannel('general');
  await navigation.expectSignedInUser(user);
  await navigation.expectAccessTokenPersisted();
});

test('anonymous user can register from the landing page', async ({
  context,
  page,
  request,
}) => {
  await setupAnonymousSession(request, context, 'anon-upgrade');
  const user = createTestUser('anon-upgrade');
  const auth = new AuthPage(page);
  const chat = new ChatPage(page);
  const navigation = new NavigationPage(page);

  await auth.gotoLanding();
  await auth.followSignupLink();

  const upgradeResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'PUT' &&
      response.url().endsWith('/api/auth/anon') &&
      response.status() === 204,
  );
  await auth.signUp(user);
  await upgradeResponse;

  await auth.expectSignedUp();
  await chat.expectChannel('general');
  await navigation.expectSignedInUser(user);
  await navigation.expectAccessTokenPersisted();
});

test('invited user can log in and join the invited server', async ({
  page,
  request,
}) => {
  await getOrCreateInstanceAdmin(request);
  const admin = await createServerAdmin(request, 'invite-admin');
  const serverName = `Invite server ${admin.user.suffix}`;
  const serverSlug = `invite-${admin.user.suffix}`;
  const server = (await createServer(request, admin, {
    name: serverName,
    slug: serverSlug,
    description: 'Server for the invite login flow.',
    image: {
      name: 'server-image.png',
      mimeType: 'image/png',
      buffer: readFileSync(fixturePath),
    },
  })) as { id: string; slug: string; image: { id: string } };
  const inviteToken = await createInvite(request, admin, server.id);
  const invitedUser = createTestUser('invite-member');
  await signUpViaApi(request, invitedUser);

  const auth = new AuthPage(page);
  const chat = new ChatPage(page);

  await page.goto(`/i/${inviteToken}`);
  await expect(page).toHaveURL('/about');
  await expect(
    page.getByRole('link', { name: 'Accept invite', exact: true }).first(),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Log in', exact: true }).click();

  const serverImageResponse = page.waitForResponse((response) =>
    response
      .url()
      .endsWith(`/api/servers/${server.id}/images/${server.image.id}`),
  );
  await auth.logIn(invitedUser);

  await expect(page).toHaveURL(`/i/${inviteToken}/join`);
  expect((await serverImageResponse).status()).toBe(200);
  await expect(
    page.getByRole('heading', { name: "You've been invited" }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: serverName, exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('img', { name: serverName })).toBeVisible();

  const joinResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().endsWith(`/api/servers/${server.id}/join`) &&
      response.status() === 200,
  );
  await page.getByRole('button', { name: 'Accept Invite' }).click();
  await joinResponse;

  await expect(page).toHaveURL(new RegExp(`/s/${server.slug}/c/[^/]+/?$`));
  await chat.expectChannel('general');
  await expect
    .poll(() =>
      page.evaluate(() => window.localStorage.getItem('invite-token')),
    )
    .toBeNull();
});

test('invited user can sign up and join the invited server', async ({
  page,
  request,
}) => {
  await getOrCreateInstanceAdmin(request);
  const admin = await createServerAdmin(request, 'signup-invite-admin');
  const serverName = `Signup invite server ${admin.user.suffix}`;
  const serverSlug = `signup-invite-${admin.user.suffix}`;
  const server = (await createServer(request, admin, {
    name: serverName,
    slug: serverSlug,
    description: 'Server for the invite signup flow.',
  })) as { id: string; slug: string };
  const inviteToken = await createInvite(request, admin, server.id);
  const invitedUser = createTestUser('signup-invite-member');
  const auth = new AuthPage(page);
  const chat = new ChatPage(page);
  const navigation = new NavigationPage(page);

  await page.goto(`/i/${inviteToken}`);
  await expect(page).toHaveURL('/about');
  await page
    .getByRole('link', { name: 'Accept invite', exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(`/auth/signup/${inviteToken}`);

  const signupResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().endsWith('/api/auth/signup') &&
      response.status() === 201 &&
      response.request().postDataJSON().inviteToken === inviteToken,
  );
  const currentServerResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().endsWith(`/api/servers/${server.id}/current`) &&
      response.status() === 200,
  );
  await auth.signUp(invitedUser);
  await signupResponse;
  await currentServerResponse;

  await expect(page).toHaveURL(new RegExp(`/s/${server.slug}/c/[^/]+/?$`));
  await chat.expectChannel('general');
  await navigation.expectSignedInUser(invitedUser);
  await navigation.expectAccessTokenPersisted();
  await expect
    .poll(() =>
      page.evaluate(() => window.localStorage.getItem('invite-token')),
    )
    .toBeNull();

  await navigation.logOut();
  await navigation.expectAccessTokenCleared();
  await page.getByRole('link', { name: 'Log in', exact: true }).first().click();
  await auth.logIn(invitedUser);

  await expect(page).toHaveURL(new RegExp(`/s/${server.slug}/c/[^/]+/?$`));
  await chat.expectChannel('general');
  await navigation.expectSignedInUser(invitedUser);
  await navigation.expectAccessTokenPersisted();
});

const switchToServer = async (page: Page, serverName: string) => {
  await page
    .getByRole('button', { name: /praxis/i })
    .first()
    .click();
  await page.getByRole('menuitem', { name: 'Switch servers' }).click();
  const switchDialog = page.getByRole('dialog', { name: 'Switch servers' });
  await switchDialog.getByText(serverName, { exact: true }).click();
  await expect(switchDialog).toBeHidden();
};

const goToLandingPage = async (page: Page) => {
  await page
    .getByRole('button', { name: /praxis/i })
    .first()
    .click();
  await page
    .getByRole('menuitem', { name: 'About Praxis', exact: true })
    .click();
  await expect(page).toHaveURL('/about');
};

// The landing page renders separate mobile and desktop heroes, so only the
// visible copy of a call to action can be clicked
const clickLandingLink = async (page: Page, linkName: string) => {
  await page
    .getByRole('link', { name: linkName, exact: true })
    .filter({ visible: true })
    .first()
    .click();
};

const landingPageEntryPoints = ['Open Praxis', 'Explore Praxis'];

test('Open Praxis and Explore Praxis both return a logged in user to the server they last switched to', async ({
  context,
  page,
  request,
}) => {
  test.setTimeout(90_000);

  await getOrCreateInstanceAdmin(request);
  const user = await createAuthenticatedUser(
    request,
    context,
    createTestUser('open-praxis'),
  );
  const defaultServer = await getDefaultServer(request, user);
  const serverAdmin = await createServerAdmin(request, 'open-praxis-admin');

  const servers: { name: string; slug: string }[] = [];
  for (const index of [1, 2, 3]) {
    const name = `Switch server ${index} ${user.user.suffix}`;
    const slug = `switch-${index}-${user.user.suffix}`;
    const server = await createServer(request, serverAdmin, { name, slug });
    const inviteToken = await createInvite(request, serverAdmin, server.id);
    await joinServer(request, user, server.id, inviteToken);
    servers.push({ name, slug });
  }

  await page.goto(
    `/s/${defaultServer.slug}/c/${defaultServer.generalChannelId}`,
  );
  await expect(
    page.getByText('general', { exact: true }).first(),
  ).toBeVisible();

  // Switch to each server in turn and confirm that leaving for the landing
  // page and coming back through either entry point returns to that same
  // server. The trailing repeats re-enter servers whose data is already in
  // the client-side query cache, which is where the reported bug shows up
  for (const server of [...servers, servers[0], servers[2]]) {
    await switchToServer(page, server.name);
    await expect(page).toHaveURL(new RegExp(`/s/${server.slug}(/|$)`));

    for (const entryPoint of landingPageEntryPoints) {
      await goToLandingPage(page);
      await clickLandingLink(page, entryPoint);
      await expect(page).toHaveURL(new RegExp(`/s/${server.slug}(/|$)`));
    }
  }

  // Finally, the same journeys across a cold load, which drops the client
  // cache entirely and relies on the backend's record of the last active
  // server
  const lastServer = servers[2];
  for (const entryPoint of landingPageEntryPoints) {
    await page.goto('/about');
    await clickLandingLink(page, entryPoint);
    await expect(page).toHaveURL(new RegExp(`/s/${lastServer.slug}(/|$)`));
  }
});
