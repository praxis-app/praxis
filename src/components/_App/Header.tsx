import Link from "next/link";
import { useEffect, useState } from "react";
import Router, { useRouter } from "next/router";
import jwtDecode from "jwt-decode";
import { useMutation, useReactiveVar } from "@apollo/client";
import MenuIcon from "@material-ui/icons/Menu";

import Messages from "../../utils/messages";
import { setAuthToken } from "../../utils/auth";
import { LOGOUT_USER, SET_CURRENT_USER } from "../../apollo/client/mutations";

import classNames from "classnames/bind";
import {
  useCurrentUser,
  useHasPermissionGlobally,
  useWindowSize,
} from "../../hooks";
import { Roles } from "../../constants";
import styles from "../../styles/Common/Header.module.scss";
import { headerKeyVar } from "../../apollo/client/localState";

const cx = classNames.bind(styles);

const Header = () => {
  const router = useRouter();
  const windowSize = useWindowSize();
  const [open, setOpen] = useState(false);
  const [logoutUser] = useMutation(LOGOUT_USER);
  const [setCurrentUser] = useMutation(SET_CURRENT_USER);
  const currentUser = useCurrentUser();
  const refreshKey = useReactiveVar(headerKeyVar);
  const [canManageRoles] = useHasPermissionGlobally(
    Roles.Permissions.ManageRoles,
    refreshKey
  );
  const [canManageUsers] = useHasPermissionGlobally(
    Roles.Permissions.ManageUsers,
    refreshKey
  );

  useEffect(() => {
    if (localStorage.jwtToken) {
      setAuthToken(localStorage.jwtToken);
      const decoded: User = jwtDecode(localStorage.jwtToken);
      setCurrentUserMutate(decoded);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        logoutUserMutate();
      }
    }
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [router.asPath, windowSize]);

  const setCurrentUserMutate = async (user: User) => {
    await setCurrentUser({
      variables: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  };

  const logoutUserMutate = async () => {
    await logoutUser();
    Router.push("/users/login");
  };

  return (
    <>
      <nav className={styles.navbar} key={refreshKey}>
        <div className={styles.navbarBrand}>
          {router.asPath === "/" ? (
            <span onClick={() => router.reload()} role="button" tabIndex={0}>
              {Messages.brand()}
            </span>
          ) : (
            <Link href="/" passHref>
              {Messages.brand()}
            </Link>
          )}
        </div>
        <div
          className={cx(styles.navbarItems, {
            navbarItemsShow: open,
          })}
        >
          {canManageUsers && (
            <div className={styles.navbarItem}>
              <Link href="/users" passHref>
                <a className={styles.navbarItemText}>
                  {Messages.navigation.users()}
                </a>
              </Link>
            </div>
          )}

          <div className={styles.navbarItem}>
            <Link href="/groups" passHref>
              <a className={styles.navbarItemText}>
                {Messages.navigation.groups()}
              </a>
            </Link>
          </div>

          {canManageRoles && (
            <div className={styles.navbarItem}>
              <Link href="/roles" passHref>
                <a className={styles.navbarItemText}>
                  {Messages.navigation.roles()}
                </a>
              </Link>
            </div>
          )}

          {currentUser ? (
            <>
              <div className={styles.navbarItem}>
                <Link href={`/users/${currentUser.name}`} passHref>
                  <a className={styles.navbarItemText}>{currentUser.name}</a>
                </Link>
              </div>
              <div className={styles.navbarItem}>
                <div
                  onClick={() =>
                    window.confirm(Messages.prompts.logOut()) &&
                    logoutUserMutate()
                  }
                  role="button"
                  tabIndex={0}
                >
                  <a className={styles.navbarItemText}>
                    {Messages.users.actions.logOut()}
                  </a>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.navbarItem}>
                <Link href="/users/login" passHref>
                  <a className={styles.navbarItemText}>
                    {Messages.users.actions.logIn()}
                  </a>
                </Link>
              </div>
              <div className={styles.navbarItem}>
                <Link href="/users/signup" passHref>
                  <a className={styles.navbarItemText}>
                    {Messages.users.actions.signUp()}
                  </a>
                </Link>
              </div>
            </>
          )}
        </div>
      </nav>

      <MenuIcon className={styles.menuButton} />
      <div
        className={styles.menuButtonTouchTarget}
        onClick={() => setOpen(!open)}
        role="button"
        tabIndex={-1}
      ></div>
    </>
  );
};

export default Header;
