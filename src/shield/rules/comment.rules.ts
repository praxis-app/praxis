import { rule } from "graphql-shield";
import { Comment } from "../../comments/models/comment.model";
import { UpdateCommentInput } from "../../comments/models/update-comment.input";
import { UNAUTHORIZED } from "../../common/common.constants";
import { Context } from "../../context/context.types";
import { GroupPrivacy } from "../../groups/group-configs/models/group-config.model";

export const isOwnComment = rule({ cache: "strict" })(
  async (
    _parent,
    args: { id: number } | { commentData: UpdateCommentInput },
    { user, services: { commentsService } }: Context
  ) => {
    if (!user) {
      return UNAUTHORIZED;
    }
    const { userId } = await commentsService.getComment(
      "id" in args ? args.id : args.commentData.id
    );
    return userId === user.id;
  }
);

export const isPublicComment = rule({ cache: "strict" })(
  async (
    parent: Comment,
    _args,
    { services: { commentsService } }: Context
  ) => {
    const { post, proposal } = await commentsService.getComment(parent.id, [
      parent.proposalId ? "proposal.group.config" : "post.group.config",
    ]);
    return (
      post?.group?.config.privacy === GroupPrivacy.Public ||
      proposal?.group?.config.privacy === GroupPrivacy.Public
    );
  }
);
