import { useEffect, useState } from "react";
import { useRouter } from "next/router";
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
} from "@material-ui/core";

import { isLoggedIn } from "../../utils/auth";
import ImagesList from "../Images/List";
import {
  USER,
  CURRENT_USER,
  IMAGES_BY_POST_ID,
} from "../../apollo/client/queries";
import LikeButton from "../Likes/LikeButton";
import UserAvatar from "../Users/Avatar";

import styles from "../../styles/Post/Post.module.scss";

const useStyles = makeStyles({
  root: {
    backgroundColor: "rgb(65, 65, 65)",
  },
  title: {
    fontFamily: "Inter",
  },
});

interface Props {
  post: Post;
  deletePost: (id: string) => void;
}

const Post = ({ post: { id, userId, body }, deletePost }: Props) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const [user, setUser] = useState<User>();
  const [images, setImages] = useState([]);
  const currentUserRes = useQuery(CURRENT_USER);
  const userRes = useQuery(USER, {
    variables: { id: userId },
  });
  const imagesRes = useQuery(IMAGES_BY_POST_ID, {
    variables: { postId: id },
    fetchPolicy: "no-cache",
  });
  const classes = useStyles();
  const router = useRouter();

  useEffect(() => {
    if (currentUserRes.data) setCurrentUser(currentUserRes.data.user);
  }, [currentUserRes.data]);

  useEffect(() => {
    if (userRes.data) setUser(userRes.data.user);
  }, [userRes.data]);

  useEffect(() => {
    if (imagesRes.data) setImages(imagesRes.data.imagesByPostId);
  }, [imagesRes.data]);

  const ownPost = (): boolean => {
    if (currentUser && user && currentUser.id === user.id) return true;
    return false;
  };

  return (
    <div key={id}>
      <Card className={classes.root + " " + styles.card}>
        <CardHeader
          avatar={
            <Link href={`/users/${user?.name}`}>
              <a>{user && <UserAvatar user={user} />}</a>
            </Link>
          }
          title={
            <Link href={`/users/${user?.name}`}>
              <a>{user?.name}</a>
            </Link>
          }
          classes={{ title: classes.title }}
        />

        {body && (
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
        )}

        <CardMedia>
          <ImagesList images={images} />
        </CardMedia>

        {isLoggedIn() && currentUser && (
          <CardActions style={{ marginTop: "6px" }}>
            <LikeButton postId={id} />

            {ownPost() && (
              <>
                <Link href={`/posts/${id}/edit`}>
                  <a>
                    <Edit /> Edit
                  </a>
                </Link>

                <Link href={router.asPath}>
                  <a
                    onClick={() =>
                      window.confirm(
                        "Are you sure you want to delete this post?"
                      ) && deletePost(id)
                    }
                  >
                    <Delete /> Delete
                  </a>
                </Link>
              </>
            )}
          </CardActions>
        )}
      </Card>
    </div>
  );
};

export default Post;
