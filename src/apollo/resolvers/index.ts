import userResolvers from "./user";
import postResolvers from "./post";
import imageResolvers from "./image";
import followResolvers from "./follow";
import commentResolvers from "./comment";
import groupResolvers from "./group";
import groupMemberResolvers from "./groupMember";
import motionResolvers from "./motion";
import voteResolvers from "./vote";
import likeResolvers from "./like";
import settingResolvers from "./setting";
import roleResolvers from "./role";
import roleMemberResolvers from "./roleMember";
import permissionResolvers from "./permission";
import serverInviteResolvers from "./serverInvite";

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...postResolvers.Query,
    ...commentResolvers.Query,
    ...followResolvers.Query,
    ...likeResolvers.Query,
    ...groupResolvers.Query,
    ...groupMemberResolvers.Query,
    ...motionResolvers.Query,
    ...voteResolvers.Query,
    ...imageResolvers.Query,
    ...settingResolvers.Query,
    ...roleResolvers.Query,
    ...roleMemberResolvers.Query,
    ...permissionResolvers.Query,
    ...serverInviteResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...commentResolvers.Mutation,
    ...followResolvers.Mutation,
    ...likeResolvers.Mutation,
    ...groupResolvers.Mutation,
    ...groupMemberResolvers.Mutation,
    ...motionResolvers.Mutation,
    ...voteResolvers.Mutation,
    ...imageResolvers.Mutation,
    ...settingResolvers.Mutation,
    ...roleResolvers.Mutation,
    ...roleMemberResolvers.Mutation,
    ...permissionResolvers.Mutation,
    ...serverInviteResolvers.Mutation,
  },
};
