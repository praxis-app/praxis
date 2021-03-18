import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { AccountCircle, Edit, Delete } from "@material-ui/icons";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardActions,
  Typography,
  makeStyles,
} from "@material-ui/core";

import ImagesList from "../Images/List";
import { IMAGES_BY_POST_ID, USER } from "../../apollo/client/queries";

const useStyles = makeStyles({
  root: {
    maxWidth: 300,
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
  },
});

const Post = ({ post: { id, userId, body }, deletePost }) => {
  const [user, setUser] = useState(null);
  const [images, setImages] = useState(null);
  const imagesRes = useQuery(IMAGES_BY_POST_ID, {
    variables: { postId: id },
  });
  const userRes = useQuery(USER, {
    variables: { id: userId },
  });
  const classes = useStyles();
  const router = useRouter();

  useEffect(() => {
    setUser(userRes.data ? userRes.data.user : userRes.data);
  }, [userRes.data]);

  useEffect(() => {
    setImages(imagesRes.data ? imagesRes.data.imagesByPostId : imagesRes.data);
  }, [imagesRes.data]);

  return (
    <div key={id}>
      <Card className={classes.root} variant="outlined">
        <CardContent>
          <Typography
            className={classes.title}
            color="textSecondary"
            gutterBottom
          >
            <Link href={`/users/${user?.name}`}>
              <a>
                <AccountCircle /> {user?.name}
              </a>
            </Link>
          </Typography>

          <Typography variant="body1" component="p">
            {body}
          </Typography>

          <ImagesList images={images} />
        </CardContent>
        <CardActions>
          <Link href={`/posts/edit/${id}`}>
            <a>
              <Edit /> Edit
            </a>
          </Link>

          <Link href={router.asPath}>
            <a
              onClick={() =>
                window.confirm("Are you sure you want to delete this post?") &&
                deletePost(id)
              }
            >
              <Delete /> Delete
            </a>
          </Link>
        </CardActions>
      </Card>
    </div>
  );
};

export default Post;
