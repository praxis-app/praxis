import {
  Box,
  BoxProps,
  Card,
  CardContent,
  SxProps,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FeedItemFragment } from '../../graphql/posts/fragments/gen/FeedItem.gen';
import PostCard from '../Posts/PostCard';
import ProposalCard from '../Proposals/ProposalCard';
import Pagination from './Pagination';

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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
      <Pagination
        page={page}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
      />

      {feed.map((item) => (
        <FeedItem item={item} key={`${item.__typename}-${item.id}`} />
      ))}

      <Pagination
        page={page}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
      />
    </Box>
  );
};

export default Feed;
