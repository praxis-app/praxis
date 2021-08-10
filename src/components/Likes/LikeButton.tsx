import { useEffect, useState } from "react";
import { useMutation, useLazyQuery } from "@apollo/client";
import { IconButton } from "@material-ui/core";
import { Favorite } from "@material-ui/icons";

import {
  LIKES_BY_POST_ID,
  LIKES_BY_MOTION_ID,
  LIKES_BY_COMMENT_ID,
} from "../../apollo/client/queries";
import { CREATE_LIKE, DELETE_LIKE } from "../../apollo/client/mutations";
import styles from "../../styles/Like/LikeButton.module.scss";
import { BLURPLE, WHITE } from "../../styles/Shared/theme";
import { noCache } from "../../utils/apollo";
import { useCurrentUser } from "../../hooks";

interface Props {
  postId?: string;
  motionId?: string;
  commentId?: string;
}

const LikeButton = ({ postId, motionId, commentId }: Props) => {
  const currentUser = useCurrentUser();
  const [likes, setLikes] = useState<Like[]>([]);
  const [createLike, { loading: createLikeLoading }] = useMutation(CREATE_LIKE);
  const [deleteLike, { loading: deleteLikeLoading }] = useMutation(DELETE_LIKE);
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
      disabled={createLikeLoading || deleteLikeLoading}
    >
      <Favorite
        color="primary"
        style={alreadyLike() ? { color: BLURPLE } : {}}
      />
      {likes.length > 0 && (
        <span
          className={styles.likesNumber}
          style={{ color: alreadyLike() ? BLURPLE : WHITE }}
        >
          {likes.length}
        </span>
      )}
    </IconButton>
  );
};

export default LikeButton;
