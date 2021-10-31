import { useEffect } from "react";
import { useLazyQuery, useMutation, useReactiveVar } from "@apollo/client";
import Feed from "../../components/Shared/Feed";
import Pagination from "../../components/Shared/Pagination";
import { EVENT_FEED } from "../../apollo/client/queries";
import { DELETE_POST } from "../../apollo/client/mutations";
import { feedVar, paginationVar } from "../../apollo/client/localState";
import { noCache, resetFeed } from "../../utils/clientIndex";
import PostsFormWithCard from "../Posts/FormWithCard";
import Messages from "../../utils/messages";
import { useCurrentUser } from "../../hooks";

interface Props {
  event: ClientEvent;
}

const DiscussionTab = ({ event }: Props) => {
  const currentUser = useCurrentUser();
  const feed = useReactiveVar(feedVar);
  const { currentPage, pageSize } = useReactiveVar(paginationVar);
  const [getFeedRes, feedRes] = useLazyQuery(EVENT_FEED, noCache);
  const [deletePost] = useMutation(DELETE_POST);

  useEffect(() => {
    if (event.id) {
      feedVar({
        ...feed,
        loading: true,
      });

      getFeedRes({
        variables: {
          pageSize,
          currentPage,
          eventId: event.id,
        },
      });
    }
  }, [event, currentPage, pageSize]);

  useEffect(() => {
    if (feedRes.data) {
      feedVar({
        items: feedRes.data.eventFeed.pagedItems,
        totalItems: feedRes.data.eventFeed.totalItems,
        loading: feedRes.loading,
      });
    }
  }, [feedRes.data]);

  useEffect(() => {
    return () => {
      resetFeed();
    };
  }, []);

  const deletePostHandler = async (id: string) => {
    await deletePost({
      variables: {
        id,
      },
    });
    feedVar({
      ...feed,
      items: feed.items.filter((item: ClientFeedItem) => item.id !== id),
      totalItems: feed.totalItems - 1,
    });
  };

  return (
    <>
      {currentUser && (
        <PostsFormWithCard
          bodyPlaceholder={Messages.posts.form.saySomething()}
          event={event}
          withoutToggle
        />
      )}

      <Pagination>
        <Feed deletePost={deletePostHandler} />
      </Pagination>
    </>
  );
};

export default DiscussionTab;
