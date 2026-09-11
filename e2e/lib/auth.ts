import {
  expect,
  type APIRequestContext,
  type BrowserContext,
} from '@playwright/test';
import {
  ACCESS_TOKEN_KEY,
  createTestUser,
  INSTANCE_ADMIN_USER,
  type TestUser,
} from './data';
import { createInvite } from './invites';
import { SERVER_PERMISSIONS } from './permissions';
import { grantServerPermissions } from './server-roles';
import { enableAnonymousUsers, getDefaultServer } from './servers';

export type AuthenticatedUser = {
  accessToken: string;
  userId: string;
  user: TestUser;
};

export type AnonymousAuthSetup = {
  admin: AuthenticatedUser;
  server: {
    id: string;
    generalChannelId: string;
  };
  inviteToken: string;
};

type SignupResponse = {
  access_token?: string | null;
  user?: {
    id: string;
    email: string;
    name: string;
  } | null;
};

type AuthResponse = {
  access_token?: string | null;
};

export async function signUpViaApi(
  request: APIRequestContext,
  user: TestUser = createTestUser(),
  inviteToken?: string,
): Promise<AuthenticatedUser> {
  const response = await request.post('/api/auth/signup', {
    data: {
      name: user.name,
      email: user.email,
      password: user.password,
      inviteToken,
    },
  });

  await expect(response).toBeOK();
  const body = (await response.json()) as SignupResponse;
  expect(body.access_token).toBeTruthy();
  expect(body.user?.id).toBeTruthy();
  expect(body.user?.email).toBe(user.email);

  return {
    accessToken: body.access_token ?? '',
    userId: body.user?.id ?? '',
    user,
  };
}

export async function logInViaApi(
  request: APIRequestContext,
  user: TestUser,
): Promise<AuthenticatedUser> {
  const response = await request.post('/api/auth/login', {
    data: {
      email: user.email,
      password: user.password,
    },
  });

  await expect(response).toBeOK();
  const body = (await response.json()) as SignupResponse;
  expect(body.access_token).toBeTruthy();
  expect(body.user?.id).toBeTruthy();

  return {
    accessToken: body.access_token ?? '',
    userId: body.user?.id ?? '',
    user,
  };
}

/** True until the instance has its first user, when signup needs no invite */
export async function isFirstUser(request: APIRequestContext) {
  const response = await request.get('/api/users/is-first');

  await expect(response).toBeOK();
  const body = (await response.json()) as { isFirstUser: boolean };
  return body.isFirstUser;
}

export async function getOrCreateInstanceAdmin(
  request: APIRequestContext,
): Promise<AuthenticatedUser> {
  const response = await request.post('/api/auth/login', {
    data: {
      email: INSTANCE_ADMIN_USER.email,
      password: INSTANCE_ADMIN_USER.password,
    },
  });

  if (response.ok()) {
    const body = (await response.json()) as SignupResponse;
    expect(body.access_token).toBeTruthy();
    expect(body.user?.id).toBeTruthy();

    return {
      accessToken: body.access_token ?? '',
      userId: body.user?.id ?? '',
      user: INSTANCE_ADMIN_USER,
    };
  }

  expect(response.status()).toBe(401);
  return signUpViaApi(request, INSTANCE_ADMIN_USER);
}

export async function seedAuthenticatedSession(
  context: BrowserContext,
  accessToken: string,
) {
  await context.addInitScript(
    ([key, token]) => {
      window.localStorage.setItem(key, token);
    },
    [ACCESS_TOKEN_KEY, accessToken],
  );
}

export async function createAuthenticatedUser(
  request: APIRequestContext,
  context: BrowserContext,
  user: TestUser = createTestUser(),
  inviteToken?: string,
) {
  const authenticatedUser = await signUpViaApi(request, user, inviteToken);
  await seedAuthenticatedSession(context, authenticatedUser.accessToken);

  return authenticatedUser;
}

export async function setupAnonymousInvite(
  request: APIRequestContext,
  context: BrowserContext,
  adminLabel: string,
): Promise<AnonymousAuthSetup> {
  const instanceAdmin = await getOrCreateInstanceAdmin(request);
  const admin = await createAuthenticatedUser(
    request,
    context,
    createTestUser(adminLabel),
  );
  const server = await getDefaultServer(request, admin);
  await grantServerPermissions(
    request,
    instanceAdmin,
    admin,
    server.id,
    [SERVER_PERMISSIONS.manageConfig, SERVER_PERMISSIONS.createInvites],
    adminLabel,
  );
  await enableAnonymousUsers(request, admin, server.id);
  const inviteToken = await createInvite(request, admin, server.id);

  await context.clearCookies();
  await context.addInitScript(
    ([accessTokenKey, inviteTokenValue]) => {
      window.localStorage.removeItem(accessTokenKey);
      window.localStorage.setItem('invite-token', inviteTokenValue);
    },
    [ACCESS_TOKEN_KEY, inviteToken],
  );

  return { admin, server, inviteToken };
}

export async function setupAnonymousSession(
  request: APIRequestContext,
  context: BrowserContext,
  adminLabel: string,
) {
  const anonymous = await setupAnonymousInvite(request, context, adminLabel);
  const response = await request.post('/api/auth/anon', {
    data: { inviteToken: anonymous.inviteToken },
  });

  await expect(response).toBeOK();
  const body = (await response.json()) as AuthResponse;
  expect(body.access_token).toBeTruthy();

  await context.addInitScript(
    ([accessTokenKey, accessToken]) => {
      window.localStorage.removeItem('invite-token');
      window.localStorage.setItem(accessTokenKey, accessToken);
    },
    [ACCESS_TOKEN_KEY, body.access_token ?? ''],
  );

  return anonymous;
}

export function authorizationHeaders(user: AuthenticatedUser) {
  return {
    Authorization: `Bearer ${user.accessToken}`,
  };
}
