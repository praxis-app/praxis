import { Spinner } from "react-bootstrap";
import Post from "./Post";

const List = ({ posts, deletePost }) => {
  if (posts)
    return (
      <>
        {posts
          .slice()
          .reverse()
          .map((post) => {
            return <Post post={post} deletePost={deletePost} />;
          })}
      </>
    );

  return <Spinner animation="border" />;
};

export default List;
