import { CircularProgress } from "@material-ui/core";
import Comment from "./Comment";

interface Props {
  comments: Comment[];
  deleteComment: (id: string) => void;
}

const List = ({ comments, deleteComment }: Props) => {
  if (comments)
    return (
      <>
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
      </>
    );

  return <CircularProgress />;
};

export default List;
