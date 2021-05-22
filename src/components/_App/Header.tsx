import Link from "next/link";
import { useEffect, useState } from "react";
import Router, { useRouter } from "next/router";
import jwtDecode from "jwt-decode";
import { useQuery, useMutation } from "@apollo/client";
import MenuIcon from "@material-ui/icons/Menu";

import Messages from "../../utils/messages";
import { setAuthToken } from "../../utils/auth";
import { CURRENT_USER } from "../../apollo/client/queries";
import { LOGOUT_USER, SET_CURRENT_USER } from "../../apollo/client/mutations";

import styles from "../../styles/App/Header.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(styles);

const Header = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data } = useQuery(CURRENT_USER);
  const [logoutUser] = useMutation(LOGOUT_USER);
  const [setCurrentUser] = useMutation(SET_CURRENT_USER);

  useEffect(() => {
    setOpen(false);
  }, [router.asPath]);

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
  }, [setCurrentUser]);

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
      <nav className={styles.navbar}>
        <div className={styles.navbarBrand}>
          {router.asPath === "/" ? (
            <span onClick={() => router.reload()}>{Messages.brand()}</span>
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
          <div className={styles.navbarItem}>
            <Link href="/users" passHref>
              <a className={styles.navbarItemText}>
                {Messages.navigation.users()}
              </a>
            </Link>
          </div>

          <div className={styles.navbarItem}>
            <Link href="/groups" passHref>
              <a className={styles.navbarItemText}>
                {Messages.navigation.groups()}
              </a>
            </Link>
          </div>

          {data && data.user.isAuthenticated ? (
            <>
              <div className={styles.navbarItem}>
                <Link href={`/users/${data.user.name}`} passHref>
                  <a className={styles.navbarItemText}>{data.user.name}</a>
                </Link>
              </div>
              <div className={styles.navbarItem}>
                <div
                  onClick={() =>
                    window.confirm(Messages.prompts.logOut()) &&
                    logoutUserMutate()
                  }
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
      ></div>
    </>
  );
};

export default Header;
