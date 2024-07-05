import {
  Box,
  BoxProps,
  Card,
  CardContent,
  SxProps,
  Typography,
} from '@mui/material';
import { ReactNode, useState } from 'react';
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
  feedItems?: FeedItemFragment[];
  isLoading: boolean;
  noContentMessage?: ReactNode | string;
  onChangePage(page: number): void;
  page: number;
  rowsPerPage: number;
  setPage(page: number): void;
  setRowsPerPage: (rowsPerPage: number) => void;
  showTopPagination?: boolean;
  totalCount?: number;
  tabs?: ReactNode;
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
  feedItems,
  isLoading,
  noContentMessage,
  onChangePage,
  page,
  rowsPerPage,
  setPage,
  tabs,
  setRowsPerPage,
  showTopPagination,
  totalCount,
  ...boxProps
}: Props) => {
  const [prevPageItems, setPrevPageItems] = useState<FeedItemFragment[]>([]);
  const { t } = useTranslation();

  const getFeedItems = () => {
    if (!feedItems) {
      return prevPageItems;
    }
    if (!feedItems) {
      return [];
    }
    return feedItems;
  };

  const handleChangePage = (page: number) => {
    if (!feedItems) {
      return;
    }
    setPrevPageItems(feedItems);
    onChangePage(page);
  };

  const renderNoContentMessage = () => {
    if (noContentMessage) {
      return noContentMessage;
    }
    return (
      <Typography variant="body1" textAlign="center">
        {t('prompts.noContent')}
      </Typography>
    );
  };

  return (
    <Box {...boxProps}>
      <Pagination
        count={totalCount}
        isLoading={isLoading}
        onChangePage={handleChangePage}
        page={page}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
        showTopPagination={showTopPagination}
      >
        {tabs}

        {getFeedItems().map((item) => (
          <FeedItem item={item} key={`${item.__typename}-${item.id}`} />
        ))}

        {!isLoading && getFeedItems().length === 0 && (
          <Card>
            <CardContent sx={CARD_CONTENT_STYLES}>
              {renderNoContentMessage()}
            </CardContent>
          </Card>
        )}
      </Pagination>
    </Box>
  );
};

export default Feed;
