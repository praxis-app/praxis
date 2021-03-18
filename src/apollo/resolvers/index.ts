import userResolvers from "./user";
import postResolvers from "./post";
import imageResolvers from "./image";

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...postResolvers.Query,
    ...imageResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...imageResolvers.Mutation,
  },
};
