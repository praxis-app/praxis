import { rule } from 'graphql-shield';
import { Context } from '../../context/context.types';
import { GroupPrivacy } from '../../groups/group-configs/models/group-config.model';
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

export const isPublicUserAvatar = rule({ cache: 'strict' })(async (
  parent: Image,
  _args,
  { services: { imagesService } }: Context,
) => {
  const image = await imagesService.getImage({ id: parent.id }, [
    'user.groups.config',
  ]);
  if (!image?.user) {
    return false;
  }
  return image.user.groups.some(
    (group) => group.config.privacy === GroupPrivacy.Public,
  );
});
