import { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import Link from "next/link";
import {
  Avatar as MUIAvatar,
  Badge,
  createStyles,
  makeStyles,
  Theme,
  withStyles,
} from "@material-ui/core";

import baseUrl from "../../utils/baseUrl";
import { CURRENT_PROFILE_PICTURE } from "../../apollo/client/queries";
import styles from "../../styles/User/User.module.scss";
import { noCache } from "../../utils/apollo";
import { ResourcePaths } from "../../constants/common";
import { BLACK, BLURPLE, WHITE } from "../../styles/Shared/theme";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      [theme.breakpoints.down("md")]: {
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
      border: `2px solid ${theme.palette.background.paper}`,
      backgroundColor: BLURPLE,
    },
  })
)(MUIAvatar);

interface Props {
  user: User | undefined;
  small?: boolean;
  responsive?: boolean;
  withoutLink?: boolean;
  badge?: boolean;
  badgeContent?: React.ReactChild;
}

const UserAvatar = ({
  user,
  responsive,
  withoutLink,
  badge,
  badgeContent,
  small,
}: Props) => {
  const [profilePicture, setProfilePicture] = useState<Image>();
  const [getProfilePictureRes, profilePictureRes] = useLazyQuery(
    CURRENT_PROFILE_PICTURE,
    noCache
  );
  const classes = useStyles();
  const size = small ? { width: 25, height: 25 } : {};

  useEffect(() => {
    if (user) getProfilePictureRes({ variables: { userId: user.id } });
  }, [user]);

  useEffect(() => {
    if (profilePictureRes.data)
      setProfilePicture(profilePictureRes.data.currentProfilePicture);
  }, [profilePictureRes.data]);

  if (profilePictureRes.loading) return null;

  const AvatarInner = () => (
    <MUIAvatar
      style={{
        ...size,
        color: BLACK,
        backgroundColor: profilePicture ? BLACK : WHITE,
      }}
      classes={responsive ? { root: classes.root } : {}}
      src={baseUrl + profilePicture?.path}
    >
      {user && (
        <span className={styles.avatarLetter}>
          {user.name[0].charAt(0).toUpperCase()}
        </span>
      )}
    </MUIAvatar>
  );

  const Avatar = () => (
    <>
      {badge ? (
        <Badge
          overlap="circular"
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          badgeContent={
            <BadgeAvatar alt={user?.name}>{badgeContent}</BadgeAvatar>
          }
        >
          <AvatarInner />
        </Badge>
      ) : (
        <AvatarInner />
      )}
    </>
  );

  if (withoutLink) return <Avatar />;

  return (
    <Link href={`${ResourcePaths.User}${user?.name}`}>
      <a>
        <Avatar />
      </a>
    </Link>
  );
};

export default UserAvatar;
