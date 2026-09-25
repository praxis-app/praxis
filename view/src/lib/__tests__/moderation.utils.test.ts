import {
  applyRemovedMessage,
  getModerationAccess,
  isRemovableMessage,
} from '@/lib/moderation.utils';
import {
  getInstancePermissionValuesMap,
  getServerPermissionValuesMap,
  getSettingsAccess,
} from '@/lib/role.utils';
import { type MessageRes } from '@/types/message.types';
import {
  type InstanceAbility,
  type InstancePermission,
  type ServerAbility,
  type ServerPermission,
} from '@/types/role.types';
import { createMongoAbility } from '@casl/ability';
import { describe, expect, it } from 'vitest';

const serverAbility = (permissions: ServerPermission[] = []) =>
  createMongoAbility<ServerAbility>(permissions);

const instanceAbility = (permissions: InstancePermission[] = []) =>
  createMongoAbility<InstanceAbility>(permissions);

const message = (overrides: Partial<MessageRes> = {}): MessageRes => ({
  id: 'message-1',
  body: 'Buy now',
  images: [{ id: 'image-1', createdAt: '2026-01-01T00:00:00Z' }],
  user: { id: 'user-1', name: 'member', profilePicture: null },
  userId: 'user-1',
  botId: null,
  bot: null,
  replyCount: 0,
  latestReplyAt: null,
  createdAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

const removed = message({
  body: null,
  images: [],
  moderatedAt: '2026-01-02T00:00:00Z',
});

describe('getModerationAccess', () => {
  it('should deny every capability without a grant', () => {
    expect(getModerationAccess(serverAbility(), instanceAbility())).toEqual({
      canModerateContent: false,
      canManageCalls: false,
      canSuspendUsers: false,
      canDeleteUsers: false,
    });
  });

  it('should allow server capabilities from either role tier', () => {
    const fromServer = getModerationAccess(
      serverAbility([
        { subject: 'Message', action: ['delete'] },
        { subject: 'Call', action: ['manage'] },
      ]),
      instanceAbility(),
    );
    expect(fromServer.canModerateContent).toBe(true);
    expect(fromServer.canManageCalls).toBe(true);
    expect(fromServer.canSuspendUsers).toBe(false);

    const fromInstance = getModerationAccess(
      serverAbility(),
      instanceAbility([{ subject: 'Message', action: ['delete'] }]),
    );
    expect(fromInstance.canModerateContent).toBe(true);
    expect(fromInstance.canManageCalls).toBe(false);
  });

  it('should treat all/manage as every capability', () => {
    const access = getModerationAccess(
      serverAbility(),
      instanceAbility([{ subject: 'all', action: ['manage'] }]),
    );
    expect(Object.values(access).every(Boolean)).toBe(true);
  });
});

describe('permission values', () => {
  it('should map moderation capabilities to their permission rules', () => {
    expect(
      getServerPermissionValuesMap([
        { subject: 'Message', action: ['delete'] },
        { subject: 'Call', action: ['manage'] },
      ]),
    ).toMatchObject({ moderateContent: true, manageCalls: true });
    expect(
      getInstancePermissionValuesMap([
        { subject: 'User', action: ['update'] },
      ]),
    ).toMatchObject({
      suspendUsers: true,
      deleteUsers: false,
      moderateContent: false,
    });
  });

  it('should open instance settings to account moderators', () => {
    const access = getSettingsAccess(
      serverAbility(),
      instanceAbility([{ subject: 'User', action: ['delete'] }]),
    );
    expect(access.canManageUsers).toBe(true);
    expect(access.hasInstanceSettingsAccess).toBe(true);
  });
});

describe('isRemovableMessage', () => {
  it('should exclude tombstones, bot messages, and poll replies', () => {
    expect(isRemovableMessage(message())).toBe(true);
    expect(isRemovableMessage(removed)).toBe(false);
    expect(isRemovableMessage(message({ botId: 'bot-1' }))).toBe(false);
    expect(isRemovableMessage(message({ threadPollId: 'poll-1' }))).toBe(
      false,
    );
  });
});

describe('applyRemovedMessage', () => {
  it('should replace a feed message with its tombstone', () => {
    const data = {
      pages: [{ feed: [{ ...message(), type: 'message' }] }],
      pageParams: [null],
    };
    const [item] = applyRemovedMessage(data, removed).pages[0].feed;
    expect(item).toMatchObject({
      type: 'message',
      body: null,
      images: [],
      moderatedAt: removed.moderatedAt,
    });
  });

  it('should patch thread roots, thread replies, and forum replies', () => {
    const other = message({ id: 'message-2', body: 'Keep me' });
    const thread = applyRemovedMessage(
      { pages: [{ root: message(), replies: [other] }] },
      removed,
    );
    expect(thread.pages[0].root.body).toBeNull();
    expect(thread.pages[0].replies[0].body).toBe('Keep me');

    const forum = applyRemovedMessage(
      { pages: [{ post: { id: 'post-1', replies: [other, message()] } }] },
      removed,
    );
    expect(forum.pages[0].post.replies.map((reply) => reply.body)).toEqual([
      'Keep me',
      null,
    ]);
  });

  it('should leave data without pages untouched', () => {
    const data = { post: { id: 'post-1' } };
    expect(applyRemovedMessage(data, removed)).toBe(data);
    expect(applyRemovedMessage(undefined, removed)).toBeUndefined();
  });
});
