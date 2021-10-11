import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { makeStyles, createStyles, withStyles } from "@material-ui/core/styles";
import {
  Typography,
  Card,
  CardHeader,
  CardContent as MUICardContent,
  CardActions,
} from "@material-ui/core";

import FollowButton from "../Follows/FollowButton";
import ItemMenu from "../Shared/ItemMenu";
import UserAvatar from "./Avatar";
import {
  ModelNames,
  NavigationPaths,
  ResourcePaths,
} from "../../constants/common";
import {
  useCurrentUser,
  useHasPermissionGlobally,
  useFollowersByUserId,
} from "../../hooks";
import { GlobalPermissions } from "../../constants/role";
import Messages from "../../utils/messages";
import { FOLLOWING } from "../../apollo/client/queries";
import { noCache, formatDate } from "../../utils/clientIndex";
import { WHITE } from "../../styles/Shared/theme";

const useStyles = makeStyles(() =>
  createStyles({
    lessPadding: {
      paddingBottom: 8,
    },
    subheader: {
      color: "rgb(195, 195, 195)",
    },
  })
);

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

const Show = ({ user, deleteUser }: Props) => {
  const { id, name, bio, createdAt } = user;
  const currentUser = useCurrentUser();
  const [followers, setFollowers] = useFollowersByUserId(id);
  const [following, setFollowing] = useState<ClientFollow[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const followingRes = useQuery(FOLLOWING, {
    variables: { userId: id },
    ...noCache,
  });
  const [canManageUsers] = useHasPermissionGlobally(
    GlobalPermissions.ManageUsers
  );
  const classes = useStyles();
  const signUpDate = formatDate(createdAt, false);

  useEffect(() => {
    if (followingRes.data) setFollowing(followingRes.data.userFollowing);
  }, [followingRes.data]);

  const ownUser = (): boolean => {
    if (currentUser && user && currentUser.id === user.id) return true;
    return false;
  };

  return (
    <Card>
      <CardHeader
        avatar={<UserAvatar user={user} />}
        action={
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
        }
        title={
          <Link href={`${ResourcePaths.User}${name}`}>
            <a>{name}</a>
          </Link>
        }
        subheader={Messages.users.joinedWithDate(signUpDate)}
        classes={{
          subheader: classes.subheader,
          root: classes.lessPadding,
        }}
      />

      <CardContent>
        {bio && <Typography style={{ marginBottom: 6 }}>{bio}</Typography>}

        <Link href={`${ResourcePaths.User}${name}${NavigationPaths.Followers}`}>
          <a>{Messages.users.followersWithSize(followers.length)}</a>
        </Link>

        <span style={{ color: WHITE }}>{Messages.middotWithSpaces()}</span>

        <Link href={`${ResourcePaths.User}${name}${NavigationPaths.Following}`}>
          <a>{Messages.users.followingWithSize(following.length)}</a>
        </Link>
      </CardContent>

      {currentUser && !ownUser() && (
        <CardActions style={{ marginBottom: 6, paddingTop: 0 }}>
          <FollowButton
            userId={id}
            followers={followers}
            setFollowers={setFollowers}
          />
        </CardActions>
      )}
    </Card>
  );
};

export default Show;
