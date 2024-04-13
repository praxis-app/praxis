import { allow, or } from 'graphql-shield';
import { isPublicEventPost } from '../rules/event.rules';
import { canManageGroupPosts } from '../rules/group.rules';
import { canManagePosts, isOwnPost, isPublicPost } from '../rules/post.rules';
import { isPublicProposal } from '../rules/proposal.rules';
import { isVerified } from '../rules/user.rules';

export const postPermissions = {
  Query: {
    post: or(isVerified, isPublicPost, isPublicEventPost),
  },
  Mutation: {
    updatePost: isOwnPost,
    deletePost: or(isOwnPost, canManagePosts, canManageGroupPosts),
  },
  ObjectTypes: {
    Post: or(isVerified, isPublicPost, isPublicEventPost),
    PublicFeedItemsConnection: allow,
    FeedItemsConnection: or(
      isVerified,
      isPublicEventPost,
      isPublicProposal,
      isPublicPost,
    ),
  },
};
