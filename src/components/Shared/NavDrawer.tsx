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
  AccountBox,
  SupervisorAccount,
  Close,
  ExitToApp,
  PersonAdd,
} from "@material-ui/icons";

import { navKeyVar, navOpenVar } from "../../apollo/client/localState";
import { NavigationPaths } from "../../constants/common";
import { WHITE } from "../../styles/Shared/theme";
import Messages from "../../utils/messages";
import {
  useCurrentUser,
  useHasPermissionGlobally,
  useWindowSize,
} from "../../hooks";
import { Permissions } from "../../constants/role";
import { LOGOUT_USER } from "../../apollo/client/mutations";
import { redeemedInviteToken } from "../../utils/clientIndex";

const ListItemText = withStyles(() =>
  createStyles({
    primary: {
      color: WHITE,
    },
  })
)(MUIListItemText);

const NavDrawer = () => {
  const currentUser = useCurrentUser();
  const open = useReactiveVar(navOpenVar);
  const refreshKey = useReactiveVar(navKeyVar);
  const [inviteToken, setInviteToken] = useState<string | null>();
  const [canManageRoles] = useHasPermissionGlobally(
    Permissions.ManageRoles,
    refreshKey
  );
  const [canManageUsers] = useHasPermissionGlobally(
    Permissions.ManageUsers,
    refreshKey
  );
  const [canManageInvites] = useHasPermissionGlobally(
    Permissions.ManageInvites,
    refreshKey
  );
  const [canCreateInvites] = useHasPermissionGlobally(
    Permissions.CreateInvites,
    refreshKey
  );
  const [logoutUser] = useMutation(LOGOUT_USER);
  const windowSize = useWindowSize();

  useEffect(() => {
    navOpenVar(false);
  }, [windowSize]);

  useEffect(() => {
    setInviteToken(redeemedInviteToken());
  }, []);

  const handleCose = () => {
    navOpenVar(false);
  };

  const logoutUserMutate = async () => {
    await logoutUser();
    Router.push("/users/login");
  };

  return (
    <Drawer anchor="right" open={open} onClose={handleCose}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <IconButton onClick={handleCose}>
          <Close color="primary" />
        </IconButton>
      </div>

      <Divider style={{ marginTop: 0 }} />

      <List style={{ width: "50vw" }} onClick={handleCose}>
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
                  <SupervisorAccount color="primary" />
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
      </List>
    </Drawer>
  );
};

export default NavDrawer;
