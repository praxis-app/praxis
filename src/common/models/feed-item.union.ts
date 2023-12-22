import { createUnionType } from '@nestjs/graphql';
import { Post } from '../../posts/models/post.model';
import { Proposal } from '../../proposals/models/proposal.model';

export const FeedItem = createUnionType({
  name: 'FeedItem',
  types: () => [Post, Proposal] as const,
});
