import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { AccountCircle, Edit, Delete } from "@material-ui/icons";

const useStyles = makeStyles({
  root: {
    maxWidth: 300,
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
  },
});

const Show = ({ user, deleteUser }) => {
  const { name, email, id, createdAt } = user;
  const date = new Date(parseInt(createdAt)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const classes = useStyles();

  return (
    <Card className={classes.root} variant="outlined">
      <CardContent>
        <Typography
          className={classes.title}
          color="textSecondary"
          gutterBottom
        >
          <Link href={`/users/${name}`}>
            <a>
              <AccountCircle /> {name}
            </a>
          </Link>
        </Typography>
        <Typography variant="body2" component="p">
          Joined {date}
        </Typography>
        <Typography variant="body2" component="p">
          {email}
        </Typography>
      </CardContent>
      <CardActions>
        <Link href={`/users/edit/${name}`}>
          <a>
            <Edit /> Edit
          </a>
        </Link>

        <Link href="/users">
          <a
            onClick={() =>
              window.confirm("Are you sure you want to delete this user?") &&
              deleteUser(id)
            }
          >
            <Delete /> Delete
          </a>
        </Link>
      </CardActions>
    </Card>
  );
};

export default Show;
