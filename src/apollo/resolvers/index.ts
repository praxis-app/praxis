import userResolvers from "./user";
import postResolvers from "./post";
import imageResolvers from "./image";
import followResolvers from "./follow";

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...postResolvers.Query,
    ...imageResolvers.Query,
    ...followResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...imageResolvers.Mutation,
    ...followResolvers.Mutation,
  },
};
