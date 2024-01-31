import { Box, BoxProps } from '@mui/material';
import { CommentFragment } from '../../graphql/comments/fragments/gen/Comment.gen';
import Comment from './Comment';

interface Props extends BoxProps {
  answerId?: number;
  canManageComments?: boolean;
  comments: CommentFragment[];
  currentUserId?: number;
  postId?: number;
  proposalId?: number;
}

const CommentsList = ({
  answerId,
  canManageComments,
  comments,
  currentUserId,
  postId,
  proposalId,
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
          answerId={answerId}
          canManageComments={canManageComments}
          comment={comment}
          currentUserId={currentUserId}
          postId={postId}
          proposalId={proposalId}
        />
      ))}
    </Box>
  );
};

export default CommentsList;
