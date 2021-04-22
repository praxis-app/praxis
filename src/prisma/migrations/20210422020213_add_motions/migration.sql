-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "motionId" INTEGER;

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "motionId" INTEGER;

-- AlterTable
ALTER TABLE "Like" ADD COLUMN     "motionId" INTEGER;

-- CreateTable
CREATE TABLE "Motion" (
    "id" SERIAL NOT NULL,
    "body" TEXT,
    "action" TEXT,
    "stage" TEXT NOT NULL DEFAULT E'voting',
    "version" INTEGER NOT NULL DEFAULT 1,
    "userId" INTEGER,
    "groupId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" SERIAL NOT NULL,
    "body" TEXT,
    "flipState" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Motion" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Motion" ADD FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD FOREIGN KEY ("motionId") REFERENCES "Motion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD FOREIGN KEY ("motionId") REFERENCES "Motion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD FOREIGN KEY ("motionId") REFERENCES "Motion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
