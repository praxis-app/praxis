import { expect, type APIRequestContext } from '@playwright/test';
import {
  authorizationHeaders,
  signUpViaApi,
  type AuthenticatedUser,
} from './auth';
import { createTestUser } from './data';
import { grantInstancePermissions } from './instance-roles';
import { INSTANCE_PERMISSIONS } from './permissions';

type CreateServerOptions = {
  name: string;
  slug: string;
  description?: string | null;
  isDefaultServer?: boolean;
  image?: { name: string; mimeType: string; buffer: Buffer };
};

export async function createServerAdmin(
  request: APIRequestContext,
  label: string,
) {
  const admin = await signUpViaApi(request, createTestUser(label));
  await grantInstancePermissions(
    request,
    admin,
    [INSTANCE_PERMISSIONS.manageServers],
    label,
  );

  return admin;
}

export async function createServer(
  request: APIRequestContext,
  user: AuthenticatedUser,
  options: CreateServerOptions,
) {
  const payload = {
    name: options.name,
    slug: options.slug,
    description: options.description ?? null,
    isDefaultServer: options.isDefaultServer ?? false,
  };

  const response = await request.post('/api/servers', {
    headers: authorizationHeaders(user),
    ...(options.image
      ? {
          multipart: {
            payload: JSON.stringify(payload),
            file: options.image,
          },
        }
      : { data: payload }),
  });

  await expect(response).toBeOK();
  return (await response.json()).server;
}

export async function getDefaultServer(
  request: APIRequestContext,
  user: AuthenticatedUser,
) {
  const response = await request.get('/api/servers/default', {
    headers: authorizationHeaders(user),
  });

  await expect(response).toBeOK();
  return (await response.json()).server;
}

export async function getServerBySlug(
  request: APIRequestContext,
  user: AuthenticatedUser,
  slug: string,
) {
  const response = await request.get(`/api/servers/slug/${slug}`, {
    headers: authorizationHeaders(user),
  });

  await expect(response).toBeOK();
  return (await response.json()).server;
}

export async function joinServer(
  request: APIRequestContext,
  user: AuthenticatedUser,
  serverId: string,
  inviteToken: string,
) {
  const response = await request.post(`/api/servers/${serverId}/join`, {
    headers: authorizationHeaders(user),
    data: { inviteToken },
  });

  await expect(response).toBeOK();
}

export async function updateServerConfig(
  request: APIRequestContext,
  user: AuthenticatedUser,
  serverId: string,
  config: Record<string, unknown>,
) {
  const response = await request.put(`/api/servers/${serverId}/configs`, {
    headers: authorizationHeaders(user),
    data: config,
  });

  await expect(response).toBeOK();
}

export async function enableAnonymousUsers(
  request: APIRequestContext,
  user: AuthenticatedUser,
  serverId: string,
) {
  await updateServerConfig(request, user, serverId, {
    anonymousUsersEnabled: true,
  });
}
