import { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import Link from "next/link";
import {
  Avatar as MUIAvatar,
  Badge,
  createStyles,
  Theme,
  withStyles,
} from "@material-ui/core";

import baseUrl from "../../utils/baseUrl";
import { CURRENT_PROFILE_PICTURE } from "../../apollo/client/queries";
import { noCache } from "../../utils/apollo";
import { ResourcePaths } from "../../constants/common";
import { BLACK, BLURPLE, WHITE } from "../../styles/Shared/theme";

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
  user: ClientUser | undefined;
  small?: boolean;
  withoutLink?: boolean;
  badge?: boolean;
  badgeContent?: React.ReactChild;
  onClick?: () => void;
}

const UserAvatar = ({
  user,
  withoutLink,
  badge,
  badgeContent,
  small,
  onClick,
}: Props) => {
  const [profilePicture, setProfilePicture] = useState<ClientImage>();
  const [getProfilePictureRes, profilePictureRes] = useLazyQuery(
    CURRENT_PROFILE_PICTURE,
    noCache
  );
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
        cursor: "pointer",
      }}
      src={baseUrl + profilePicture?.path}
      onClick={() => (onClick ? onClick() : {})}
    />
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
