import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  makeStyles,
  CardHeader,
  CardMedia,
} from "@material-ui/core";

import ImagesList from "../Images/List";
import { IMAGES_BY_COMMENT_ID } from "../../apollo/client/queries";
import LikeButton from "../Likes/LikeButton";
import UserAvatar from "../Users/Avatar";
import ItemMenu from "../Shared/ItemMenu";
import styles from "../../styles/Comment/Comment.module.scss";
import { ModelNames } from "../../constants/common";
import { Permissions } from "../../constants/role";
import { noCache } from "../../utils/apollo";
import {
  useCurrentUser,
  useHasPermissionGlobally,
  useUserById,
} from "../../hooks";
import { timeAgo } from "../../utils/time";

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
  title: {
    fontSize: 16,
  },
});

interface Props {
  comment: ClientComment;
  deleteComment: (id: string) => void;
}

const Comment = ({ comment, deleteComment }: Props) => {
  const { id, userId, body, createdAt } = comment;
  const currentUser = useCurrentUser();
  const [canManageComments] = useHasPermissionGlobally(
    Permissions.ManageComments
  );
  const user = useUserById(userId);
  const [images, setImages] = useState<ClientImage[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const imagesRes = useQuery(IMAGES_BY_COMMENT_ID, {
    variables: { commentId: id },
    ...noCache,
  });
  const classes = useStyles();

  useEffect(() => {
    if (imagesRes.data) setImages(imagesRes.data.imagesByCommentId);
  }, [imagesRes.data]);

  const ownComment = (): boolean => {
    if (currentUser && user && currentUser.id === user.id) return true;
    return false;
  };

  return (
    <div className={styles.comment} key={id}>
      <div className={styles.avatar}>{<UserAvatar user={user} />}</div>

      <Card className={classes.root}>
        <CardHeader
          title={
            <>
              <Link href={`/users/${user?.name}`}>
                <a>{user?.name}</a>
              </Link>
              <span className={styles.timeAgo}>{timeAgo(createdAt)}</span>
            </>
          }
          action={
            <ItemMenu
              itemId={id}
              itemType={ModelNames.Comment}
              anchorEl={menuAnchorEl}
              setAnchorEl={setMenuAnchorEl}
              deleteItem={deleteComment}
              ownItem={ownComment}
              hasPermission={canManageComments}
            />
          }
          classes={{ title: classes.title }}
        />
        <CardContent>
          <Typography
            style={{
              marginTop: "-12px",
            }}
          >
            {body}
          </Typography>
        </CardContent>

        <CardMedia>
          <ImagesList images={images} />
        </CardMedia>

        {currentUser && (
          <CardActions>
            <LikeButton commentId={id} />
          </CardActions>
        )}
      </Card>
    </div>
  );
};

export default Comment;
