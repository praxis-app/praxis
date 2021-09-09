-- RenameIndex
ALTER INDEX "Follow.userId_followerId_unique" RENAME TO "Follow_userId_followerId_key";

-- RenameIndex
ALTER INDEX "GroupMember.userId_groupId_unique" RENAME TO "GroupMember_userId_groupId_key";

-- RenameIndex
ALTER INDEX "Like.userId_postId_commentId_unique" RENAME TO "Like_userId_postId_commentId_key";

-- RenameIndex
ALTER INDEX "MemberRequest.userId_groupId_unique" RENAME TO "MemberRequest_userId_groupId_key";

-- RenameIndex
ALTER INDEX "ServerInvite.token_unique" RENAME TO "ServerInvite_token_key";

-- RenameIndex
ALTER INDEX "Vote.userId_motionId_unique" RENAME TO "Vote_userId_motionId_key";
