import { rule } from 'graphql-shield';
import { Context } from '../../context/context.types';
import { GroupPrivacy } from '../../groups/group-configs/group-configs.constants';
import { UpdatePostInput } from '../../posts/models/update-post.input';
import { UNAUTHORIZED } from '../../common/common.constants';

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

export const isPublicPostImage = rule({ cache: 'strict' })(
  async (parent, _args, { services: { postsService } }: Context) =>
    postsService.isPublicPostImage(parent.id),
);
