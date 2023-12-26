import {
  Box,
  BoxProps,
  Card,
  CardContent,
  SxProps,
  TablePagination,
  Typography,
} from '@mui/material';
import { ChangeEvent, MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FeedItemFragment } from '../../graphql/posts/fragments/gen/FeedItem.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const handleChangePage = (
    _: MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => setPage(newPage);

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
      <TablePagination
        component="div"
        count={100}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        SelectProps={{
          sx: { display: isDesktop ? undefined : 'none' },
        }}
        labelRowsPerPage={isDesktop ? undefined : <></>}
        sx={{ marginBottom: 1.5 }}
      />

      {feed.map((item) => (
        <FeedItem item={item} key={`${item.__typename}-${item.id}`} />
      ))}
    </Box>
  );
};

export default Feed;
