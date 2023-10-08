import {
  Box,
  BoxProps,
  Card,
  CardContent,
  SxProps,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FeedItemFragment } from '../../apollo/posts/generated/FeedItem.fragment';
import PostCard from '../Posts/PostCard';
import ProposalCard from '../Proposals/ProposalCard';

const CARD_CONTENT_STYLES: SxProps = {
  '&:last-child': {
    paddingY: 5,
  },
};

interface Props extends BoxProps {
  feed: FeedItemFragment[];
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

const Feed = ({ feed, ...boxProps }: Props) => {
  const { t } = useTranslation();

  if (feed.length === 0) {
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
      {feed.map((item) => (
        <FeedItem item={item} key={`${item.__typename}-${item.id}`} />
      ))}
    </Box>
  );
};

export default Feed;
