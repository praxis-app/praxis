import userResolvers from "./user";
import postResolvers from "./post";
import imageResolvers from "./image";
import followResolvers from "./follow";
import commentResolvers from "./comment";
import groupResolvers from "./group";
import memberResolvers from "./member";
import motionResolvers from "./motion";
import voteResolvers from "./vote";
import likeResolvers from "./like";

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...postResolvers.Query,
    ...commentResolvers.Query,
    ...followResolvers.Query,
    ...likeResolvers.Query,
    ...groupResolvers.Query,
    ...memberResolvers.Query,
    ...motionResolvers.Query,
    ...voteResolvers.Query,
    ...imageResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...commentResolvers.Mutation,
    ...followResolvers.Mutation,
    ...likeResolvers.Mutation,
    ...groupResolvers.Mutation,
    ...memberResolvers.Mutation,
    ...motionResolvers.Mutation,
    ...voteResolvers.Mutation,
    ...imageResolvers.Mutation,
  },
};
