import { rule } from "graphql-shield";
import { Context } from "../../context/context.service";
import { GroupPrivacy } from "../../groups/group-configs/models/group-config.model";
import { User } from "../../users/models/user.model";
import { hasNodes } from "../shield.utils";

export const isUserInPublicGroups = rule()(
  async (parent: User, _args, { services: { usersService } }: Context) => {
    const user = await usersService.getUser({ id: parent.id }, [
      "groups.config",
    ]);
    if (!user) {
      return false;
    }
    return user.groups.some(
      (group) => group.config.privacy === GroupPrivacy.Public
    );
  }
);

export const isUserAvatarInPublicPost = rule()(
  async (_parent, _args, _ctx, info) =>
    hasNodes(["publicPost", "user", "profilePicture"], info.path)
);

export const isUserAvatarInPublicFeed = rule()(
  async (_parent, _args, _ctx, info) =>
    hasNodes(["publicGroupsFeed", "user", "profilePicture"], info.path) ||
    hasNodes(["publicGroup", "feed", "user", "profilePicture"], info.path)
);
