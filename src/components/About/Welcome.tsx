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
import Messages from "../../utils/messages";
import { Common } from "../../constants";
import { redeemedInviteToken } from "../../utils/invite";

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
  isLoggedIn?: boolean;
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
    localStorage.setItem(Common.LocalStorage.WelcomeCardClosed, "true");
  };

  const alreadyClosed = (): boolean => {
    return (
      typeof localStorage !== "undefined" &&
      !!localStorage.getItem(Common.LocalStorage.WelcomeCardClosed)
    );
  };

  if (isLoggedIn || alreadyClosed() || closed) return <></>;

  return (
    <Card className={classes.root + " " + styles.card}>
      <CardHeader
        title={Messages.about.welcomeCard.welcome()}
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
          {Messages.about.welcomeCard.about()}
        </Typography>

        <Typography
          style={{
            color: "rgb(190, 190, 190)",
            fontFamily: "Inter",
          }}
        >
          {Messages.about.welcomeCard.inDev()}
        </Typography>
      </CardContent>

      {redeemedInviteToken() && (
        <CardActions style={{ marginTop: "6px" }}>
          <Link href={"/users/signup"}>
            <a>
              <Button style={{ color: "white" }}>sign up</Button>
            </a>
          </Link>
        </CardActions>
      )}
    </Card>
  );
};

export default WelcomeCard;
