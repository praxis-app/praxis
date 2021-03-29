import userResolvers from "./user";
import postResolvers from "./post";
import imageResolvers from "./image";
import followResolvers from "./follow";
import commentResolvers from "./comment";
import likeResolvers from "./like";

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...postResolvers.Query,
    ...commentResolvers.Query,
    ...followResolvers.Query,
    ...likeResolvers.Query,
    ...imageResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...commentResolvers.Mutation,
    ...followResolvers.Mutation,
    ...likeResolvers.Mutation,
    ...imageResolvers.Mutation,
  },
};
