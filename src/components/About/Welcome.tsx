import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  IconButton,
  Typography,
  makeStyles,
  CardHeader,
  CardActions,
  Button,
} from "@material-ui/core";
import { Close } from "@material-ui/icons";

import styles from "../../styles/Welcome/Welcome.module.scss";

const useStyles = makeStyles({
  root: {
    backgroundColor: "rgb(65, 65, 65)",
  },
  title: {
    fontFamily: "Inter",
    color: "white",
  },
});

interface Props {
  isLoggedIn: boolean;
}

const WelcomeCard = ({ isLoggedIn }: Props) => {
  const [closed, setClosed] = useState<boolean>(false);
  const classes = useStyles();

  useEffect(() => {
    if (alreadyClosed()) {
      setClosed(true);
    }
  }, []);

  const onClose = () => {
    setClosed(true);
    localStorage.setItem("welcomeCardClosed", "true");
  };

  const alreadyClosed = (): boolean => {
    return (
      typeof localStorage !== "undefined" &&
      !!localStorage.getItem("welcomeCardClosed")
    );
  };

  if (isLoggedIn || alreadyClosed() || closed) return <></>;

  return (
    <Card className={classes.root + " " + styles.card}>
      <CardHeader
        title={"Welcome to Praxis"}
        action={
          <IconButton onClick={() => onClose()}>
            <Close style={{ color: "white" }} fontSize="small" />
          </IconButton>
        }
        classes={{ title: classes.title }}
      />

      <CardContent>
        <Typography
          style={{
            color: "rgb(190, 190, 190)",
            fontFamily: "Inter",
            marginBottom: "12px",
          }}
        >
          Praxis is an open source social networking site. Groups are the main
          focus and come with a wide variety of voting features. Create a group
          and set it to no-admin, allowing group members to create motions and
          democratically decide on settings, name, theme, and more.
        </Typography>

        <Typography
          style={{
            color: "rgb(190, 190, 190)",
            fontFamily: "Inter",
          }}
        >
          This project is still in development.
        </Typography>
      </CardContent>

      <CardActions style={{ marginTop: "6px" }}>
        <Link href={"/users/signup"}>
          <a>
            <Button style={{ color: "white" }}>sign up</Button>
          </a>
        </Link>
      </CardActions>
    </Card>
  );
};

export default WelcomeCard;
