import { CircularProgress } from "@material-ui/core";
import { GlobalPermissions, GroupPermissions } from "../../constants/role";
import {
  useHasPermissionByGroupId,
  useHasPermissionGlobally,
} from "../../hooks";
import Comment from "./Comment";

interface Props {
  comments: ClientComment[];
  deleteComment: (id: string) => void;
  loading: boolean;
  groupId: string;
}

const CommentsList = ({ comments, deleteComment, loading, groupId }: Props) => {
  const [canManageCommentsGlobally] = useHasPermissionGlobally(
    GlobalPermissions.ManageComments
  );
  const [canManageCommentsByGroup] = useHasPermissionByGroupId(
    GroupPermissions.ManageComments,
    groupId
  );

  if (loading) return <CircularProgress />;

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
              canManageComments={
                canManageCommentsGlobally || canManageCommentsByGroup
              }
              key={comment.id}
            />
          );
        })}
    </>
  );
};

export default CommentsList;
