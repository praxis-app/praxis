import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useLazyQuery } from "@apollo/client";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  makeStyles,
  CardHeader,
  CardMedia,
} from "@material-ui/core";

import ImagesList from "../../Images/List";
import { GROUP, IMAGES_BY_POST_ID } from "../../../apollo/client/queries";
import LikeButton from "../../Likes/LikeButton";
import UserAvatar from "../../Users/Avatar";
import ItemMenu from "../../Shared/ItemMenu";
import styles from "../../styles/Shared/Shared.module.scss";
import GroupItemAvatar from "../../Groups/ItemAvatar";
import { Common, Roles } from "../../../constants";
import {
  useCurrentUser,
  useHasPermissionGlobally,
  useUserById,
} from "../../../hooks";
import { noCache } from "../../../utils/clientIndex";

const useStyles = makeStyles({
  title: {
    marginLeft: "-5px",
  },
});

interface Props {
  post: Post;
  deletePost: (id: string) => void;
  timeAgo: any;
}

const Post = ({ post, deletePost, timeAgo }: Props) => {
  const { id, userId, groupId, postGroupId, body, createdAt } = post;
  const currentUser = useCurrentUser();
  const [canManagePosts] = useHasPermissionGlobally(
    Roles.Permissions.ManagePosts
  );
  const user = useUserById(userId);
  const [group, setGroup] = useState<Group>();
  const [images, setImages] = useState<Image[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [getGroupRes, groupRes] = useLazyQuery(GROUP);
  const imagesRes = useQuery(IMAGES_BY_POST_ID, {
    variables: { postId: id },
    ...noCache,
  });
  const classes = useStyles();
  const router = useRouter();

  useEffect(() => {
    if (imagesRes.data) setImages(imagesRes.data.imagesByPostId);
  }, [imagesRes.data]);

  useEffect(() => {
    if (groupRes.data) setGroup(groupRes.data.group);
  }, [groupRes.data]);

  useEffect(() => {
    if (groupId || postGroupId) {
      getGroupRes({
        variables: { id: groupId ? groupId : postGroupId },
      });
    }
  }, [groupId, postGroupId]);

  const ownPost = (): boolean => {
    if (currentUser && user && currentUser.id === user.id) return true;
    return false;
  };

  const onGroupPage = (): boolean => {
    return router.asPath.includes("/groups/");
  };

  return (
    <div key={id}>
      <Card>
        <CardHeader
          avatar={
            group && !onGroupPage()
              ? user && (
                  <GroupItemAvatar user={user} group={group} post={post} />
                )
              : user && <UserAvatar user={user} />
          }
          title={
            (!group || onGroupPage()) && (
              <>
                <Link href={`/users/${user?.name}`}>
                  <a>{user?.name}</a>
                </Link>
                <Link href={`/posts/${id}`}>
                  <a className={styles.timeAgo}>{timeAgo(createdAt)}</a>
                </Link>
              </>
            )
          }
          action={
            <ItemMenu
              itemId={id}
              itemType={Common.ModelNames.Post}
              anchorEl={menuAnchorEl}
              setAnchorEl={setMenuAnchorEl}
              deleteItem={deletePost}
              ownItem={ownPost}
              hasPermission={canManagePosts}
            />
          }
          classes={{ title: classes.title }}
        />

        {body && (
          <CardContent>
            <Typography
              style={{
                marginTop: "-12px",
              }}
            >
              {body}
            </Typography>
          </CardContent>
        )}

        <CardMedia>
          <ImagesList images={images} />
        </CardMedia>

        {currentUser && (
          <CardActions style={{ marginTop: "6px" }}>
            <LikeButton postId={id} />
          </CardActions>
        )}
      </Card>
    </div>
  );
};

export default Post;
