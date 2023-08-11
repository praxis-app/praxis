import { rule } from "graphql-shield";
import { hasNodes } from "../shield.utils";

export const isUserInPublicPost = rule()(async (_parent, _args, _ctx, info) =>
  hasNodes(["publicPost", "user"], info.path)
);

export const isUserInPublicFeed = rule()(
  async (_parent, _args, _ctx, info) =>
    hasNodes(["publicGroupsFeed", "user"], info.path) ||
    hasNodes(["publicGroup", "feed", "user"], info.path)
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
