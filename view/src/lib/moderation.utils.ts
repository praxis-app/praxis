import { type MessageRes } from '@/types/message.types';
import { type InstanceAbility, type ServerAbility } from '@/types/role.types';
import { type QueryClient } from '@tanstack/react-query';

type QueryPage = Record<string, unknown>;

interface PagedQueryData {
  pages: QueryPage[];
}

interface Identifiable {
  id: string;
}

export const getModerationAccess = (
  serverAbility: ServerAbility,
  instanceAbility: InstanceAbility,
) => ({
  canModerateContent:
    serverAbility.can('delete', 'Message') ||
    instanceAbility.can('delete', 'Message'),
  canManageCalls:
    serverAbility.can('manage', 'Call') ||
    instanceAbility.can('manage', 'Call'),
  canSuspendUsers: instanceAbility.can('update', 'User'),
  canDeleteUsers: instanceAbility.can('delete', 'User'),
});

export const isRemovableMessage = (message: MessageRes) =>
  !message.moderatedAt &&
  !message.botId &&
  !message.threadPollId &&
  !!message.user;

const toTombstone = <T extends Identifiable>(
  item: T,
  removed: MessageRes,
): T => ({
  ...item,
  body: null,
  images: [],
  moderatedAt: removed.moderatedAt,
});

const replaceInList = (items: unknown, removed: MessageRes) => {
  if (!Array.isArray(items)) {
    return items;
  }
  return items.map((item: Identifiable) =>
    item.id === removed.id ? toTombstone(item, removed) : item,
  );
};

const replaceInPage = (page: QueryPage, removed: MessageRes): QueryPage => {
  const root = page.root as Identifiable | undefined;
  const post = page.post as QueryPage | undefined;
  return {
    ...page,
    ...(page.feed ? { feed: replaceInList(page.feed, removed) } : {}),
    ...(page.replies ? { replies: replaceInList(page.replies, removed) } : {}),
    ...(root?.id === removed.id ? { root: toTombstone(root, removed) } : {}),
    ...(post?.replies
      ? { post: { ...post, replies: replaceInList(post.replies, removed) } }
      : {}),
  };
};

const isPagedQueryData = (data: unknown): data is PagedQueryData =>
  !!data &&
  typeof data === 'object' &&
  Array.isArray((data as PagedQueryData).pages);

export const applyRemovedMessage = <T>(data: T, removed: MessageRes): T => {
  if (!isPagedQueryData(data)) {
    return data;
  }
  return {
    ...data,
    pages: data.pages.map((page) => replaceInPage(page, removed)),
  };
};

export const patchRemovedMessage = (
  queryClient: QueryClient,
  serverId: string | undefined,
  channelId: string | undefined,
  removed: MessageRes,
) => {
  queryClient.setQueriesData(
    { queryKey: ['servers', serverId, 'channels', channelId] },
    (data: unknown) => applyRemovedMessage(data, removed),
  );
};

export const invalidateAccountModerationQueries = (
  queryClient: QueryClient,
  isDeletion: boolean,
) => {
  queryClient.invalidateQueries({ queryKey: ['instance', 'users'] });
  if (!isDeletion) {
    return;
  }
  queryClient.invalidateQueries({ queryKey: ['instance-roles'] });
  queryClient.invalidateQueries({ queryKey: ['servers'] });
};
