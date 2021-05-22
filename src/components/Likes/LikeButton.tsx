import { useEffect, useState } from "react";
import {
  useMutation,
  useQuery,
  useLazyQuery,
  LazyQueryHookOptions,
  OperationVariables,
} from "@apollo/client";
import { IconButton } from "@material-ui/core";
import { ThumbUp } from "@material-ui/icons";

import {
  CURRENT_USER,
  LIKES_BY_POST_ID,
  LIKES_BY_MOTION_ID,
  LIKES_BY_COMMENT_ID,
} from "../../apollo/client/queries";
import { CREATE_LIKE, DELETE_LIKE } from "../../apollo/client/mutations";

import styles from "../../styles/Like/LikeButton.module.scss";

interface Props {
  postId?: string;
  motionId?: string;
  commentId?: string;
}

const LikeButton = ({ postId, motionId, commentId }: Props) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const [likes, setLikes] = useState<Like[]>([]);
  const [createLike] = useMutation(CREATE_LIKE);
  const [deleteLike] = useMutation(DELETE_LIKE);
  const currentUserRes = useQuery(CURRENT_USER);

  const noCache: LazyQueryHookOptions<any, OperationVariables> = {
    fetchPolicy: "no-cache",
  };
  const [getLikesByPostId, likesByPostIdRes] = useLazyQuery(
    LIKES_BY_POST_ID,
    noCache
  );
  const [getLikesByMotionId, likesByMotionIdRes] = useLazyQuery(
    LIKES_BY_MOTION_ID,
    noCache
  );
  const [getLikesByCommentId, likesByCommentIdRes] = useLazyQuery(
    LIKES_BY_COMMENT_ID,
    noCache
  );

  useEffect(() => {
    if (postId) getLikesByPostId({ variables: { postId } });
    if (motionId) getLikesByMotionId({ variables: { motionId } });
    if (commentId) getLikesByCommentId({ variables: { commentId } });
  }, []);

  useEffect(() => {
    if (currentUserRes.data) setCurrentUser(currentUserRes.data.user);
  }, [currentUserRes.data]);

  useEffect(() => {
    if (postId && likesByPostIdRes.data)
      setLikes(likesByPostIdRes.data.likesByPostId);

    if (motionId && likesByMotionIdRes.data)
      setLikes(likesByMotionIdRes.data.likesByMotionId);

    if (commentId && likesByCommentIdRes.data)
      setLikes(likesByCommentIdRes.data.likesByCommentId);
  }, [
    likesByPostIdRes.data,
    likesByMotionIdRes.data,
    likesByCommentIdRes.data,
  ]);

  const alreadyLike = (): Like | null => {
    if (!currentUser) return null;

    const like = likes.find((like) => like.userId === currentUser.id);

    if (like) return like;
    return null;
  };

  const createLikeMutation = async () => {
    let likedItemId: Record<string, unknown> = { postId };
    if (commentId) likedItemId = { commentId };
    if (motionId) likedItemId = { motionId };

    const { data } = await createLike({
      variables: {
        userId: currentUser?.id,
        ...likedItemId,
      },
    });
    setLikes([...likes, data.createLike.like]);
  };

  const deleteLikeMutation = async () => {
    await deleteLike({
      variables: {
        id: alreadyLike()?.id,
      },
    });
    setLikes(likes.filter((like) => like.userId !== currentUser?.id));
  };

  return (
    <IconButton
      onClick={() =>
        alreadyLike() ? deleteLikeMutation() : createLikeMutation()
      }
    >
      <ThumbUp style={{ color: alreadyLike() ? "tomato" : "white" }} />
      {likes.length > 0 && (
        <span
          className={styles.likesNumber}
          style={{ color: alreadyLike() ? "tomato" : "white" }}
        >
          {likes.length}
        </span>
      )}
    </IconButton>
  );
};

export default LikeButton;
