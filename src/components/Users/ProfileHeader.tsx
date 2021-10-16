import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import {
  Card,
  CardHeader as MUICardHeader,
  CardContent as MUICardContent,
  withStyles,
  createStyles,
  Typography,
} from "@material-ui/core";

import FollowButton from "../Follows/FollowButton";
import ItemMenu from "../Shared/ItemMenu";
import { COVER_PHOTO_BY_USER_ID, FOLLOWING } from "../../apollo/client/queries";
import {
  ModelNames,
  NavigationPaths,
  ResourcePaths,
} from "../../constants/common";
import {
  useCurrentUser,
  useHasPermissionGlobally,
  useFollowersByUserId,
  useIsMobile,
} from "../../hooks";
import Messages from "../../utils/messages";
import { formatDate, noCache } from "../../utils/clientIndex";
import { GlobalPermissions } from "../../constants/role";
import CoverPhoto from "../Images/CoverPhoto";
import UserAvatar from "./Avatar";
import muiTheme, { WHITE } from "../../styles/Shared/theme";
import { DateRange as CalendarIcon } from "@material-ui/icons";

const CardHeader = withStyles(() =>
  createStyles({
    action: {
      marginTop: -4,
      marginRight: -6,
    },
  })
)(MUICardHeader);

const CardContent = withStyles(() =>
  createStyles({
    root: {
      marginTop: 6,
      paddingTop: 0,
      "&:last-child": {
        paddingBottom: 16,
      },
    },
  })
)(MUICardContent);

interface Props {
  user: ClientUser;
  deleteUser: (id: string) => void;
}

const ProfileHeader = ({ user, deleteUser }: Props) => {
  const { name, bio, id, createdAt } = user;
  const byUserId = {
    variables: { userId: id },
    ...noCache,
  };
  const currentUser = useCurrentUser();
  const [followers, setFollowers] = useFollowersByUserId(id);
  const [following, setFollowing] = useState<ClientFollow[]>([]);
  const [coverPhoto, setCoverPhoto] = useState<ClientImage>();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const coverPhotoRes = useQuery(COVER_PHOTO_BY_USER_ID, byUserId);
  const followingRes = useQuery(FOLLOWING, byUserId);
  const [canManageUsers] = useHasPermissionGlobally(
    GlobalPermissions.ManageUsers
  );
  const isMobile = useIsMobile();
  const avatarSize = isMobile ? 80 : 140;
  const signUpDate = formatDate(createdAt, false);

  useEffect(() => {
    if (followingRes.data) setFollowing(followingRes.data.userFollowing);
  }, [followingRes.data]);

  useEffect(() => {
    if (coverPhotoRes.data)
      setCoverPhoto(coverPhotoRes.data.coverPhotoByUserId);
  }, [coverPhotoRes.data]);

  const ownUser = (): boolean => {
    if (currentUser && user && currentUser.id === user.id) return true;
    return false;
  };

  return (
    <Card>
      <CoverPhoto path={coverPhoto?.path} />

      <CardHeader
        action={
          <>
            <FollowButton
              userId={id}
              followers={followers}
              setFollowers={setFollowers}
            />
            <ItemMenu
              name={name}
              itemId={id}
              itemType={ModelNames.User}
              anchorEl={menuAnchorEl}
              setAnchorEl={setMenuAnchorEl}
              deleteItem={deleteUser}
              canEdit={ownUser()}
              canDelete={ownUser() || canManageUsers}
            />
          </>
        }
        style={{ paddingBottom: 6 }}
      />

      <div style={{ marginLeft: 12, marginTop: isMobile ? -110 : -135 }}>
        <UserAvatar
          user={user}
          style={{
            width: avatarSize,
            height: avatarSize,
            border: `4px solid ${muiTheme.palette.background.paper}`,
          }}
        />
      </div>

      <CardContent>
        <Typography color="primary" variant="h5" style={{ marginBottom: 6 }}>
          {name}
        </Typography>

        {bio && <Typography style={{ marginBottom: 12 }}>{bio}</Typography>}

        <Typography style={{ marginBottom: 12 }}>
          <CalendarIcon
            fontSize="small"
            style={{ marginRight: "0.3ch", marginBottom: -3 }}
          />
          {Messages.users.joinedWithDate(signUpDate)}
        </Typography>

        {Boolean(followers.length + following.length) && (
          <Typography>
            <Link
              href={`${ResourcePaths.User}${name}${NavigationPaths.Followers}`}
            >
              <a>{Messages.users.followersWithSize(followers.length)}</a>
            </Link>

            <span style={{ color: WHITE }}>{Messages.middotWithSpaces()}</span>

            <Link
              href={`${ResourcePaths.User}${name}${NavigationPaths.Following}`}
            >
              <a>{Messages.users.followingWithSize(following.length)}</a>
            </Link>
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
