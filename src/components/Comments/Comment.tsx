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
import { isLoggedIn } from "../../utils/auth";
import styles from "../../styles/Comment/Comment.module.scss";
import { Common } from "../../constants";
import { noCache } from "../../utils/apollo";
import { useCurrentUser, useUserById } from "../../hooks";

const useStyles = makeStyles({
  root: {
    width: "100%",
    marginBottom: 12,
    backgroundColor: "rgb(65, 65, 65)",
  },
  title: {
    fontFamily: "Inter",
    fontSize: 16,
  },
});

interface Props {
  comment: Comment;
  deleteComment: (id: string) => void;
}

const Comment = ({ comment: { id, userId, body }, deleteComment }: Props) => {
  const currentUser = useCurrentUser();
  const user = useUserById(userId);
  const [images, setImages] = useState<Image[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const imagesRes = useQuery(IMAGES_BY_COMMENT_ID, {
    variables: { commentId: id },
    ...noCache,
  });
  const classes = useStyles();

  useEffect(() => {
    setImages(imagesRes.data ? imagesRes.data.imagesByCommentId : []);
  }, [imagesRes.data]);

  const ownComment = (): boolean => {
    if (currentUser && user && currentUser.id === user.id) return true;
    return false;
  };

  return (
    <div className={styles.comment} key={id}>
      <div className={styles.avatar}>{user && <UserAvatar user={user} />}</div>

      <Card className={classes.root}>
        <CardHeader
          title={
            <Link href={`/users/${user?.name}`}>
              <a>{user?.name}</a>
            </Link>
          }
          action={
            <ItemMenu
              itemId={id}
              itemType={Common.ModelNames.Comment}
              anchorEl={menuAnchorEl}
              setAnchorEl={setMenuAnchorEl}
              deleteItem={deleteComment}
              ownItem={ownComment}
            />
          }
          classes={{ title: classes.title }}
        />
        <CardContent>
          <Typography
            style={{
              color: "rgb(190, 190, 190)",
              marginTop: "-12px",
              fontFamily: "Inter",
            }}
          >
            {body}
          </Typography>
        </CardContent>

        <CardMedia>
          <ImagesList images={images} />
        </CardMedia>

        {isLoggedIn(currentUser) && (
          <CardActions>
            <LikeButton commentId={id} />
          </CardActions>
        )}
      </Card>
    </div>
  );
};

export default Comment;
