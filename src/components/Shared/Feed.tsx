import { useEffect, useState } from "react";
import { useReactiveVar } from "@apollo/client";
import { Card, LinearProgress } from "@material-ui/core";

import { feedVar } from "../../apollo/client/localState";
import { Common } from "../../constants";
import Motion from "../Motions/Motion";
import Post from "../Posts/Post";

interface Props {
  deleteMotion: (id: string) => void;
  deletePost: (id: string) => void;
}

const List = ({ deleteMotion, deletePost }: Props) => {
  const feed = useReactiveVar(feedVar);
  /* TODO: Move this long comment to documentation
   Makes sure component is completely mounted and all matching html tags are present
   before adding additional components inside. Otherwise closing tags can be missed
   and classes incorrectly assigned to wrong HTML elements */
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!feed.loading)
    return (
      <>
        {feed.items.map((item) => {
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

  if (mounted)
    return (
      <Card>
        <LinearProgress />
      </Card>
    );

  return <></>;
};

export default List;
