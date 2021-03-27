import userResolvers from "./user";
import postResolvers from "./post";
import imageResolvers from "./image";
import followResolvers from "./follow";
import commentResolvers from "./comment";

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...postResolvers.Query,
    ...commentResolvers.Query,
    ...imageResolvers.Query,
    ...followResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...commentResolvers.Mutation,
    ...imageResolvers.Mutation,
    ...followResolvers.Mutation,
  },
};
