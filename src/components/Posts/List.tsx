import { Spinner } from "react-bootstrap";
import Post from "./Post";

const List = ({ posts, deletePost }) => {
  if (posts)
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

  return <Spinner animation="border" />;
};

export default List;
