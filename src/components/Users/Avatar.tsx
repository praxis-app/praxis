import { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import Link from "next/link";
import {
  Avatar as MUIAvatar,
  Badge,
  CircularProgress,
  createStyles,
  Theme,
  withStyles,
} from "@material-ui/core";
import { CSSProperties } from "@material-ui/styles";

import { baseUrl, noCache } from "../../utils/clientIndex";
import { PROFILE_PICTURE } from "../../apollo/client/queries";
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
  image?: File;
  badge?: boolean;
  badgeContent?: React.ReactChild;
  onClick?: () => void;
  style?: CSSProperties;
}

const UserAvatar = ({
  user,
  withoutLink,
  image,
  badge,
  badgeContent,
  small,
  style,
  onClick,
}: Props) => {
  const [profilePicture, setProfilePicture] = useState<ClientImage>();
  const [getProfilePictureRes, profilePictureRes] = useLazyQuery(
    PROFILE_PICTURE,
    noCache
  );
  const size = small ? { width: 25, height: 25 } : {};

  useEffect(() => {
    if (user) getProfilePictureRes({ variables: { userId: user.id } });
  }, [user]);

  useEffect(() => {
    if (profilePictureRes.data)
      setProfilePicture(profilePictureRes.data.profilePicture);
  }, [profilePictureRes.data]);

  const AvatarInner = () => (
    <MUIAvatar
      style={{
        ...size,
        ...style,
        color: BLACK,
        backgroundColor: profilePicture ? BLACK : WHITE,
        ...(!withoutLink && { cursor: "pointer" }),
      }}
      src={image ? URL.createObjectURL(image) : baseUrl + profilePicture?.path}
      onClick={() => (onClick ? onClick() : {})}
    >
      {profilePictureRes.loading && <CircularProgress size={10} />}
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
