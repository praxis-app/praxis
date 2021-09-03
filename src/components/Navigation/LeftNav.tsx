import { useState } from "react";
import Link from "next/link";
import { useReactiveVar } from "@apollo/client";
import {
  List,
  ListItem as MUIListItem,
  withStyles,
  createStyles,
  ListItemIcon,
  ListItemText as MUIListItemText,
  Button as MUIButton,
  makeStyles,
} from "@material-ui/core";
import {
  SupervisedUserCircle,
  Link as LinkIcon,
  AccountBox,
  Group,
  Home,
} from "@material-ui/icons";

import { navKeyVar } from "../../apollo/client/localState";
import { NavigationPaths } from "../../constants/common";
import { BLURPLE_BUTTON_COLORS, WHITE } from "../../styles/Shared/theme";
import Messages from "../../utils/messages";
import { useCurrentUser, useHasPermissionGlobally } from "../../hooks";
import { Permissions } from "../../constants/role";
import styles from "../../styles/Navigation/LeftNav.module.scss";
import MotionFormModal from "../Motions/FormModal";
import { useRouter } from "next/router";

const ListItem = withStyles(() =>
  createStyles({
    root: {
      borderRadius: 9999,
    },
  })
)(MUIListItem);

const ListItemText = withStyles(() =>
  createStyles({
    primary: {
      color: WHITE,
      fontSize: 20,
    },
  })
)(MUIListItemText);

const Button = withStyles(() =>
  createStyles({
    root: {
      width: 160,
      height: 50,
      fontFamily: "Inter Bold",
      fontSize: 18,
      letterSpacing: "0.2px",
      textTransform: "none",
      marginTop: 10,

      ...BLURPLE_BUTTON_COLORS,
    },
  })
)(MUIButton);

const useStyles = makeStyles({
  bold: {
    fontFamily: "Inter Bold",
  },
});

const LeftNav = () => {
  const currentUser = useCurrentUser();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const refreshKey = useReactiveVar(navKeyVar);
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
  const { asPath: currentPath } = useRouter();
  const classes = useStyles();

  const makeBold = (path: NavigationPaths): { primary: string } => {
    return {
      primary: currentPath === path ? classes.bold : "",
    };
  };

  return (
    <div className={styles.leftNav}>
      <List>
        <Link href={NavigationPaths.Home}>
          <a>
            <ListItem button>
              <ListItemIcon>
                <Home color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={Messages.navigation.home()}
                classes={makeBold(NavigationPaths.Home)}
              />
            </ListItem>
          </a>
        </Link>

        <Link href={NavigationPaths.Groups}>
          <a>
            <ListItem button>
              <ListItemIcon>
                <Group color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={Messages.navigation.groups()}
                classes={makeBold(NavigationPaths.Groups)}
              />
            </ListItem>
          </a>
        </Link>

        {canManageRoles && (
          <Link href={NavigationPaths.Roles}>
            <a>
              <ListItem button>
                <ListItemIcon>
                  <AccountBox color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={Messages.navigation.roles()}
                  classes={makeBold(NavigationPaths.Roles)}
                />
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
                <ListItemText
                  primary={Messages.navigation.users()}
                  classes={makeBold(NavigationPaths.Users)}
                />
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
                <ListItemText
                  primary={Messages.navigation.invites()}
                  classes={makeBold(NavigationPaths.Invites)}
                />
              </ListItem>
            </a>
          </Link>
        )}
      </List>

      {currentUser && (
        <>
          <Button
            onClick={() => setModalOpen(true)}
            variant="contained"
            color="primary"
          >
            {Messages.motions.actions.motion()}
          </Button>

          <MotionFormModal
            open={modalOpen}
            setOpen={setModalOpen}
            userId={currentUser.id}
          />
        </>
      )}
    </div>
  );
};

export default LeftNav;
