import { useEffect, useState } from "react";
import { useReactiveVar } from "@apollo/client";
import { Card, LinearProgress } from "@material-ui/core";

import { feedVar } from "../../apollo/client/localState";
import Motion from "../Motions/Motion";
import Post from "../Posts/Post";
import { TypeNames } from "../../constants/common";

interface Props {
  deleteMotion: (id: string) => void;
  deletePost: (id: string) => void;
}

const List = ({ deleteMotion, deletePost }: Props) => {
  const { items, loading: feedLoading } = useReactiveVar(feedVar);
  /* TODO: Move this long comment to documentation
   Makes sure component is completely mounted and all matching html tags are present
   before adding additional components inside. Otherwise closing tags can be missed
   and classes incorrectly assigned to wrong HTML elements */
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (feedLoading)
    return (
      <Card>
        <LinearProgress />
      </Card>
    );

  return (
    <>
      {items.map((item) => {
        return item.__typename === TypeNames.Motion ? (
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
};

export default List;
