import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { Avatar, createStyles, makeStyles, Theme } from "@material-ui/core";
import Link from "next/link";

import baseUrl from "../../utils/baseUrl";
import { CURRENT_PROFILE_PICTURE } from "../../apollo/client/queries";
import Messages from "../../utils/messages";
import styles from "../../styles/User/User.module.scss";
import { noCache } from "../../utils/apollo";
import { Common } from "../../constants";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      [theme.breakpoints.down(Common.DESKTOP_BREAKPOINT)]: {
        width: 25,
        height: 25,
      },
    },
  })
);

interface Props {
  user: User;
  responsive?: boolean;
}

const UserAvatar = ({ user, responsive }: Props) => {
  const [profilePicture, setProfilePicture] = useState<Image>();
  const profilePictureRes = useQuery(CURRENT_PROFILE_PICTURE, {
    variables: { userId: user.id },
    ...noCache,
  });
  const classes = useStyles();

  useEffect(() => {
    if (profilePictureRes.data)
      setProfilePicture(profilePictureRes.data.currentProfilePicture);
  }, [profilePictureRes.data]);

  return (
    <Link href={`/users/${user.name}`}>
      <a>
        <Avatar
          style={{
            color: "black",
            backgroundColor: profilePicture ? "black" : "white",
          }}
          classes={responsive ? { root: classes.root } : {}}
          src={baseUrl + profilePicture?.path}
          alt={Messages.images.couldNotRender()}
        >
          <span className={styles.avatarLetter}>
            {user.name[0].charAt(0).toUpperCase()}
          </span>
        </Avatar>
      </a>
    </Link>
  );
};

export default UserAvatar;
