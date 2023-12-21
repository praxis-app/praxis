import { rule } from 'graphql-shield';
import { Context } from '../../context/context.types';
import { GroupPrivacy } from '../../groups/group-configs/group-configs.constants';
import { Image } from '../../images/models/image.model';
import { User } from '../../users/models/user.model';

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
