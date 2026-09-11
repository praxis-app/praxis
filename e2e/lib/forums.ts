import { expect, type APIRequestContext } from '@playwright/test';
import { authorizationHeaders, type AuthenticatedUser } from './auth';

type ForumChannel = {
  id: string;
  name: string;
  channelType: 'forum';
};

export async function createForumChannel(
  request: APIRequestContext,
  user: AuthenticatedUser,
  serverId: string,
  name: string,
) {
  const response = await request.post(`/api/servers/${serverId}/channels`, {
    headers: authorizationHeaders(user),
    data: {
      name,
      description: `E2E forum channel ${name}`,
      channelType: 'forum',
    },
  });

  await expect(response).toBeOK();
  const channel = ((await response.json()) as { channel: ForumChannel })
    .channel;
  expect(channel.name).toBe(name);
  expect(channel.channelType).toBe('forum');
  return channel;
}

export async function createForumPosts(
  request: APIRequestContext,
  user: AuthenticatedUser,
  serverId: string,
  channelId: string,
  titles: string[],
) {
  for (const title of titles) {
    const response = await request.post(
      `/api/servers/${serverId}/channels/${channelId}/forum/posts`,
      {
        headers: authorizationHeaders(user),
        data: {
          title,
          body: `Opening message for ${title}`,
        },
      },
    );
    await expect(response).toBeOK();
  }
}

export async function createForumPostWithProposal(
  request: APIRequestContext,
  user: AuthenticatedUser,
  serverId: string,
  channelId: string,
  title: string,
  proposalBody: string,
) {
  const response = await request.post(
    `/api/servers/${serverId}/channels/${channelId}/forum/posts`,
    {
      headers: authorizationHeaders(user),
      data: {
        title,
        body: `Opening message for ${title}`,
        proposal: {
          body: proposalBody,
          pollType: 'proposal',
          action: { actionType: 'test' },
        },
      },
    },
  );

  await expect(response).toBeOK();
  const { post } = (await response.json()) as {
    post: { id: string; proposal: { id: string } };
  };
  return post;
}

export async function moveProposalToForum(
  request: APIRequestContext,
  user: AuthenticatedUser,
  serverId: string,
  sourceChannelId: string,
  proposalId: string,
  destinationChannelId: string,
  title: string,
) {
  const response = await request.post(
    `/api/servers/${serverId}/channels/${sourceChannelId}/polls/${proposalId}/move-to-forum`,
    {
      headers: authorizationHeaders(user),
      data: {
        destinationChannelId,
        title,
        body: `Moved from the general channel: ${title}`,
      },
    },
  );

  await expect(response).toBeOK();
  const { post } = (await response.json()) as { post: { id: string } };
  return post;
}
