import { Spinner } from "react-bootstrap";
import Comment from "./Comment";

interface Props {
  comments: Comment[];
  deleteComment: (id: string) => void;
}

const List = ({ comments, deleteComment }: Props) => {
  if (comments)
    return (
      <div style={{ marginBottom: "200px" }}>
        {comments
          .slice()
          .reverse()
          .map((comment: Comment) => {
            return (
              <Comment
                comment={comment}
                deleteComment={deleteComment}
                key={comment.id}
              />
            );
          })}
      </div>
    );

  return <Spinner animation="border" />;
};

export default List;
