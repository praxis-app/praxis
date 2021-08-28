import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import {
  CardActions,
  createStyles,
  Divider,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { Favorite, Comment, Reply } from "@material-ui/icons";
import { useRouter } from "next/router";

import { focusVar, toastVar } from "../../apollo/client/localState";
import {
  LIKES_BY_POST_ID,
  TOTAL_COMMENTS_BY_POST_ID,
} from "../../apollo/client/queries";
import {
  FocusTargets,
  ResourcePaths,
  ToastStatus,
} from "../../constants/common";
import styles from "../../styles/Shared/CardFooter.module.scss";
import { noCache } from "../../utils/apollo";
import Messages from "../../utils/messages";
import ActionButton from "../Shared/ActionButton";
import ActionLikeButton from "../Likes/ActionLikeButton";

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      justifyContent: "space-around",
    },
  })
);

export const toCommentsQuery = "?comments=true";
export const toFocusQuery = "&focus=true";

interface Props {
  postId: string;
}

const CardFooter = ({ postId }: Props) => {
  const [likes, setLikes] = useState<Like[]>([]);
  const [totalComments, setTotalComments] = useState<number>(0);
  const queryPayload = {
    variables: { postId },
    ...noCache,
  };
  const likesByPostIdRes = useQuery(LIKES_BY_POST_ID, queryPayload);
  const totalCommentsRes = useQuery(TOTAL_COMMENTS_BY_POST_ID, queryPayload);
  const classes = useStyles();
  const router = useRouter();

  const postPagePath = `${ResourcePaths.Post}${postId}`;

  useEffect(() => {
    if (postId && likesByPostIdRes.data)
      setLikes(likesByPostIdRes.data.likesByPostId);
  }, [likesByPostIdRes.data]);

  useEffect(() => {
    if (totalCommentsRes.data)
      setTotalComments(totalCommentsRes.data.commentsByPostId.totalComments);
  }, [totalCommentsRes.data]);

  const onPostPage = (): boolean => {
    return router.asPath.includes(ResourcePaths.Post);
  };

  return (
    <>
      <div className={styles.totalsContainer}>
        <Typography>
          {!!likes.length && (
            <>
              <span className={styles.likeChip}>
                <Favorite
                  color="primary"
                  style={{
                    marginLeft: 5,
                    fontSize: 13,
                  }}
                />
              </span>
              {likes.length}
            </>
          )}
        </Typography>
        {!!totalComments && (
          <Link href={postPagePath} passHref>
            <a>
              <Typography className={styles.totalCommentsLink}>
                {Messages.comments.totalComments(totalComments)}
              </Typography>
            </a>
          </Link>
        )}
      </div>

      <Divider variant="middle" />

      <CardActions classes={classes}>
        <ActionLikeButton postId={postId} likes={likes} setLikes={setLikes} />

        <ActionButton
          href={
            onPostPage()
              ? undefined
              : postPagePath + toCommentsQuery + toFocusQuery
          }
          onClick={() => {
            if (onPostPage()) focusVar(FocusTargets.CommentFormTextField);
          }}
        >
          <Comment
            color="primary"
            style={{
              marginRight: 7.5,
              transform: "rotateY(180deg)",
            }}
          />
          {Messages.comments.actions.comment()}
        </ActionButton>

        <ActionButton
          onClick={() =>
            toastVar({
              title: Messages.development.notImplemented(),
              status: ToastStatus.Info,
            })
          }
        >
          <Reply
            color="primary"
            style={{
              marginRight: 7.5,
              transform: "rotateY(180deg)",
            }}
          />
          {Messages.actions.share()}
        </ActionButton>
      </CardActions>
    </>
  );
};

export default CardFooter;
