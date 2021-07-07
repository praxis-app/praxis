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

import Messages from "../../utils/messages";
import { Common } from "../../constants";
import { redeemedInviteToken } from "../../utils/invite";

const useStyles = makeStyles({
  title: {
    color: "white",
  },
});

interface Props {
  isLoggedIn?: boolean;
}

const WelcomeCard = ({ isLoggedIn }: Props) => {
  const [closed, setClosed] = useState<boolean>(false);
  const [inviteToken, setInviteToken] = useState<string | null>();
  const classes = useStyles();

  useEffect(() => {
    if (alreadyClosed()) {
      setClosed(true);
    }
    setInviteToken(redeemedInviteToken());
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
    <Card>
      <CardHeader
        title={Messages.about.welcomeCard.welcome()}
        action={
          <IconButton onClick={() => onClose()}>
            <Close color="primary" fontSize="small" />
          </IconButton>
        }
        classes={{ title: classes.title }}
      />

      <CardContent>
        <Typography gutterBottom>
          {Messages.about.welcomeCard.about()}
        </Typography>

        <Typography>{Messages.about.welcomeCard.inDev()}</Typography>
      </CardContent>

      {inviteToken && (
        <CardActions style={{ marginTop: "6px" }}>
          <Link href={"/users/signup"}>
            <a>
              <Button color="primary">sign up</Button>
            </a>
          </Link>
        </CardActions>
      )}
    </Card>
  );
};

export default WelcomeCard;
