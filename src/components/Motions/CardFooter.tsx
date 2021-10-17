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
import { HowToVote, Comment, Reply } from "@material-ui/icons";
import { useRouter } from "next/router";

import { focusVar, tabVar, toastVar } from "../../apollo/client/localState";
import {
  FocusTargets,
  ResourcePaths,
  ToastStatus,
} from "../../constants/common";
import { TOTAL_COMMENTS_BY_MOTION_ID } from "../../apollo/client/queries";
import { toCommentsQuery, toFocusQuery } from "../Posts/CardFooter";
import styles from "../../styles/Shared/CardFooter.module.scss";
import { BLURPLE } from "../../styles/Shared/theme";
import { noCache } from "../../utils/apollo";
import Messages from "../../utils/messages";
import { useCurrentUser } from "../../hooks";
import CardFooterButton from "../Shared/CardFooterButton";
import ConsensusMenu from "../Votes/ConsensusMenu";
import VoteMenu from "../Votes/VoteMenu";
import VoteChips from "../Votes/Chips";

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      justifyContent: "space-around",
    },
  })
);

interface Props {
  motionId: string;
  votes: ClientVote[];
  setVotes: (votes: ClientVote[]) => void;
  modelOfConsensus: boolean;
  ratified: boolean;
}

const CardFooter = ({
  motionId,
  votes,
  setVotes,
  modelOfConsensus,
  ratified,
}: Props) => {
  const currentUser = useCurrentUser();
  const [totalComments, setTotalComments] = useState(0);
  const queryPayload = {
    variables: { motionId },
    ...noCache,
  };
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const totalCommentsRes = useQuery(TOTAL_COMMENTS_BY_MOTION_ID, queryPayload);
  const classes = useStyles();
  const router = useRouter();

  const motionPagePath = `${ResourcePaths.Motion}${motionId}`;

  useEffect(() => {
    if (totalCommentsRes.data)
      setTotalComments(totalCommentsRes.data.commentsByMotionId.totalComments);
  }, [totalCommentsRes.data]);

  const alreadyVote = (): ClientVote | null => {
    if (!currentUser) return null;
    const vote = votes.find((vote) => vote.userId === currentUser.id);
    if (vote) return vote;
    return null;
  };

  const handleVoteButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setMenuAnchorEl(null);
  };

  const onMotionPage = (): boolean => {
    return router.asPath.includes(ResourcePaths.Motion);
  };

  const voteButtonColor = alreadyVote() ? { color: BLURPLE } : {};

  return (
    <>
      <div className={styles.totalsContainer}>
        <VoteChips votes={votes} />

        {Boolean(totalComments) && (
          <Link href={motionPagePath + toCommentsQuery} passHref>
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
        {ratified && (
          <CardFooterButton
            href={onMotionPage() ? undefined : motionPagePath}
            onClick={() => {
              if (onMotionPage()) {
                toastVar({
                  title: Messages.motions.toasts.ratifiedInfo(),
                  status: ToastStatus.Info,
                });
                tabVar(0);
              }
            }}
          >
            <HowToVote
              color="primary"
              style={{
                marginRight: 7.5,
                ...voteButtonColor,
              }}
            />
            <span style={voteButtonColor}>{Messages.motions.ratified()}</span>
          </CardFooterButton>
        )}

        {!ratified && (
          <CardFooterButton onClick={handleVoteButtonClick}>
            <HowToVote
              color="primary"
              style={{
                marginRight: 7.5,
                ...voteButtonColor,
              }}
            />
            <span style={voteButtonColor}>{Messages.votes.actions.vote()}</span>
          </CardFooterButton>
        )}

        <CardFooterButton
          href={
            onMotionPage()
              ? undefined
              : motionPagePath + toCommentsQuery + toFocusQuery
          }
          onClick={() => {
            if (onMotionPage()) {
              tabVar(1);
              focusVar(FocusTargets.CommentFormTextField);
            }
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
        </CardFooterButton>

        <CardFooterButton
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
        </CardFooterButton>
      </CardActions>

      {modelOfConsensus ? (
        <ConsensusMenu
          motionId={motionId}
          votes={votes}
          setVotes={setVotes}
          anchorEl={menuAnchorEl}
          handleClose={handleClose}
        />
      ) : (
        <VoteMenu
          motionId={motionId}
          votes={votes}
          setVotes={setVotes}
          anchorEl={menuAnchorEl}
          handleClose={handleClose}
        />
      )}
    </>
  );
};

export default CardFooter;
