import { rule } from "graphql-shield";
import { UpdateCommentInput } from "../../comments/models/update-comment.input";
import { UNAUTHORIZED } from "../../common/common.constants";
import { Context } from "../../context/context.types";

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
