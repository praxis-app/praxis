import { useEffect, useState } from "react";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { IconButton } from "@material-ui/core";
import { ThumbUp } from "@material-ui/icons";

import {
  CURRENT_USER,
  LIKES_BY_POST_ID,
  LIKES_BY_COMMENT_ID,
} from "../../apollo/client/queries";
import { CREATE_LIKE, DELETE_LIKE } from "../../apollo/client/mutations";

import styles from "../../styles/LikeButton.module.scss";

interface Props {
  postId?: string;
  commentId?: string;
}

const LikeButton = ({ postId, commentId }: Props) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [likes, setLikes] = useState([]);
  const [createLike] = useMutation(CREATE_LIKE);
  const [deleteLike] = useMutation(DELETE_LIKE);
  const currentUserRes = useQuery(CURRENT_USER);

  const [getLikesByPostId, likesByPostIdRes] = useLazyQuery(LIKES_BY_POST_ID, {
    fetchPolicy: "no-cache",
  });
  const [getLikesByCommentId, likesByCommentIdRes] = useLazyQuery(
    LIKES_BY_COMMENT_ID,
    {
      fetchPolicy: "no-cache",
    }
  );

  useEffect(() => {
    if (postId) getLikesByPostId({ variables: { postId } });
    if (commentId) getLikesByCommentId({ variables: { commentId } });
  }, []);

  useEffect(() => {
    setCurrentUser(currentUserRes.data ? currentUserRes.data.user : null);
  }, [currentUserRes.data]);

  useEffect(() => {
    if (postId && likesByPostIdRes.data)
      setLikes(likesByPostIdRes.data.likesByPostId);
    if (commentId && likesByCommentIdRes.data)
      setLikes(likesByCommentIdRes.data.likesByCommentId);
  }, [likesByPostIdRes.data, likesByCommentIdRes.data]);

  const alreadyLike = (): Like => {
    if (!currentUser) return null;

    const like = likes.find((like) => like.userId === currentUser.id);

    if (like) return like;
    return null;
  };

  const createLikeMutation = async () => {
    const likedItemId = postId ? { postId } : { commentId };
    const { data } = await createLike({
      variables: {
        userId: currentUser.id,
        ...likedItemId,
      },
    });
    setLikes([...likes, data.createLike.like]);
  };

  const deleteLikeMutation = async () => {
    await deleteLike({
      variables: {
        id: alreadyLike().id,
      },
    });
    setLikes(
      likes.filter(
        (like) =>
          parseInt(like.userId) !== (parseInt(currentUser.id) || currentUser.id)
      )
    );
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
