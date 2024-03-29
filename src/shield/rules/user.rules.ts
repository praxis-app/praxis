import { rule } from 'graphql-shield';
import { UNAUTHORIZED } from '../../common/common.constants';
import { Context } from '../../context/context.types';
import { GroupPrivacy } from '../../groups/groups.constants';
import { Image } from '../../images/models/image.model';
import { User } from '../../users/models/user.model';
import { hasServerPermission } from '../shield.utils';

export const isMe = rule({ cache: 'strict' })(async (
  parent: User | undefined,
  args: { id: number | undefined; name: string | undefined } | object,
  { user }: Context,
) => {
  if (!user) {
    return UNAUTHORIZED;
  }
  if ('id' in args) {
    return args.id === user.id;
  }
  if ('name' in args) {
    return args.name === user.name;
  }
  if (!parent) {
    return false;
  }
  return parent.id === user.id;
});

export const isVerified = rule({ cache: 'contextual' })(async (
  _parent,
  _args,
  { user }: Context,
) => {
  if (!user) {
    return UNAUTHORIZED;
  }
  return user.verified;
});

export const isOwnUserAvatar = rule({ cache: 'strict' })(async (
  parent: Image,
  _args,
  { user, services: { usersService } }: Context,
) => {
  if (!user) {
    return UNAUTHORIZED;
  }
  return usersService.isOwnUserAvatar(user.id, parent.id);
});

export const isUserInPublicGroups = rule({ cache: 'strict' })(async (
  parent: User,
  _args,
  { services: { usersService } }: Context,
) => {
  const user = await usersService.getUser({ id: parent.id }, ['groups.config']);
  if (!user) {
    return false;
  }
  return user.groups.some(
    (group) => group.config.privacy === GroupPrivacy.Public,
  );
});

export const isPublicUserAvatar = rule({ cache: 'strict' })(
  async (parent: Image, _args, { services: { usersService } }: Context) =>
    usersService.isPublicUserAvatar(parent.id),
);

export const canRemoveMembers = rule({ cache: 'contextual' })(
  async (_parent, _args, { permissions }: Context) =>
    hasServerPermission(permissions, 'removeMembers'),
);
