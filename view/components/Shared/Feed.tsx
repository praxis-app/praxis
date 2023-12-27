import {
  Box,
  BoxProps,
  Card,
  CardContent,
  SxProps,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { GroupFeedQuery } from '../../graphql/groups/queries/gen/GroupFeed.gen';
import { PublicGroupsFeedQuery } from '../../graphql/groups/queries/gen/PublicGroupsFeed.gen';
import { FeedItemFragment } from '../../graphql/posts/fragments/gen/FeedItem.gen';
import { HomeFeedQuery } from '../../graphql/users/queries/gen/HomeFeed.gen';
import { UserProfileFeedQuery } from '../../graphql/users/queries/gen/UserProfileFeed.gen';
import PostCard from '../Posts/PostCard';
import ProposalCard from '../Proposals/ProposalCard';
import Pagination from './Pagination';

const CARD_CONTENT_STYLES: SxProps = {
  '&:last-child': {
    paddingY: 5,
  },
};

interface Props extends BoxProps {
  feed?:
    | GroupFeedQuery['group']['feed']
    | HomeFeedQuery['me']['homeFeed']
    | PublicGroupsFeedQuery['publicGroupsFeed']
    | UserProfileFeedQuery['user']['profileFeed'];
  onNextPage(): void;
  onPrevPage(): void;
  rowsPerPage: number;
  setRowsPerPage: (rowsPerPage: number) => void;
  isLoading: boolean;
}

const FeedItem = ({ item }: { item: FeedItemFragment }) => {
  if (item.__typename === 'Proposal') {
    return <ProposalCard proposal={item} />;
  }
  if (item.__typename !== 'Post') {
    return null;
  }
  return <PostCard post={item} />;
};

const Feed = ({
  feed,
  onNextPage,
  onPrevPage,
  rowsPerPage,
  setRowsPerPage,
  isLoading,
  ...boxProps
}: Props) => {
  const { t } = useTranslation();

  if (feed?.edges.length === 0) {
    return (
      <Card>
        <CardContent sx={CARD_CONTENT_STYLES}>
          <Typography variant="body1" textAlign="center">
            {t('prompts.noContent')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box {...boxProps}>
      <Pagination
        count={feed?.totalCount || 0}
        isLoading={isLoading}
        onNextPage={onNextPage}
        onPrevPage={onPrevPage}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
      >
        {feed?.edges.map(({ node }) => (
          <FeedItem item={node} key={`${node.__typename}-${node.id}`} />
        ))}
      </Pagination>
    </Box>
  );
};

export default Feed;
