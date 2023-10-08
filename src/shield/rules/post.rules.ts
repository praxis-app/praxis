import { rule } from 'graphql-shield';
import { UNAUTHORIZED } from '../../shared/shared.constants';
import { Context } from '../../context/context.types';
import { GroupPrivacy } from '../../groups/group-configs/models/group-config.model';
import { UpdatePostInput } from '../../posts/models/update-post.input';

export const isOwnPost = rule({ cache: 'strict' })(async (
  _parent,
  args: { id: number } | { postData: UpdatePostInput },
  { user, services: { usersService } }: Context,
) => {
  if (!user) {
    return UNAUTHORIZED;
  }
  return usersService.isUsersPost(
    'id' in args ? args.id : args.postData.id,
    user.id,
  );
});

export const isPublicPost = rule({ cache: 'strict' })(async (
  parent,
  args,
  { services: { postsService } }: Context,
) => {
  const postId = parent ? parent.id : args.id;
  const post = await postsService.getPost(postId, ['group.config']);
  if (!post.group) {
    return false;
  }
  return post.group.config.privacy === GroupPrivacy.Public;
});

export const isPublicPostImage = rule({ cache: 'strict' })(async (
  parent,
  _args,
  { services: { imagesService } }: Context,
) => {
  const image = await imagesService.getImage({ id: parent.id }, [
    'post.group.config',
  ]);
  return image?.post?.group?.config.privacy === GroupPrivacy.Public;
});
