// Work around from https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
// Prevents hot reloading in development from creating new instances of PrismaClient

import { PrismaClient } from "@prisma/client";
import { Common } from "../constants";

declare const global: typeof globalThis & { prisma?: PrismaClient };

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === Common.Environments.Development)
  global.prisma = prisma;

export default prisma;
