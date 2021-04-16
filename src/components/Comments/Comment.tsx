import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { Edit, Delete } from "@material-ui/icons";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardActions,
  Typography,
  makeStyles,
  CardHeader,
  CardMedia,
  Avatar,
} from "@material-ui/core";

import ImagesList from "../Images/List";
import {
  IMAGES_BY_COMMENT_ID,
  USER,
  CURRENT_USER,
} from "../../apollo/client/queries";

import styles from "../../styles/Comment/Comment.module.scss";
import LikeButton from "../Likes/LikeButton";
import UserAvatar from "../Users/Avatar";
import { isLoggedIn } from "../../utils/auth";

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
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const [user, setUser] = useState<User>();
  const [images, setImages] = useState([]);
  const currentUserRes = useQuery(CURRENT_USER);
  const userRes = useQuery(USER, {
    variables: { id: userId },
  });
  const imagesRes = useQuery(IMAGES_BY_COMMENT_ID, {
    variables: { commentId: id },
    fetchPolicy: "no-cache",
  });
  const classes = useStyles();

  useEffect(() => {
    setCurrentUser(currentUserRes.data ? currentUserRes.data.user : null);
  }, [currentUserRes.data]);

  useEffect(() => {
    setUser(userRes.data ? userRes.data.user : null);
  }, [userRes.data]);

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

            {ownComment() && (
              <>
                <Link href={`/comments/${id}/edit`}>
                  <a>
                    <Edit /> Edit
                  </a>
                </Link>

                <a
                  onClick={() =>
                    window.confirm(
                      "Are you sure you want to delete this comment?"
                    ) && deleteComment(id)
                  }
                  style={{ cursor: "pointer", color: "white" }}
                >
                  <Delete /> Delete
                </a>
              </>
            )}
          </CardActions>
        )}
      </Card>
    </div>
  );
};

export default Comment;
