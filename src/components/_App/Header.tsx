import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import jwtDecode from "jwt-decode";
import { useQuery, useMutation } from "@apollo/client";
import MenuIcon from "@material-ui/icons/Menu";

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
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navbarBrand}>
          {router.asPath === "/" ? (
            <span onClick={() => router.reload()}>praxis</span>
          ) : (
            <Link href="/" passHref>
              praxis
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
              <a className={styles.navbarItemText}>Users</a>
            </Link>
          </div>

          <div className={styles.navbarItem}>
            <Link href="/groups" passHref>
              <a className={styles.navbarItemText}>Groups</a>
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
                <Link href="/users/login" passHref>
                  <a
                    onClick={() =>
                      window.confirm("Are you sure you want to log out?") &&
                      logoutUserMutate()
                    }
                  >
                    <div className={styles.navbarItemText}>Log out</div>
                  </a>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className={styles.navbarItem}>
                <Link href="/users/login" passHref>
                  <a className={styles.navbarItemText}>Log in</a>
                </Link>
              </div>
              <div className={styles.navbarItem}>
                <Link href="/users/signup" passHref>
                  <a className={styles.navbarItemText}>Sign up</a>
                </Link>
              </div>
            </>
          )}
        </div>
      </nav>

      <MenuIcon className={styles.menuButton} />
      <div
        className={styles.menuButtonTouchTarget}
        onClick={() => {
          setOpen(!open);
          window.navigator.vibrate(1);
        }}
      ></div>
    </>
  );
};

export default Header;
