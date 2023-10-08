import { rule } from 'graphql-shield';
import { Comment } from '../../comments/models/comment.model';
import { UpdateCommentInput } from '../../comments/models/update-comment.input';
import { Context } from '../../context/context.types';
import { GroupPrivacy } from '../../groups/group-configs/models/group-config.model';
import { UNAUTHORIZED } from '../../shared/shared.constants';

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
  parent: Comment,
  _args,
  { services: { commentsService } }: Context,
) => {
  const releations = parent.proposalId
    ? ['proposal.group.config']
    : ['post.group.config', 'post.event.group.config'];
  const { post, proposal } = await commentsService.getComment(
    parent.id,
    releations,
  );
  return (
    post?.group?.config.privacy === GroupPrivacy.Public ||
    post?.event?.group?.config.privacy === GroupPrivacy.Public ||
    proposal?.group?.config.privacy === GroupPrivacy.Public
  );
});

export const isPublicCommentImage = rule({ cache: 'strict' })(async (
  parent,
  _args,
  { services: { imagesService } }: Context,
) => {
  const image = await imagesService.getImage({ id: parent.id }, [
    'comment.post.event.group.config',
    'comment.post.group.config',
    'comment.proposal.group.config',
  ]);
  return (
    image?.comment?.post?.event?.group?.config.privacy ===
      GroupPrivacy.Public ||
    image?.comment?.post?.group?.config.privacy === GroupPrivacy.Public ||
    image?.comment?.proposal?.group?.config.privacy === GroupPrivacy.Public
  );
});
