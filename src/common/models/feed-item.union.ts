import { createUnionType } from "@nestjs/graphql";
import { Post } from "../../posts/models/post.model";
import { Proposal } from "../../proposals/models/proposal.model";

const FeedItem = createUnionType({
  name: "FeedItem",
  types: () => [Post, Proposal] as const,
});

export default FeedItem;
