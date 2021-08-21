// Work around from https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
// Prevents hot reloading in development from creating new instances of PrismaClient

import { PrismaClient } from "@prisma/client";
import { Environments } from "../constants/common";

declare const global: typeof globalThis & { prisma?: PrismaClient };

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === Environments.Development) global.prisma = prisma;

export default prisma;
