import { useMutation } from "@apollo/client";
import { Favorite } from "@material-ui/icons";
import classNames from "classnames/bind";

import { CREATE_LIKE, DELETE_LIKE } from "../../apollo/client/mutations";
import { useCurrentUser } from "../../hooks";
import Messages from "../../utils/messages";
import ActionButton from "../Shared/ActionButton";
import styles from "../../styles/Like/LikeButton.module.scss";
import { BLURPLE } from "../../styles/Shared/theme";

interface Props {
  postId?: string;
  motionId?: string;
  commentId?: string;
  likes: Like[];
  setLikes: (likes: Like[]) => void;
}

const ActionLikeButton = ({
  postId,
  motionId,
  commentId,
  likes,
  setLikes,
}: Props) => {
  const currentUser = useCurrentUser();
  const [createLike, { loading: createLikeLoading }] = useMutation(CREATE_LIKE);
  const [deleteLike, { loading: deleteLikeLoading }] = useMutation(DELETE_LIKE);
  const cx = classNames.bind(styles);

  const alreadyLike = (): Like | null => {
    if (!currentUser) return null;

    const like = likes.find((like) => like.userId === currentUser.id);

    if (like) return like;
    return null;
  };

  const buttonColor = alreadyLike() ? { color: BLURPLE } : {};

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
    <ActionButton
      onClick={() =>
        alreadyLike() ? deleteLikeMutation() : createLikeMutation()
      }
      disabled={createLikeLoading || deleteLikeLoading}
    >
      <Favorite
        color="primary"
        style={{
          marginRight: 7.5,
          transition: "0.2s",
          ...buttonColor,
        }}
      />
      <span
        className={cx(styles.likeText, {
          liked: alreadyLike(),
        })}
      >
        {Messages.actions.like()}
      </span>
    </ActionButton>
  );
};

export default ActionLikeButton;
