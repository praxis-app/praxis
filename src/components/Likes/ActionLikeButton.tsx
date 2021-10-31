import { useMutation } from "@apollo/client";
import { Favorite } from "@material-ui/icons";
import clsx from "clsx";

import { CREATE_LIKE, DELETE_LIKE } from "../../apollo/client/mutations";
import { useCurrentUser } from "../../hooks";
import Messages from "../../utils/messages";
import CardFooterButton from "../Shared/CardFooterButton";
import styles from "../../styles/Like/LikeButton.module.scss";
import { BLURPLE } from "../../styles/Shared/theme";

interface Props {
  postId?: string;
  motionId?: string;
  commentId?: string;
  likes: ClientLike[];
  setLikes: (likes: ClientLike[]) => void;
}

const CardFooterLikeButton = ({
  postId,
  motionId,
  commentId,
  likes,
  setLikes,
}: Props) => {
  const currentUser = useCurrentUser();
  const [createLike, { loading: createLikeLoading }] = useMutation(CREATE_LIKE);
  const [deleteLike, { loading: deleteLikeLoading }] = useMutation(DELETE_LIKE);

  const alreadyLike = (): ClientLike | null => {
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
    <CardFooterButton
      onClick={() =>
        alreadyLike() ? deleteLikeMutation() : createLikeMutation()
      }
      disabled={createLikeLoading || deleteLikeLoading}
    >
      <Favorite
        color="primary"
        style={{
          marginRight: 7.5,
          transition: "0.3s",
          ...buttonColor,
        }}
      />
      <span
        className={clsx(styles.likeText, {
          [styles.liked]: alreadyLike(),
        })}
      >
        {Messages.actions.like()}
      </span>
    </CardFooterButton>
  );
};

export default CardFooterLikeButton;
