import { CircularProgress } from "@material-ui/core";
import Motion from "../Motions/Motion";
import Post from "../Posts/Post";

interface Props {
  feed: FeedItem[];
  deleteMotion: (id: string) => void;
  deletePost: (id: string) => void;
}

const List = ({ feed, deleteMotion, deletePost }: Props) => {
  if (feed)
    return (
      <div style={{ marginBottom: "200px" }}>
        {feed
          .sort((a, b) => parseInt(b.createdAt) - parseInt(a.createdAt))
          .map((item) => {
            return item.__typename === "Motion" ? (
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
