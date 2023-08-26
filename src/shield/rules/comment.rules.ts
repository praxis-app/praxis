import { rule } from "graphql-shield";
import { UNAUTHORIZED } from "../../common/common.constants";
import { Context } from "../../context/context.types";

export const isOwnComment = rule({ cache: "strict" })(
  async (_parent, args, { user, services: { commentsService } }: Context) => {
    if (!user) {
      return UNAUTHORIZED;
    }
    const { userId } = await commentsService.getComment(args.id);
    return userId === user.id;
  }
);
