import { expect, type APIRequestContext } from '@playwright/test';
import { authorizationHeaders, type AuthenticatedUser } from './auth';

export async function createInvite(
  request: APIRequestContext,
  user: AuthenticatedUser,
  serverId: string,
) {
  const response = await request.post(`/api/servers/${serverId}/invites`, {
    headers: authorizationHeaders(user),
    data: {},
  });

  await expect(response).toBeOK();
  return (await response.json()).invite.token;
}
