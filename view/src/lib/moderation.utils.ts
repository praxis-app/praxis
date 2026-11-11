import { api } from '@/client/api-client';
import { type ModerationMenuAction } from '@/components/moderation/moderation-action-menu';
import { type MessageRes } from '@/types/message.types';
import { type InstanceAbility, type ServerAbility } from '@/types/role.types';
import { type QueryClient } from '@tanstack/react-query';
import { type Namespace, type TFunction } from 'react-i18next';
import {
  MdDelete,
  MdGavel,
  MdLock,
  MdLockOpen,
  MdPersonRemove,
} from 'react-icons/md';

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
  canManageServerMembers:
    serverAbility.can('manage', 'ServerMember') ||
    instanceAbility.can('manage', 'all'),
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

type Translate = TFunction<Namespace<'translation'>, undefined>;

export type MemberModerationAction = 'remove' | 'ban';
export type AccountModerationAction = 'suspend' | 'restore' | 'delete';

interface MemberActionOptions {
  canRemove: boolean;
  canBan: boolean;
}

interface AccountActionOptions {
  canSuspend: boolean;
  canDelete: boolean;
  isLocked: boolean;
  isDeleted: boolean;
}

export const isMemberModerationAction = (
  action: MemberModerationAction | AccountModerationAction,
): action is MemberModerationAction => action === 'remove' || action === 'ban';

export const getMemberModerationActions = (
  t: Translate,
  { canRemove, canBan }: MemberActionOptions,
) => {
  const actions: ModerationMenuAction<MemberModerationAction>[] = [];
  if (canRemove) {
    actions.push({
      key: 'remove',
      Icon: MdPersonRemove,
      menuLabel: t('servers.actions.removeMember'),
      dialogTitle: t('servers.prompts.removeMember'),
      confirmLabel: t('actions.remove'),
      explanation: [
        t('servers.moderationExplanations.removeEffects'),
        t('servers.moderationExplanations.removeRejoin'),
      ],
      isReasonRequired: true,
    });
  }
  if (canBan) {
    actions.push({
      key: 'ban',
      Icon: MdGavel,
      menuLabel: t('servers.actions.banMember'),
      dialogTitle: t('servers.prompts.banMember'),
      confirmLabel: t('servers.actions.ban'),
      explanation: [
        t('servers.moderationExplanations.banEffects'),
        t('servers.moderationExplanations.banRejoin'),
      ],
      isReasonRequired: true,
      isMenuItemDestructive: true,
    });
  }
  return actions;
};

export const getAccountModerationActions = (
  t: Translate,
  { canSuspend, canDelete, isLocked, isDeleted }: AccountActionOptions,
) => {
  const actions: ModerationMenuAction<AccountModerationAction>[] = [];
  if (isDeleted) {
    return actions;
  }
  if (canSuspend && !isLocked) {
    actions.push({
      key: 'suspend',
      Icon: MdLock,
      menuLabel: t('moderation.actions.suspendUser'),
      dialogTitle: t('moderation.prompts.suspendUser'),
      confirmLabel: t('moderation.actions.suspend'),
      explanation: [t('moderation.explanations.suspendUser')],
      isReasonRequired: true,
    });
  }
  if (canSuspend && isLocked) {
    actions.push({
      key: 'restore',
      Icon: MdLockOpen,
      menuLabel: t('moderation.actions.restoreUser'),
      dialogTitle: t('moderation.prompts.restoreUser'),
      confirmLabel: t('moderation.actions.restore'),
      explanation: [t('moderation.explanations.restoreUser')],
      isReasonRequired: false,
      isDialogDestructive: false,
    });
  }
  if (canDelete) {
    actions.push({
      key: 'delete',
      Icon: MdDelete,
      menuLabel: t('moderation.actions.deleteUser'),
      dialogTitle: t('moderation.prompts.deleteUser'),
      confirmLabel: t('moderation.actions.delete'),
      explanation: [t('moderation.explanations.deleteUser')],
      isReasonRequired: true,
      isMenuItemDestructive: true,
    });
  }
  return actions;
};

export const moderateServerMember = async (
  serverId: string,
  userId: string,
  action: MemberModerationAction,
  reason?: string,
) => {
  if (action === 'ban') {
    await api.banServerMember(serverId, userId, { reason });
  } else {
    await api.removeServerMember(serverId, userId, { reason });
  }
};

export const moderateAccount = async (
  userId: string,
  action: AccountModerationAction,
  reason?: string,
) => {
  if (action === 'suspend') {
    await api.suspendUser(userId, { reason });
  } else if (action === 'restore') {
    await api.restoreUser(userId, { reason });
  } else {
    await api.deleteUser(userId, { reason });
  }
};
