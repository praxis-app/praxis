import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import {
  Card,
  CardContent,
  Typography,
  makeStyles,
  CardHeader,
  CardMedia,
  CardActionArea,
} from "@material-ui/core";

import ImagesList from "../Images/List";
import { IMAGES_BY_POST_ID } from "../../apollo/client/queries";
import UserAvatar from "../Users/Avatar";
import ItemMenu from "../Shared/ItemMenu";
import styles from "../../styles/Shared/Shared.module.scss";
import GroupItemAvatar from "../Groups/ItemAvatar";
import { ModelNames, ResourcePaths } from "../../constants/common";
import { GlobalPermissions, GroupPermissions } from "../../constants/role";
import {
  useCurrentUser,
  useEventById,
  useGroupById,
  useHasPermissionByGroupId,
  useHasPermissionGlobally,
  useUserById,
} from "../../hooks";
import { noCache, timeAgo } from "../../utils/clientIndex";
import CardFooter from "./CardFooter";
import EventItemAvatar from "../Events/ItemAvatar";

const useStyles = makeStyles({
  cardHeaderTitle: {
    marginLeft: -5,
  },
  bodyTypographyRoot: {
    marginTop: -12,
  },
});

interface Props {
  post: ClientPost;
  deletePost: (id: string) => void;
}

const Post = ({ post, deletePost }: Props) => {
  const { id, userId, groupId, eventId, postGroupId, body, createdAt } = post;
  const currentUser = useCurrentUser();
  const [canManagePostsGlobally] = useHasPermissionGlobally(
    GlobalPermissions.ManagePosts
  );
  const [canManagePostsByGroup] = useHasPermissionByGroupId(
    GroupPermissions.ManagePosts,
    groupId
  );
  const [user] = useUserById(userId);
  const [event] = useEventById(eventId);
  const [group] = useGroupById(groupId ? groupId : postGroupId);
  const [images, setImages] = useState<ClientImage[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const imagesRes = useQuery(IMAGES_BY_POST_ID, {
    variables: { postId: id },
    ...noCache,
  });
  const classes = useStyles();
  const router = useRouter();

  useEffect(() => {
    if (imagesRes.data) setImages(imagesRes.data.imagesByPostId);
  }, [imagesRes.data]);

  const ownPost = (): boolean => {
    if (currentUser && user && currentUser.id === user.id) return true;
    return false;
  };

  const onGroupPage = (): boolean => {
    return router.asPath.includes(ResourcePaths.Group);
  };

  const onEventPage = (): boolean => {
    return router.asPath.includes(ResourcePaths.Event);
  };

  return (
    <div key={id}>
      <Card>
        <CardHeader
          avatar={
            group && !onGroupPage() ? (
              <GroupItemAvatar user={user} group={group} post={post} />
            ) : event && !onEventPage() ? (
              <EventItemAvatar user={user} event={event} post={post} />
            ) : (
              <UserAvatar user={user} />
            )
          }
          title={
            (!group || onGroupPage()) &&
            (!event || onEventPage()) && (
              <>
                <Link href={`${ResourcePaths.User}${user?.name}`}>
                  <a>{user?.name}</a>
                </Link>
                <Link href={`${ResourcePaths.Post}${id}`}>
                  <a className={styles.timeAgo}>{timeAgo(createdAt)}</a>
                </Link>
              </>
            )
          }
          action={
            <ItemMenu
              itemId={id}
              itemType={ModelNames.Post}
              anchorEl={menuAnchorEl}
              setAnchorEl={setMenuAnchorEl}
              deleteItem={deletePost}
              canEdit={ownPost()}
              canDelete={
                ownPost() || canManagePostsGlobally || canManagePostsByGroup
              }
            />
          }
          classes={{ title: classes.cardHeaderTitle }}
        />

        {body && (
          <CardContent>
            <Typography className={classes.bodyTypographyRoot}>
              {body}
            </Typography>
          </CardContent>
        )}

        <CardActionArea>
          <CardMedia>
            <ImagesList images={images} />
          </CardMedia>
        </CardActionArea>

        {currentUser && <CardFooter postId={id} />}
      </Card>
    </div>
  );
};

export default Post;
