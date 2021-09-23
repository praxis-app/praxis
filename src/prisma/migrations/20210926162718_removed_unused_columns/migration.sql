/*
  Warnings:

  - You are about to drop the column `description` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `Vote` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "Vote" DROP COLUMN "verified";
