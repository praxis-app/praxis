import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import {
  Avatar,
  Badge,
  createStyles,
  makeStyles,
  Theme,
  withStyles,
} from "@material-ui/core";

import baseUrl from "../../utils/baseUrl";
import { CURRENT_PROFILE_PICTURE } from "../../apollo/client/queries";
import Messages from "../../utils/messages";
import styles from "../../styles/User/User.module.scss";
import { noCache } from "../../utils/apollo";
import { DESKTOP_BREAKPOINT } from "../../constants/common";
import { BLACK, BLURPLE, WHITE } from "../../styles/Shared/theme";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      [theme.breakpoints.down(DESKTOP_BREAKPOINT)]: {
        width: 25,
        height: 25,
      },
    },
  })
);

const BadgeAvatar = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 17.5,
      height: 17.5,
      border: `2px solid ${theme.palette.background.default}`,
      backgroundColor: BLURPLE,
    },
  })
)(Avatar);

interface Props {
  user: User;
  responsive?: boolean;
  badge?: boolean;
  badgeContent?: React.ReactChild;
}

const UserAvatar = ({ user, responsive, badge, badgeContent }: Props) => {
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

  if (profilePictureRes.loading) return <></>;

  const AvatarInner = () => {
    return (
      <Avatar
        style={{
          color: BLACK,
          backgroundColor: profilePicture ? BLACK : WHITE,
        }}
        classes={responsive ? { root: classes.root } : {}}
        src={baseUrl + profilePicture?.path}
        alt={Messages.images.couldNotRender()}
      >
        <span className={styles.avatarLetter}>
          {user.name[0].charAt(0).toUpperCase()}
        </span>
      </Avatar>
    );
  };

  return (
    <Link href={`/users/${user.name}`}>
      <a>
        {badge ? (
          <Badge
            overlap="circular"
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            badgeContent={
              <BadgeAvatar alt={user.name}>{badgeContent}</BadgeAvatar>
            }
          >
            <AvatarInner />
          </Badge>
        ) : (
          <AvatarInner />
        )}
      </a>
    </Link>
  );
};

export default UserAvatar;
