import { ApolloError, UserInputError } from "apollo-server-micro";
import { GraphQLUpload } from "apollo-server-micro";
import { saveImage, deleteImage } from "../../utils/image";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import prisma from "../../utils/initPrisma";
import { validateSignup, validateLogin } from "../../utils/validation";
import { Common } from "../../constants";
import Messages from "../../utils/messages";
import { paginate } from "../../utils/items";

interface HomeFeedInput extends PaginationState {
  userId?: string;
}

interface ProfileFeedInput extends PaginationState {
  name: string;
}

const saveProfilePicture = async (user: any, image: any) => {
  if (image) {
    const path = await saveImage(image);

    await prisma.image.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
        profilePicture: true,
        path,
      },
    });
  }
};

const userResolvers = {
  FileUpload: GraphQLUpload,

  Query: {
    homeFeed: async (
      _: any,
      { userId, currentPage, pageSize }: HomeFeedInput
    ) => {
      let feed: BackendFeedItem[] = [];

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
                  __typename: Common.TypeNames.Motion,
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
                __typename: Common.TypeNames.Motion,
              })),
            ];
        }
        feed.forEach((item) => {
          if (!item.__typename) item.__typename = Common.TypeNames.Post;
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
          item.__typename = Common.TypeNames.Post;
        });
        motions.forEach((item) => {
          item.__typename = Common.TypeNames.Motion;
        });

        feed = [...posts, ...motions];
      }

      return {
        pagedItems: paginate(
          feed.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
          currentPage,
          pageSize
        ),
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
        item.__typename = Common.TypeNames.Post;
      });
      motions.forEach((item) => {
        item.__typename = Common.TypeNames.Motion;
      });
      feed.push(...posts, ...motions);

      return {
        pagedItems: paginate(
          feed.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
          currentPage,
          pageSize
        ),
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

      if (!isValid) {
        throw new UserInputError(JSON.stringify(errors));
      }

      const userFound = await prisma.user.findMany({
        where: {
          email,
        },
      });

      if (userFound.length > 0) {
        throw new UserInputError(Messages.users.validation.emailExists());
      }

      const hash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hash,
        },
      });

      try {
        await saveProfilePicture(user, profilePicture);
      } catch (e) {
        const currUser = {
          where: { id: user.id },
        };
        await prisma.user.delete(currUser);

        throw new ApolloError(Messages.errors.imageUploadError() + e);
      }

      const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      const token = jwt.sign(jwtPayload, process.env.JWT_KEY as string, {
        expiresIn: Common.EXPIRES_IN,
      });

      return { user, token };
    },

    async signIn(_: any, { input }: { input: SignInInput }) {
      const { errors, isValid } = validateLogin(input);
      const { email, password } = input;

      if (!isValid) {
        throw new UserInputError(JSON.stringify(errors));
      }

      const user = await prisma.user.findFirst({
        where: {
          email,
        },
      });

      if (!user) {
        throw new UserInputError(Messages.users.validation.noUserWithEmail());
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        const jwtPayload = {
          id: user.id,
          name: user.name,
          email: user.email,
        };
        const token = jwt.sign(jwtPayload, process.env.JWT_KEY as string, {
          expiresIn: Common.EXPIRES_IN,
        });

        return { user, token };
      } else {
        throw new UserInputError(Messages.users.validation.wrongPassword());
      }
    },

    async updateUser(
      _: any,
      { id, input }: { id: string; input: SignUpInput }
    ) {
      const { email, name, profilePicture } = input;

      const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: { email, name },
      });

      if (!user)
        throw new Error(Messages.items.notFound(Common.TypeNames.User));

      try {
        await saveProfilePicture(user, profilePicture);
      } catch (e) {
        throw new ApolloError(Messages.errors.imageUploadError() + e);
      }

      const jwtPayload = {
        name: user.name,
        email: user.email,
        id: user.id,
      };

      const token = jwt.sign(jwtPayload, process.env.JWT_KEY as string, {
        expiresIn: "90d",
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
