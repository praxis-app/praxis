import { UserInputError } from "apollo-server-micro";
import { GraphQLUpload } from "apollo-server-micro";
import saveImage from "../../utils/saveImage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import prisma from "../../utils/initPrisma";
import { validateSignup, validateLogin } from "../../utils/validation";

const saveProfilePicture = async (user: any, image: any) => {
  const { createReadStream, mimetype } = await image;
  const extension = mimetype.split("/")[1];
  const path = "public/uploads/" + Date.now() + "." + extension;
  await saveImage(createReadStream, path);

  await prisma.image.create({
    data: {
      user: {
        connect: {
          id: user.id,
        },
      },
      profilePicture: true,
      path: path.replace("public", ""),
    },
  });
};

const userResolvers = {
  FileUpload: GraphQLUpload,

  Query: {
    user: async (_: any, { id }) => {
      try {
        const user = await prisma.user.findFirst({
          where: {
            id: parseInt(id),
          },
        });
        return user;
      } catch (error) {
        throw error;
      }
    },

    userByName: async (_: any, { name }) => {
      try {
        const user = await prisma.user.findFirst({
          where: {
            name: name,
          },
        });
        return user;
      } catch (error) {
        throw error;
      }
    },

    allUsers: async () => {
      try {
        const users = await prisma.user.findMany();
        return users;
      } catch (error) {
        throw error;
      }
    },
  },

  Mutation: {
    async signUp(_: any, { input }) {
      const { email, name, password, profilePicture } = input;
      const { errors, isValid } = validateSignup(input);

      if (!isValid) {
        throw new UserInputError(JSON.stringify(errors));
      }

      try {
        const userFound = await prisma.user.findMany({
          where: {
            email: email,
          },
        });

        if (userFound.length > 0) {
          throw new UserInputError("Email already exists.");
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
          data: {
            email: email,
            name: name,
            password: hash,
          },
        });

        await saveProfilePicture(user, profilePicture);

        const jwtPayload = {
          id: user.id,
          name: user.name,
          email: user.email,
        };

        const token = jwt.sign(jwtPayload, process.env.JWT_KEY, {
          expiresIn: "90d",
        });

        return { user, token };
      } catch (err) {
        throw new Error(err);
      }
    },

    async signIn(_: any, { input }) {
      const { errors, isValid } = validateLogin(input);
      const { email, password } = input;

      if (!isValid) {
        throw new UserInputError(JSON.stringify(errors));
      }

      try {
        const user = await prisma.user.findFirst({
          where: {
            email: email,
          },
        });
        if (!user) {
          throw new UserInputError("No user exists with that email");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
          const jwtPayload = {
            id: user.id,
            name: user.name,
            email: user.email,
          };
          const token = jwt.sign(jwtPayload, process.env.JWT_KEY, {
            expiresIn: "90d",
          });

          return { user, token };
        } else {
          throw new UserInputError("Wrong password. Try again");
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    async updateUser(_: any, { id, input }) {
      const { email, name, profilePicture } = input;

      try {
        const user = await prisma.user.update({
          where: { id: parseInt(id) },
          data: { email: email, name: name },
        });

        if (!user) throw new Error("User not found.");

        await saveProfilePicture(user, profilePicture);

        const jwtPayload = {
          name: user.name,
          email: user.email,
          id: user.id,
        };

        const token = jwt.sign(jwtPayload, process.env.JWT_KEY, {
          expiresIn: "90d",
        });

        return { user, token };
      } catch (err) {
        throw new Error(err);
      }
    },

    async deleteUser(_: any, { id }) {
      try {
        await prisma.user.delete({
          where: { id: parseInt(id) },
        });
        return true;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default userResolvers;
