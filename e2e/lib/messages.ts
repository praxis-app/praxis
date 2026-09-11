import { expect, type APIRequestContext } from '@playwright/test';
import { authorizationHeaders, type AuthenticatedUser } from './auth';

interface CreateMessagesOptions {
  request: APIRequestContext;
  user: AuthenticatedUser;
  serverId: string;
  channelId: string;
  bodies: string[];
  callId?: string;
}

export async function createMessages({
  request,
  user,
  serverId,
  channelId,
  bodies,
  callId,
}: CreateMessagesOptions) {
  const messagePath = callId
    ? `/api/servers/${serverId}/channels/${channelId}/calls/${callId}/messages`
    : `/api/servers/${serverId}/channels/${channelId}/messages`;

  for (const body of bodies) {
    const response = await request.post(messagePath, {
      headers: authorizationHeaders(user),
      data: { body },
    });
    await expect(response).toBeOK();
  }
}
