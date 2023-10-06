import { Box, BoxProps } from '@mui/material';
import { CommentFragment } from '../../apollo/comments/generated/Comment.fragment';
import Comment from './Comment';

interface Props extends BoxProps {
  canManageComments: boolean;
  comments: CommentFragment[];
  currentUserId?: number;
  postId?: number;
  proposalId?: number;
}

const CommentsList = ({
  canManageComments,
  comments,
  currentUserId,
  proposalId,
  postId,
  ...boxProps
}: Props) => {
  if (!comments.length) {
    return null;
  }
  return (
    <Box marginBottom={1.5} {...boxProps}>
      {comments.map((comment) => (
        <Comment
          key={comment.id}
          canManageComments={canManageComments}
          comment={comment}
          currentUserId={currentUserId}
          proposalId={proposalId}
          postId={postId}
        />
      ))}
    </Box>
  );
};

export default CommentsList;
