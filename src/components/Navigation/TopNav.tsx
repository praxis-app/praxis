import Link from "next/link";
import { useRouter } from "next/router";
import { Search } from "@material-ui/icons";
import { IconButton } from "@material-ui/core";
import clsx from "clsx";

import styles from "../../styles/Navigation/TopNav.module.scss";
import { useScrollDirection, useScrollPosition } from "../../hooks";
import {
  NavigationPaths,
  ScrollDirections,
  ToastStatus,
} from "../../constants/common";
import { toastVar } from "../../apollo/client/localState";
import Messages from "../../utils/messages";

const SCROLL_POSITION_THRESHOLD = 30;

const TopNav = () => {
  const scrollDir = useScrollDirection();
  const scrollPosition = useScrollPosition();
  const router = useRouter();

  return (
    <div
      className={clsx(styles.topNav, {
        [styles.topNavOpen]:
          scrollDir === ScrollDirections.Up ||
          scrollPosition <= SCROLL_POSITION_THRESHOLD,
      })}
    >
      <div className={styles.brand}>
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

      <IconButton
        onClick={() =>
          toastVar({
            title: Messages.development.notImplemented(),
            status: ToastStatus.Info,
          })
        }
        style={{ marginRight: 27.5 }}
      >
        <Search color="primary" />
      </IconButton>
    </div>
  );
};

export default TopNav;
