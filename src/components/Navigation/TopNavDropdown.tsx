import Router from "next/router";
import { useMutation } from "@apollo/client";
import { Menu, MenuItem } from "@material-ui/core";
import { ExitToApp, Settings } from "@material-ui/icons";
import { LOGOUT_USER } from "../../apollo/client/mutations";
import Messages from "../../utils/messages";
import { toastVar } from "../../apollo/client/localState";
import { ToastStatus } from "../../constants/common";

interface Props {
  anchorEl: null | HTMLElement;
  handleClose: () => void;
}

const TopNavDropdown = ({ anchorEl, handleClose }: Props) => {
  const [logoutUser] = useMutation(LOGOUT_USER);

  const logoutUserMutate = async () => {
    handleClose();
    await logoutUser();
    Router.push("/users/login");
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
    >
      <div>
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
      </div>
    </Menu>
  );
};

export default TopNavDropdown;
