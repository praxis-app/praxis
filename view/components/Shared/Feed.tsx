import {
  Box,
  BoxProps,
  Card,
  CardContent,
  SxProps,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FeedItemFragment } from '../../graphql/posts/fragments/gen/FeedItem.gen';
import { HomeFeedQuery } from '../../graphql/users/queries/gen/HomeFeed.gen';
import PostCard from '../Posts/PostCard';
import ProposalCard from '../Proposals/ProposalCard';
import Pagination from './Pagination';

const CARD_CONTENT_STYLES: SxProps = {
  '&:last-child': {
    paddingY: 5,
  },
};

interface Props extends BoxProps {
  feed: HomeFeedQuery['me']['homeFeed'];
  onNextPage(): void;
  onPrevPage(): void;
  rowsPerPage: number;
  setRowsPerPage: (rowsPerPage: number) => void;
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
  ...boxProps
}: Props) => {
  const { t } = useTranslation();

  if (feed.edges.length === 0) {
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
        count={100}
        onNextPage={onNextPage}
        onPrevPage={onPrevPage}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
      >
        {feed.edges.map(({ node }) => (
          <FeedItem item={node} key={`${node.__typename}-${node.id}`} />
        ))}
      </Pagination>
    </Box>
  );
};

export default Feed;
