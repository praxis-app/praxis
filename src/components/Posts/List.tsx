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
      <>
        {posts
          .slice()
          .reverse()
          .map((post) => {
            return <Post post={post} deletePost={deletePost} key={post.id} />;
          })}
      </>
    );

  return <CircularProgress />;
};

export default List;
