import { useReactiveVar } from "@apollo/client";
import { CircularProgress } from "@material-ui/core";

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

  if (!loading)
    return (
      <div style={{ marginBottom: "200px" }}>
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
      </div>
    );

  return <CircularProgress style={{ color: "white" }} />;
};

export default List;
