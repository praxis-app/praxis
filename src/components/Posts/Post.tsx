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
  Avatar,
} from "@material-ui/core";

import ImagesList from "../Images/List";
import {
  IMAGES_BY_POST_ID,
  USER,
  CURRENT_USER,
} from "../../apollo/client/queries";
import LikeButton from "../Likes/LikeButton";

const useStyles = makeStyles({
  root: {
    maxWidth: 330,
    marginBottom: 12,
    backgroundColor: "rgb(65, 65, 65)",
  },
  title: {
    fontFamily: "Inter",
  },
});

const Post = ({ post: { id, userId, body }, deletePost }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [user, setUser] = useState(null);
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
    setCurrentUser(currentUserRes.data ? currentUserRes.data.user : null);
  }, [currentUserRes.data]);

  useEffect(() => {
    setUser(userRes.data ? userRes.data.user : null);
  }, [userRes.data]);

  useEffect(() => {
    setImages(imagesRes.data ? imagesRes.data.imagesByPostId : []);
  }, [imagesRes.data]);

  const ownPost = (): boolean => {
    if (currentUserRes.data && user && currentUserRes.data.user.id == user.id)
      return true;
    return false;
  };

  return (
    <div key={id}>
      <Card className={classes.root}>
        <CardHeader
          avatar={
            <Link href={`/users/${user?.name}`}>
              <a>
                <Avatar style={{ backgroundColor: "white", color: "black" }}>
                  {user?.name[0].charAt(0).toUpperCase()}
                </Avatar>
              </a>
            </Link>
          }
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

        {currentUser && (
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
