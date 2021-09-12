import { CircularProgress } from "@material-ui/core";
import Comment from "./Comment";

interface Props {
  comments: ClientComment[];
  deleteComment: (id: string) => void;
}

const List = ({ comments, deleteComment }: Props) => {
  if (comments)
    return (
      <>
        {comments
          .slice()
          .reverse()
          .map((comment) => {
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
