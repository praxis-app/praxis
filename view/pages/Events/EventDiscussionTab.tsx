import { useReactiveVar } from '@apollo/client';
import { Card, CardContent } from '@mui/material';
import { useEffect, useState } from 'react';
import PostForm from '../../components/Posts/PostForm';
import Feed from '../../components/Shared/Feed';
import { DEFAULT_PAGE_SIZE } from '../../constants/shared.constants';
import { isLoggedInVar } from '../../graphql/cache';
import { useEventFeedLazyQuery } from '../../graphql/events/queries/gen/EventFeed.gen';

interface Props {
  eventId: number;
}

const EventDiscussionTab = ({ eventId }: Props) => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(0);

  const [getEventFeed, { data, loading }] = useEventFeedLazyQuery();

  useEffect(() => {
    getEventFeed({
      variables: {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        isLoggedIn,
        eventId,
      },
    });
  }, [getEventFeed, eventId, rowsPerPage, isLoggedIn, page]);

  const handleChangePage = async (newPage: number) => {
    await getEventFeed({
      variables: {
        limit: rowsPerPage,
        offset: newPage * rowsPerPage,
        isLoggedIn,
        eventId,
      },
    });
  };

  return (
    <>
      {isLoggedIn && (
        <Card>
          <CardContent
            sx={{
              '&:last-child': {
                paddingBottom: 1,
              },
            }}
          >
            <PostForm eventId={eventId} />
          </CardContent>
        </Card>
      )}

      <Feed
        feedItems={data?.event.posts}
        totalCount={data?.event.postsCount}
        isLoading={loading}
        onChangePage={handleChangePage}
        page={page}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
      />
    </>
  );
};

export default EventDiscussionTab;
