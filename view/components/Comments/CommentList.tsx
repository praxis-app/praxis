import { Box, BoxProps } from '@mui/material';
import { CommentFragment } from '../../graphql/comments/fragments/gen/Comment.gen';
import Comment from './Comment';

interface Props extends BoxProps {
  canManageComments?: boolean;
  comments: CommentFragment[];
  currentUserId?: number;
  postId?: number;
  proposalId?: number;
  questionnaireTicketId?: number;
  questionId?: number;
}

const CommentsList = ({
  canManageComments,
  comments,
  currentUserId,
  postId,
  proposalId,
  questionnaireTicketId,
  questionId,
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
          postId={postId}
          proposalId={proposalId}
          questionnaireTicketId={questionnaireTicketId}
          questionId={questionId}
        />
      ))}
    </Box>
  );
};

export default CommentsList;
