import { CircularProgress } from "@material-ui/core";
import Post from "./Post";

interface Props {
  posts: Post[];
  loading: boolean;
  deletePost: (id: string) => void;
}

const List = ({ posts, loading, deletePost }: Props) => {
  if (!loading)
    return (
      <div style={{ marginBottom: "200px" }}>
        {posts
          .slice()
          .reverse()
          .map((post) => {
            return <Post post={post} deletePost={deletePost} key={post.id} />;
          })}
      </div>
    );

  return <CircularProgress style={{ color: "white" }} />;
};

export default List;
