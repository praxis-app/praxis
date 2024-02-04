import { rule } from 'graphql-shield';
import { Context } from '../../context/context.types';
import { GroupPrivacy } from '../../groups/groups.constants';
import { Image } from '../../images/models/image.model';
import { User } from '../../users/models/user.model';
import { hasServerPermission } from '../shield.utils';

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
