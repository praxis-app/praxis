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
  const [prevEndCursor, setPrevEndCursor] = useState<string>();

  const [getEventFeed, { data, loading }] = useEventFeedLazyQuery();

  useEffect(() => {
    getEventFeed({
      variables: {
        first: rowsPerPage,
        isLoggedIn,
        eventId,
      },
    });
  }, [getEventFeed, eventId, rowsPerPage, isLoggedIn]);

  const handleNextPage = async () => {
    if (!data?.event.posts.pageInfo.hasNextPage) {
      return;
    }
    const { pageInfo } = data.event.posts;
    const { endCursor, hasPreviousPage } = pageInfo;

    if (hasPreviousPage) {
      setPrevEndCursor(endCursor);
    }
    await getEventFeed({
      variables: {
        first: rowsPerPage,
        after: endCursor,
        isLoggedIn,
        eventId,
      },
    });
  };

  const handlePrevPage = async () => {
    await getEventFeed({
      variables: {
        first: rowsPerPage,
        after: prevEndCursor,
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
        feed={data?.event.posts}
        isLoading={loading}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
      />
    </>
  );
};

export default EventDiscussionTab;
