import { useReactiveVar } from "@apollo/client";
import { CircularProgress } from "@material-ui/core";
import { useEffect, useState } from "react";

import { feedItemsVar } from "../../apollo/client/localState";
import { Common } from "../../constants";
import Motion from "../Motions/Motion";
import Post from "../Posts/Post";

interface Props {
  deleteMotion: (id: string) => void;
  deletePost: (id: string) => void;
  loading?: boolean;
}

const List = ({ deleteMotion, deletePost, loading }: Props) => {
  const feed = useReactiveVar(feedItemsVar);
  /* TODO: Move this long comment to documentation
   Makes sure component is completely mounted and all matching html tags are present
   before adding additional components inside. Otherwise closing tags can be missed
   and classes incorrectly assigned to wrong HTML elements */
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!loading)
    return (
      <>
        {feed
          .sort((a, b) => parseInt(b.createdAt) - parseInt(a.createdAt))
          .slice(0, Common.PAGE_SIZE)
          .map((item) => {
            return item.__typename === Common.TypeNames.Motion ? (
              <Motion
                motion={item as Motion}
                deleteMotion={deleteMotion}
                key={`motion-${item.id}`}
              />
            ) : (
              <Post
                post={item as Post}
                deletePost={deletePost}
                key={`post-${item.id}`}
              />
            );
          })}
      </>
    );

  if (mounted) return <CircularProgress />;
  return <></>;
};

export default List;
