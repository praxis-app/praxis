import { rule } from 'graphql-shield';
import { UNAUTHORIZED } from '../../common/common.constants';
import { Context } from '../../context/context.types';
import { GroupPrivacy } from '../../groups/groups.constants';
import { Post } from '../../posts/models/post.model';
import { UpdatePostInput } from '../../posts/models/update-post.input';
import { hasServerPermission } from '../shield.utils';

export const canManagePosts = rule({ cache: 'contextual' })(
  async (_parent, _args, { permissions }: Context) =>
    hasServerPermission(permissions, 'managePosts'),
);

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
  parent: Post | null,
  args: { id: number } | { postId: number },
  { services: { postsService } }: Context,
) => {
  let postId: number | undefined;

  if (parent instanceof Post) {
    postId = parent.id;
  } else if (args && 'postId' in args) {
    postId = args.postId;
  } else if (args) {
    postId = args.id;
  }
  if (!postId) {
    return false;
  }
  const post = await postsService.getPost(postId, ['group.config']);
  return post?.group?.config.privacy === GroupPrivacy.Public;
});

export const isPublicPostImage = rule({ cache: 'strict' })(
  async (parent, _args, { services: { postsService } }: Context) =>
    postsService.isPublicPostImage(parent.id),
);
