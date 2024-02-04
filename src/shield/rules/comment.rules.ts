import { rule } from 'graphql-shield';
import { Comment } from '../../comments/models/comment.model';
import { UpdateCommentInput } from '../../comments/models/update-comment.input';
import { UNAUTHORIZED } from '../../common/common.constants';
import { Context } from '../../context/context.types';
import { GroupPrivacy } from '../../groups/groups.constants';
import { hasServerPermission } from '../shield.utils';

export const canManageComments = rule({ cache: 'contextual' })(
  async (_parent, _args, { permissions }: Context) =>
    hasServerPermission(permissions, 'manageComments'),
);

export const isOwnComment = rule({ cache: 'strict' })(async (
  _parent,
  args: { id: number } | { commentData: UpdateCommentInput },
  { user, services: { commentsService } }: Context,
) => {
  if (!user) {
    return UNAUTHORIZED;
  }
  const { userId } = await commentsService.getComment(
    'id' in args ? args.id : args.commentData.id,
  );
  return userId === user.id;
});

export const isPublicComment = rule({ cache: 'strict' })(async (
  parent: Comment | null,
  args: { commentId: number } | null,
  { services: { commentsService } }: Context,
) => {
  if (args?.commentId) {
    const proposalId = await commentsService.getCommentProposalId(
      args.commentId,
    );
    const relations = proposalId
      ? ['proposal.group.config']
      : ['post.group.config', 'post.event.group.config'];

    const { post, proposal } = await commentsService.getComment(
      args.commentId,
      relations,
    );
    return (
      post?.group?.config.privacy === GroupPrivacy.Public ||
      post?.event?.group?.config.privacy === GroupPrivacy.Public ||
      proposal?.group?.config.privacy === GroupPrivacy.Public
    );
  }
  if (!parent) {
    return false;
  }

  const relations = parent.proposalId
    ? ['proposal.group.config']
    : ['post.group.config', 'post.event.group.config'];
  const { post, proposal } = await commentsService.getComment(
    parent.id,
    relations,
  );
  return (
    post?.group?.config.privacy === GroupPrivacy.Public ||
    post?.event?.group?.config.privacy === GroupPrivacy.Public ||
    proposal?.group?.config.privacy === GroupPrivacy.Public
  );
});

export const isPublicCommentImage = rule({ cache: 'strict' })(
  async (parent, _args, { services: { commentsService } }: Context) =>
    commentsService.isPublicCommentImage(parent.id),
);
