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
import { TOTAL_COMMENTS_BY_MOTION_ID } from "../../apollo/client/queries";
import { Common } from "../../constants";
import styles from "../../styles/Shared/CardFooter.module.scss";
import { BLURPLE } from "../../styles/Shared/theme";
import { noCache } from "../../utils/apollo";
import Messages from "../../utils/messages";
import { useCurrentUser } from "../../hooks";
import ActionButton from "../Shared/ActionButton";
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
  votes: Vote[];
  setVotes: (votes: Vote[]) => void;
  modelOfConsensus: boolean;
}

const CardFooter = ({ motionId, votes, setVotes, modelOfConsensus }: Props) => {
  const currentUser = useCurrentUser();
  const [totalComments, setTotalComments] = useState<number>(0);
  const queryPayload = {
    variables: { motionId },
    ...noCache,
  };
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const totalCommentsRes = useQuery(TOTAL_COMMENTS_BY_MOTION_ID, queryPayload);
  const classes = useStyles();
  const router = useRouter();

  const motionPagePath = `${Common.ResourcePaths.Motion}${motionId}`;
  const toCommentsQuery = "?comments=true";
  const toFocusQuery = "&focus=true";

  useEffect(() => {
    if (totalCommentsRes.data)
      setTotalComments(totalCommentsRes.data.commentsByMotionId.totalComments);
  }, [totalCommentsRes.data]);

  const alreadyVote = (): Vote | null => {
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
    return router.asPath.includes(Common.ResourcePaths.Motion);
  };

  const voteButtonColor = alreadyVote() ? { color: BLURPLE } : {};

  return (
    <>
      <div className={styles.totalsContainer}>
        <VoteChips votes={votes} />

        {!!totalComments && (
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
        <ActionButton onClick={handleVoteButtonClick}>
          <HowToVote
            color="primary"
            style={{
              marginRight: 7.5,
              ...voteButtonColor,
            }}
          />
          <span style={voteButtonColor}>{Messages.votes.actions.vote()}</span>
        </ActionButton>

        <ActionButton
          href={
            onMotionPage()
              ? undefined
              : motionPagePath + toCommentsQuery + toFocusQuery
          }
          onClick={() => {
            if (onMotionPage()) {
              tabVar(1);
              focusVar(Common.FocusTargets.CommentFormTextField);
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
        </ActionButton>

        <ActionButton
          onClick={() =>
            toastVar({
              title: Messages.development.notImplemented(),
              status: Common.ToastStatus.Info,
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
