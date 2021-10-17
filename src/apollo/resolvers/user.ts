import { ApolloError, UserInputError } from "apollo-server-micro";
import { GraphQLUpload } from "apollo-server-micro";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from ".prisma/client";

import prisma from "../../utils/initPrisma";
import { deleteImage } from "../../utils/image";
import {
  validateSignup,
  validateLogin,
  validateUpdateUser,
  validationError,
} from "../../utils/validation";
import { EXPIRES_IN, TypeNames } from "../../constants/common";
import Messages from "../../utils/messages";
import { BackendMotion } from "../models/motion";
import { BackendPost } from "../models/post";
import { BackendFeedItem, paginate } from "../models/common";
import { saveCoverPhoto, saveProfilePicture } from "../models/user";

interface HomeFeedInput extends PaginationState {
  userId?: string;
}

interface ProfileFeedInput extends PaginationState {
  name: string;
}

const userResolvers = {
  FileUpload: GraphQLUpload,

  Query: {
    homeFeed: async (
      _: any,
      { userId, currentPage, pageSize }: HomeFeedInput
    ) => {
      let feed: BackendFeedItem[] = [];

      // TODO: Extract as model functions to make code more legible, remove comments below
      if (userId) {
        // Users own posts
        const ownPosts = await prisma.post.findMany({
          where: {
            userId: parseInt(userId),
          },
        });
        feed = [...feed, ...ownPosts];

        // Followed feed items
        const userWithFollowing = await prisma.user.findFirst({
          where: {
            id: parseInt(userId),
          },
          include: {
            following: true,
          },
        });
        if (userWithFollowing)
          for (const follow of userWithFollowing.following) {
            let userWithFeedItems;
            if (follow.userId)
              userWithFeedItems = await prisma.user.findFirst({
                where: {
                  id: follow.userId,
                },
                include: {
                  posts: true,
                  motions: true,
                },
              });
            if (userWithFeedItems)
              feed = [
                ...feed,
                ...userWithFeedItems.posts.filter(
                  (post) => post.groupId === null
                ),
                ...userWithFeedItems.motions.map((motion) => ({
                  ...motion,
                  __typename: TypeNames.Motion,
                })),
              ];
          }
        // Group feed items
        const groupMembers = await prisma.groupMember.findMany({
          where: {
            userId: parseInt(userId),
          },
        });
        for (const groupMember of groupMembers) {
          const whereGroupId = {
            where: {
              groupId: groupMember.groupId,
            },
          };
          const groupPosts = await prisma.post.findMany(whereGroupId);
          const groupMotions = await prisma.motion.findMany(whereGroupId);
          if (groupPosts.length) feed = [...feed, ...groupPosts];
          if (groupMotions.length)
            feed = [
              ...feed,
              ...groupMotions.map((motion) => ({
                ...motion,
                __typename: TypeNames.Motion,
              })),
            ];
        }
        feed.forEach((item) => {
          if (!item.__typename) item.__typename = TypeNames.Post;
        });
        const uniq: BackendFeedItem[] = [];
        for (const item of feed) {
          if (
            !uniq.find(
              (uniqItem) =>
                item.id === uniqItem.id &&
                item.__typename === uniqItem.__typename
            )
          )
            uniq.push(item);
        }
        feed = uniq;
      } else {
        // Logged out home feed
        const posts: BackendPost[] = await prisma.post.findMany();
        const motions: BackendMotion[] = await prisma.motion.findMany();
        posts.forEach((item) => {
          item.__typename = TypeNames.Post;
        });
        motions.forEach((item) => {
          item.__typename = TypeNames.Motion;
        });

        feed = [...posts, ...motions];
      }

      return {
        pagedItems: paginate(feed, currentPage, pageSize),
        totalItems: feed.length,
      };
    },

    profileFeed: async (
      _: any,
      { name, currentPage, pageSize }: ProfileFeedInput
    ) => {
      const feed: BackendFeedItem[] = [];
      const userWithFeedItems = await prisma.user.findFirst({
        where: {
          name,
        },
        include: {
          posts: true,
          motions: true,
        },
      });
      const posts = userWithFeedItems?.posts as BackendPost[];
      const motions = userWithFeedItems?.motions as BackendMotion[];
      posts.forEach((item) => {
        item.__typename = TypeNames.Post;
      });
      motions.forEach((item) => {
        item.__typename = TypeNames.Motion;
      });
      feed.push(...posts, ...motions);

      return {
        pagedItems: paginate(feed, currentPage, pageSize),
        totalItems: feed.length,
      };
    },

    user: async (_: any, { id }: { id: string }) => {
      const user = await prisma.user.findFirst({
        where: {
          id: parseInt(id),
        },
      });
      return user;
    },

    userByName: async (_: any, { name }: { name: string }) => {
      const user = await prisma.user.findFirst({
        where: {
          name,
        },
      });
      return user;
    },

    allUsers: async () => {
      const users = await prisma.user.findMany();
      return users;
    },
  },

  Mutation: {
    async signUp(_: any, { input }: { input: SignUpInput }) {
      const { email, name, password, profilePicture } = input;
      const { errors, isValid } = validateSignup(input);
      let user: User;

      if (!isValid) throw new UserInputError(validationError(errors));

      const userFound = await prisma.user.findMany({
        where: {
          email,
        },
      });

      if (userFound.length > 0)
        throw new UserInputError(Messages.users.validation.emailExists());

      const hash = await bcrypt.hash(password, 10);

      try {
        user = await prisma.user.create({
          data: {
            email,
            name,
            password: hash,
          },
        });
      } catch {
        throw new ApolloError(Messages.users.errors.signUp());
      }

      try {
        await saveProfilePicture(user, profilePicture, true);
      } catch {
        const whereUserId = {
          where: { id: user.id },
        };
        await prisma.user.delete(whereUserId);

        throw new ApolloError(Messages.errors.imageUploadError());
      }

      const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      const token = jwt.sign(jwtPayload, process.env.JWT_KEY as string, {
        expiresIn: EXPIRES_IN,
      });

      return { user, token };
    },

    async signIn(_: any, { input }: { input: SignInInput }) {
      const { errors, isValid } = validateLogin(input);
      const { email, password } = input;

      if (!isValid) throw new UserInputError(validationError(errors));

      const user = await prisma.user.findFirst({
        where: {
          email,
        },
      });

      if (!user)
        throw new UserInputError(Messages.users.validation.noUserWithEmail());

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        const jwtPayload = {
          id: user.id,
          name: user.name,
          email: user.email,
        };
        const token = jwt.sign(jwtPayload, process.env.JWT_KEY as string, {
          expiresIn: EXPIRES_IN,
        });

        return { user, token };
      } else {
        throw new UserInputError(Messages.users.validation.wrongPassword());
      }
    },

    async updateUser(
      _: any,
      { id, input }: { id: string; input: UpdateUserInput }
    ) {
      const { email, name, bio, profilePicture, coverPhoto } = input;
      const { errors, isValid } = validateUpdateUser(input);
      let user: User;

      if (!isValid) throw new UserInputError(validationError(errors));

      try {
        user = await prisma.user.update({
          where: { id: parseInt(id) },
          data: { email, name, bio },
        });
        if (!user)
          throw new ApolloError(Messages.items.notFound(TypeNames.User));
      } catch {
        throw new ApolloError(Messages.users.errors.update());
      }

      try {
        await saveProfilePicture(user, profilePicture);
        await saveCoverPhoto(user, coverPhoto);
      } catch {
        throw new ApolloError(Messages.errors.imageUploadError());
      }

      const jwtPayload = {
        name: user.name,
        email: user.email,
        id: user.id,
      };
      const token = jwt.sign(jwtPayload, process.env.JWT_KEY as string, {
        expiresIn: EXPIRES_IN,
      });

      return { user, token };
    },

    async deleteUser(_: any, { id }: { id: string }) {
      const userImages = await prisma.image.findMany({
        where: {
          userId: parseInt(id) || null,
        },
      });

      for (const image of userImages) {
        await deleteImage(image.path);
      }

      await prisma.user.delete({
        where: { id: parseInt(id) },
      });
      return true;
    },
  },
};

export default userResolvers;
