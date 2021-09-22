import Router from "next/router";
import Link from "next/link";
import { useMutation } from "@apollo/client";
import { Menu, MenuItem } from "@material-ui/core";
import { ExitToApp, Person, Settings } from "@material-ui/icons";

import { LOGOUT_USER } from "../../apollo/client/mutations";
import Messages from "../../utils/messages";
import { toastVar } from "../../apollo/client/localState";
import {
  NavigationPaths,
  ResourcePaths,
  ToastStatus,
} from "../../constants/common";
import { useCurrentUser } from "../../hooks";

interface Props {
  anchorEl: null | HTMLElement;
  handleClose: () => void;
}

const TopNavDropdown = ({ anchorEl, handleClose }: Props) => {
  const [logoutUser] = useMutation(LOGOUT_USER);
  const currentUser = useCurrentUser();

  const logoutUserMutate = async () => {
    handleClose();
    await logoutUser();
    Router.push(NavigationPaths.LogIn);
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleClose}
      keepMounted
      getContentAnchorEl={null}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "center" }}
      onClick={() => handleClose()}
    >
      <div>
        <Link
          href={`${ResourcePaths.User}${currentUser?.name}${NavigationPaths.Edit}`}
        >
          <a>
            <MenuItem>
              <Person
                color="primary"
                style={{
                  marginRight: 7.5,
                }}
                fontSize="small"
              />
              {Messages.users.actions.editProfile()}
            </MenuItem>
          </a>
        </Link>

        <MenuItem
          onClick={() => {
            toastVar({
              title: Messages.development.notImplemented(),
              status: ToastStatus.Info,
            });
          }}
        >
          <Settings
            color="primary"
            style={{
              marginRight: 7.5,
            }}
            fontSize="small"
          />
          {Messages.navigation.preferences()}
        </MenuItem>

        <MenuItem
          onClick={() =>
            window.confirm(Messages.prompts.logOut()) && logoutUserMutate()
          }
        >
          <ExitToApp
            color="primary"
            style={{
              marginRight: 7.5,
            }}
            fontSize="small"
          />
          {Messages.users.actions.logOut()}
        </MenuItem>
      </div>
    </Menu>
  );
};

export default TopNavDropdown;
