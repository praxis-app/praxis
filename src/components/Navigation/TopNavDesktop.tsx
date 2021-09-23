import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowDropDown } from "@material-ui/icons";
import {
  AppBar,
  Toolbar,
  makeStyles,
  createStyles,
  IconButton,
  Button,
  Typography,
} from "@material-ui/core";

import Messages from "../../utils/messages";
import { useCurrentUser, useUserById } from "../../hooks";
import styles from "../../styles/Navigation/TopNavDesktop.module.scss";
import { NavigationPaths, ResourcePaths } from "../../constants/common";
import UserAvatar from "../Users/Avatar";
import TopNavDropdown from "./TopNavDropdown";
import SearchBar from "../Shared/SearchBar";
import { redeemedInviteToken } from "../../utils/clientIndex";

const useStyles = makeStyles(() =>
  createStyles({
    toolbar: {
      minHeight: 60,
    },
  })
);

const TopNavDesktop = () => {
  const currentUser = useCurrentUser();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [inviteToken, setInviteToken] = useState<string | null>();
  const [user] = useUserById(currentUser?.id);
  const classes = useStyles();
  const router = useRouter();

  useEffect(() => {
    setInviteToken(redeemedInviteToken());
  }, []);

  const handleMenuButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setMenuAnchorEl(null);
  };

  return (
    <AppBar style={{ boxShadow: "none" }}>
      <Toolbar classes={{ root: classes.toolbar }}>
        <div className={styles.appBarBrand}>
          {router.asPath === NavigationPaths.Home ? (
            <span onClick={() => router.reload()} role="button" tabIndex={0}>
              {Messages.brand()}
            </span>
          ) : (
            <Link href={NavigationPaths.Home} passHref>
              {Messages.brand()}
            </Link>
          )}
        </div>

        <SearchBar />

        <div className={styles.appBarButtons}>
          {currentUser && user && (
            <Link href={`${ResourcePaths.User}${user.name}`} passHref>
              <Button color="primary" style={{ textTransform: "none" }}>
                <UserAvatar user={user} small withoutLink />
                <Typography color="primary" style={{ marginLeft: 12 }}>
                  {user.name}
                </Typography>
              </Button>
            </Link>
          )}

          {!currentUser && (
            <Link href={NavigationPaths.LogIn}>
              <a>
                <Button color="primary">
                  {Messages.users.actions.logIn()}
                </Button>
              </a>
            </Link>
          )}

          {!currentUser && inviteToken && (
            <Link href={NavigationPaths.SignUp}>
              <a>
                <Button color="primary">
                  {Messages.users.actions.signUp()}
                </Button>
              </a>
            </Link>
          )}

          {currentUser && (
            <>
              <IconButton onClick={handleMenuButtonClick}>
                <ArrowDropDown color="primary" />
              </IconButton>

              <TopNavDropdown
                anchorEl={menuAnchorEl}
                handleClose={handleClose}
              />
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavDesktop;
