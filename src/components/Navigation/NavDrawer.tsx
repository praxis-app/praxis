import { useEffect, useState } from "react";
import Link from "next/link";
import Router from "next/router";
import { useMutation, useReactiveVar } from "@apollo/client";
import {
  createStyles,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  IconButton,
  withStyles,
  ListItemText as MUIListItemText,
} from "@material-ui/core";
import {
  Link as LinkIcon,
  SupervisedUserCircle,
  AccountBox,
  ExitToApp,
  PersonAdd,
  Close,
} from "@material-ui/icons";

import {
  modalOpenVar,
  navKeyVar,
  navOpenVar,
} from "../../apollo/client/localState";
import { NavigationPaths, ResourcePaths } from "../../constants/common";
import { WHITE } from "../../styles/Shared/theme";
import Messages from "../../utils/messages";
import {
  useCurrentUser,
  useHasPermissionGlobally,
  useUserById,
  useWindowSize,
} from "../../hooks";
import { GlobalPermissions } from "../../constants/role";
import { LOGOUT_USER } from "../../apollo/client/mutations";
import { redeemedInviteToken } from "../../utils/clientIndex";
import styles from "../../styles/Shared/Shared.module.scss";
import MotionButton from "../Motions/MotionButton";
import UserAvatar from "../Users/Avatar";

const ListItemText = withStyles(() =>
  createStyles({
    primary: {
      color: WHITE,
    },
  })
)(MUIListItemText);

const NavDrawer = () => {
  const currentUser = useCurrentUser();
  const [user] = useUserById(currentUser?.id);
  const open = useReactiveVar(navOpenVar);
  const refreshKey = useReactiveVar(navKeyVar);
  const openModal = useReactiveVar(modalOpenVar);
  const [inviteToken, setInviteToken] = useState<string | null>();
  const [canManageRoles] = useHasPermissionGlobally(
    GlobalPermissions.ManageRoles,
    refreshKey
  );
  const [canManageUsers] = useHasPermissionGlobally(
    GlobalPermissions.ManageUsers,
    refreshKey
  );
  const [canManageInvites] = useHasPermissionGlobally(
    GlobalPermissions.ManageInvites,
    refreshKey
  );
  const [canCreateInvites] = useHasPermissionGlobally(
    GlobalPermissions.CreateInvites,
    refreshKey
  );
  const [logoutUser] = useMutation(LOGOUT_USER);
  const windowSize = useWindowSize();

  useEffect(() => {
    setInviteToken(redeemedInviteToken());
  }, []);

  useEffect(() => {
    handleCose();
  }, [windowSize, openModal]);

  const handleCose = () => {
    navOpenVar(false);
  };

  const logoutUserMutate = async () => {
    await logoutUser();
    Router.push(NavigationPaths.LogIn);
  };

  return (
    <Drawer anchor="right" open={open} onClose={handleCose}>
      <div className={styles.flexEnd}>
        <IconButton onClick={handleCose}>
          <Close color="primary" />
        </IconButton>
      </div>

      <Divider style={{ marginTop: 0 }} />

      <List style={{ width: "50vw" }} onClick={handleCose}>
        {currentUser && user && (
          <Link href={`${ResourcePaths.User}${user.name}`}>
            <a>
              <ListItem button>
                <ListItemIcon>
                  <UserAvatar user={user} small />
                </ListItemIcon>
                <ListItemText primary={user.name} />
              </ListItem>
            </a>
          </Link>
        )}

        {canManageRoles && (
          <Link href={NavigationPaths.Roles}>
            <a>
              <ListItem button>
                <ListItemIcon>
                  <AccountBox color="primary" />
                </ListItemIcon>
                <ListItemText primary={Messages.navigation.roles()} />
              </ListItem>
            </a>
          </Link>
        )}

        {canManageUsers && (
          <Link href={NavigationPaths.Users}>
            <a>
              <ListItem button>
                <ListItemIcon>
                  <SupervisedUserCircle color="primary" />
                </ListItemIcon>
                <ListItemText primary={Messages.navigation.users()} />
              </ListItem>
            </a>
          </Link>
        )}

        {(canManageInvites || canCreateInvites) && (
          <Link href={NavigationPaths.Invites}>
            <a>
              <ListItem button>
                <ListItemIcon>
                  <LinkIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={Messages.navigation.invites()} />
              </ListItem>
            </a>
          </Link>
        )}

        {currentUser && (
          <ListItem
            button
            onClick={() =>
              window.confirm(Messages.prompts.logOut()) && logoutUserMutate()
            }
          >
            <ListItemIcon>
              <ExitToApp color="primary" />
            </ListItemIcon>
            <ListItemText primary={Messages.users.actions.logOut()} />
          </ListItem>
        )}

        {!currentUser && (
          <Link href={NavigationPaths.LogIn}>
            <a>
              <ListItem button>
                <ListItemIcon>
                  <ExitToApp color="primary" />
                </ListItemIcon>
                <ListItemText primary={Messages.users.actions.logIn()} />
              </ListItem>
            </a>
          </Link>
        )}

        {!currentUser && inviteToken && (
          <Link href={NavigationPaths.SignUp}>
            <a>
              <ListItem button>
                <ListItemIcon>
                  <PersonAdd color="primary" />
                </ListItemIcon>
                <ListItemText primary={Messages.users.actions.signUp()} />
              </ListItem>
            </a>
          </Link>
        )}

        {currentUser && <Divider style={{ marginBottom: 6 }} />}
      </List>

      {currentUser && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <MotionButton />
        </div>
      )}
    </Drawer>
  );
};

export default NavDrawer;
